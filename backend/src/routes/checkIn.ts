// backend/src/routes/checkIn.ts - WITH GEMINI API
import { createHash } from 'crypto';
import { Router } from 'express';
import { supabase } from '../config/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Convert email or other string to a valid UUID for DB storage. */
function toStoredUserId(id: string): string {
  if (UUID_REGEX.test(id)) return id;
  const hash = createHash('sha256').update(id).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
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

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse Gemini's response
    let geminiResponse;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      geminiResponse = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error('Invalid response from AI');
    }

    // Extract workout IDs - validate they are real UUIDs (Gemini can hallucinate wrong values)
    const validWorkoutIds = new Set((allWorkouts || []).map((w: any) => String(w.id)));
    const recommendedWorkoutIds = geminiResponse.recommendations
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
      gemini_insights: geminiResponse
    });
  } catch (error: any) {
    console.error('Error processing check-in:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process check-in'
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