// backend/src/routes/checkIn.ts - WITH GEMINI API
import { createHash } from 'crypto';
import { Router } from 'express';
import { supabase } from '../config/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Gemini when configured.
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRANSIENT_GEMINI_RETRY_LIMIT = 1;
const MAX_RETRY_DELAY_MS = 30_000;

const LOCAL_WORKOUTS: Record<string, any>[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    title: 'Gentle Prenatal Stretch Flow',
    youtube_url: 'https://www.youtube.com/watch?v=4C-gxOE0j7s',
    youtube_id: '4C-gxOE0j7s',
    duration: 12,
    intensity_level: 'low',
    workout_type: 'stretching',
    description: 'A calming, low-impact stretch sequence to reduce stiffness and improve mobility.',
    good_for_symptoms: ['back_pain', 'sciatica_pain', 'fatigue'],
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    title: 'Prenatal Breathing and Relaxation',
    youtube_url: 'https://www.youtube.com/watch?v=SEfs5TJZ6Nk',
    youtube_id: 'SEfs5TJZ6Nk',
    duration: 10,
    intensity_level: 'low',
    workout_type: 'mindfulness',
    description: 'Breathing exercises and gentle movement to reduce anxiety and support recovery.',
    good_for_symptoms: ['headaches', 'nausea', 'weak_in_general'],
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    title: 'Low-Impact Prenatal Cardio Walk',
    youtube_url: 'https://www.youtube.com/watch?v=2vQz8TnJ4xQ',
    youtube_id: '2vQz8TnJ4xQ',
    duration: 18,
    intensity_level: 'medium',
    workout_type: 'cardio',
    description: 'Moderate-paced prenatal cardio to boost circulation and energy safely.',
    good_for_symptoms: ['fatigue', 'bloating', 'weakness'],
  },
  {
    id: '00000000-0000-0000-0000-000000000104',
    title: 'Prenatal Core and Posture Basics',
    youtube_url: 'https://www.youtube.com/watch?v=Cc_vRDbp7JE',
    youtube_id: 'Cc_vRDbp7JE',
    duration: 15,
    intensity_level: 'medium',
    workout_type: 'strength',
    description: 'Foundational prenatal-safe core and posture work for better daily comfort.',
    good_for_symptoms: ['back_pain', 'weak_in_general', 'weak_legs'],
  },
  {
    id: '00000000-0000-0000-0000-000000000105',
    title: 'Prenatal Yoga for Morning Sickness Relief',
    youtube_url: 'https://www.youtube.com/watch?v=lM6I7mQvX7M',
    youtube_id: 'lM6I7mQvX7M',
    duration: 14,
    intensity_level: 'low',
    workout_type: 'yoga',
    description: 'Gentle poses focused on nausea relief, calm breathing, and full-body reset.',
    good_for_symptoms: ['morning_sickness', 'nausea', 'headaches'],
  },
  {
    id: '00000000-0000-0000-0000-000000000106',
    title: 'Prenatal Mobility for Hips and Legs',
    youtube_url: 'https://www.youtube.com/watch?v=8M0wQf2pA5k',
    youtube_id: '8M0wQf2pA5k',
    duration: 16,
    intensity_level: 'low',
    workout_type: 'mobility',
    description: 'Hip and leg mobility routine to improve comfort and reduce tension.',
    good_for_symptoms: ['sciatica_pain', 'weak_legs', 'stomach_pain'],
  },
];

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
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

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

    // Get workouts from Supabase when configured, otherwise use local catalog.
    let allWorkouts: Record<string, any>[] = LOCAL_WORKOUTS;
    if (supabase) {
      const { data, error: workoutsError } = await supabase
        .from('workouts')
        .select('*');

      if (workoutsError) throw workoutsError;
      allWorkouts = data || [];
    }

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
    let recommendedWorkouts: Record<string, any>[] = [];
    if (supabase) {
      const { data, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .in('id', idsToUse);

      if (fetchError) throw fetchError;
      recommendedWorkouts = data || [];
    } else {
      recommendedWorkouts = idsToUse
        .map((id: string) => allWorkouts.find((workout) => String(workout.id) === id))
        .filter(Boolean) as Record<string, any>[];
    }

    // Save check-in only when Supabase is configured.
    let checkIn: { id: string; created_at: string } | null = null;
    if (supabase) {
      const { data, error: checkInError } = await supabase
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
      checkIn = data as { id: string; created_at: string };
    } else {
      checkIn = { id: `local-${Date.now()}`, created_at: new Date().toISOString() };
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
      used_fallback_recommendations: usedFallbackRecommendations,
      data_source: supabase ? 'supabase' : 'local-fallback',
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
    if (!supabase) {
      return res.json({ success: true, history: [] });
    }

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
