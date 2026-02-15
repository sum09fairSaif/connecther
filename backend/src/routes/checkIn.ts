// backend/src/routes/checkIn.ts - WITH GEMINI API
import { createHash } from 'crypto';
import { Router } from 'express';
import { supabase } from '../config/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRANSIENT_GEMINI_RETRY_LIMIT = 1;
const MAX_RETRY_DELAY_MS = 30_000;

/** Convert email or other string to a valid UUID for DB storage. */
function toStoredUserId(id: string): string {
  if (UUID_REGEX.test(id)) return id;
  const hash = createHash('sha256').update(id).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
    .filter(Boolean);
}

function parseRetryDelayMs(errorMessage: string): number | null {
  // Supports both "retryDelay":"20s" and "Please retry in 20.8s" variants.
  const retryDelayMatch = errorMessage.match(/retryDelay["']?\s*:\s*["']?(\d+(?:\.\d+)?)s/i);
  const retryInMatch = errorMessage.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
  const seconds = retryDelayMatch?.[1] || retryInMatch?.[1];
  if (!seconds) return null;
  const ms = Math.ceil(Number(seconds) * 1000);
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return Math.min(ms, MAX_RETRY_DELAY_MS);
}

function isRateLimitError(errorMessage: string): boolean {
  return (
    errorMessage.includes('429') ||
    errorMessage.toLowerCase().includes('too many requests') ||
    errorMessage.toLowerCase().includes('quota exceeded')
  );
}

function isDailyQuotaError(errorMessage: string): boolean {
  return /perday|daily|GenerateRequestsPerDayPerProjectPerModel-FreeTier/i.test(errorMessage);
}

function scoreWorkout(
  workout: Record<string, any>,
  selectedSymptoms: string[],
  selectedMoods: string[],
  energyLevel: number,
): number {
  let score = 0;
  const intensityValue =
    typeof workout.intensity_level === 'number'
      ? workout.intensity_level
      : Number(workout.intensity_level) || 2;
  const desiredIntensity = energyLevel <= 2 ? 1 : energyLevel === 3 ? 2 : 3;
  score += Math.max(0, 3 - Math.abs(intensityValue - desiredIntensity));

  const workoutSymptoms = normalizeTextArray(workout.good_for_symptoms);
  const symptomOverlap = selectedSymptoms.filter((s) => workoutSymptoms.includes(s)).length;
  score += symptomOverlap * 3;

  const typeText = `${String(workout.workout_type || '')} ${String(workout.title || '')}`.toLowerCase();
  const wantsCalming = selectedMoods.some((m) => ['anxious', 'fear', 'moody', 'frustrated'].includes(m));
  const wantsActive = selectedMoods.some((m) => ['energetic', 'productive', 'happy'].includes(m));
  if (wantsCalming && /(yoga|stretch|breath|calm|mobility)/.test(typeText)) score += 2;
  if (wantsActive && /(cardio|strength|pilates|active)/.test(typeText)) score += 2;

  return score;
}

function buildFallbackRecommendations(
  allWorkouts: Record<string, any>[],
  symptoms: string[],
  moods: string[],
  energyLevel: number,
) {
  const normalizedSymptoms = normalizeTextArray(symptoms);
  const normalizedMoods = normalizeTextArray(moods);

  const sorted = [...allWorkouts].sort((a, b) => {
    const scoreB = scoreWorkout(b, normalizedSymptoms, normalizedMoods, energyLevel);
    const scoreA = scoreWorkout(a, normalizedSymptoms, normalizedMoods, energyLevel);
    return scoreB - scoreA;
  });

  const top = sorted.slice(0, 3);

  return {
    recommendations: top.map((workout) => ({
      workout_id: String(workout.id),
      title: String(workout.title || 'Recommended Workout'),
      reasoning:
        'Picked based on your reported symptoms, mood, and current energy level, with first-trimester safety in mind.',
    })),
    overall_message:
      'Personalized recommendations are ready. These picks are matched to your check-in and designed to be gentle and safe.',
  };
}

async function generateGeminiResponseWithRetry(prompt: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  let attempts = 0;

  while (attempts <= TRANSIENT_GEMINI_RETRY_LIMIT) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error: any) {
      const message = String(error?.message || error || '');
      const shouldRetry =
        attempts < TRANSIENT_GEMINI_RETRY_LIMIT &&
        isRateLimitError(message) &&
        !isDailyQuotaError(message);

      if (!shouldRetry) {
        throw error;
      }

      const delayMs = parseRetryDelayMs(message) ?? 3000;
      await sleep(delayMs);
      attempts += 1;
    }
  }

  throw new Error('Gemini retry exhausted');
}

// POST /api/check-in - Submit daily check-in and get Gemini recommendations
router.post('/', async (req, res) => {
  try {
    const { user_id, energy_level, symptoms, moods, preferred_workout_type } = req.body;
    // CRITICAL: Always convert to stored format - never pass raw email to DB (UUID columns reject it)
    const storedUserId = toStoredUserId(String(user_id || 'guest'));

    // Validate required fields
    if (!user_id || !energy_level || !symptoms || !moods) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, energy_level, symptoms, moods'
      });
    }

    // Validate limits
    if (symptoms.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 symptoms allowed'
      });
    }

    if (moods.length > 3) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 3 moods allowed'
      });
    }

    // Get ALL workouts from database
    const { data: allWorkouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*');

    if (workoutsError) throw workoutsError;

    // Build prompt for Gemini
    const prompt = `You are a certified prenatal fitness expert helping a pregnant woman in her first trimester find safe workout videos.

User's Current State:
- Energy Level: ${energy_level}/5 (1=very low, 5=very high)
- Symptoms: ${symptoms.join(', ')}
- Moods: ${moods.join(', ')}
${preferred_workout_type ? `- Preferred Workout Type: ${preferred_workout_type}` : ''}

Available Workouts (JSON):
${JSON.stringify(allWorkouts, null, 2)}

Based on the user's energy level, symptoms, and moods, recommend the TOP 3 most suitable workouts from the list above.

Consider:
1. Energy level: Low energy (1-2) → low intensity, Medium (3) → medium intensity, High (4-5) → medium/high intensity
2. Symptoms: Match workouts that specifically help with their symptoms
3. Moods: If anxious/fear → calming yoga/stretching, If energetic/productive → higher intensity
4. Preferred workout type: Prioritize if specified
5. Safety: Always prioritize first-trimester safety

Respond in this EXACT JSON format (no markdown, just valid JSON):
{
  "recommendations": [
    {
      "workout_id": "uuid-here",
      "title": "workout title",
      "reasoning": "why this workout is perfect for them (2-3 sentences)"
    },
    {
      "workout_id": "uuid-here",
      "title": "workout title",
      "reasoning": "why this workout is perfect for them (2-3 sentences)"
    },
    {
      "workout_id": "uuid-here",
      "title": "workout title",
      "reasoning": "why this workout is perfect for them (2-3 sentences)"
    }
  ],
  "overall_message": "A supportive, encouraging message for the user (2-3 sentences)"
}`;

    // Call Gemini API (with retry), then fallback locally if quota/rate-limit/unavailable
    let geminiResponse: any;
    let usedFallbackRecommendations = false;
    try {
      geminiResponse = await generateGeminiResponseWithRetry(prompt);
    } catch (geminiError: any) {
      const geminiErrorMessage = String(geminiError?.message || geminiError || '');
      console.error('Gemini unavailable, using local recommendation fallback:', geminiErrorMessage);
      geminiResponse = buildFallbackRecommendations(allWorkouts || [], symptoms, moods, Number(energy_level));
      usedFallbackRecommendations = true;
    }

    // Extract workout IDs - validate they are real UUIDs (Gemini can hallucinate wrong values)
    const validWorkoutIds = new Set((allWorkouts || []).map((w: any) => String(w.id)));
    const recommendedWorkoutIds = (geminiResponse?.recommendations || [])
      .map((r: any) => r.workout_id)
      .filter((id: unknown) => typeof id === 'string' && UUID_REGEX.test(id) && validWorkoutIds.has(id));

    // Fallback: if Gemini returned invalid IDs, pick first 3 workouts
    const idsToUse =
      recommendedWorkoutIds.length >= 3
        ? recommendedWorkoutIds.slice(0, 3)
        : (allWorkouts || []).slice(0, 3).map((w: any) => w.id);

    // Get full workout details
    const { data: recommendedWorkouts, error: fetchError } = await supabase
      .from('workouts')
      .select('*')
      .in('id', idsToUse);

    if (fetchError) throw fetchError;

    // Save check-in to database with Gemini's reasoning (use storedUserId, never raw email)
    const { data: checkIn, error: checkInError } = await supabase
      .from('user_check_ins')
      .insert({
        user_id: storedUserId,
        energy_level,
        symptoms,
        moods,
        preferred_workout_type: preferred_workout_type || null,
        recommended_workout_ids: idsToUse,
        gemini_reasoning: JSON.stringify(geminiResponse)
      })
      .select()
      .single();

    if (checkInError) {
      console.error('Check-in insert failed. storedUserId:', storedUserId, 'raw user_id:', user_id);
      throw checkInError;
    }

    // Combine Gemini reasoning with workout details
    const workoutsWithReasoning = recommendedWorkouts.map((workout: any) => {
      const geminiRec = geminiResponse.recommendations.find((r: any) => r.workout_id === workout.id);
      return {
        ...workout,
        reasoning: geminiRec?.reasoning || ''
      };
    });

    return res.json({
      success: true,
      checkIn,
      check_in_id: checkIn?.id ?? '',
      recommendations: workoutsWithReasoning,
      message: geminiResponse.overall_message,
      ai_message: geminiResponse.overall_message,
      gemini_insights: geminiResponse,
      used_fallback_recommendations: usedFallbackRecommendations
    });
  } catch (error: any) {
    console.error('Error processing check-in:', error);
    const errorMessage = String(error?.message || '');
    const clientError = isRateLimitError(errorMessage)
      ? 'Recommendation service is temporarily rate-limited. Please retry shortly.'
      : error.message || 'Failed to process check-in';
    return res.status(500).json({
      success: false,
      error: clientError
    });
  }
});

// GET /api/check-in/history/:userId - Get user's check-in history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30 } = req.query;
    const storedUserId = toStoredUserId(String(userId || 'guest'));

    const { data, error } = await supabase
      .from('user_check_ins')
      .select('*')
      .eq('user_id', storedUserId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;

    // Parse Gemini reasoning for each check-in
    const historyWithParsedReasoning = data.map(checkIn => ({
      ...checkIn,
      gemini_reasoning: checkIn.gemini_reasoning ? JSON.parse(checkIn.gemini_reasoning) : null
    }));

    res.json({ success: true, history: historyWithParsedReasoning });
  } catch (error: any) {
    console.error('Error fetching check-in history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
