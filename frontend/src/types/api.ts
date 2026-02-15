// API Request/Response Types

export interface Workout {
  id: string;
  title: string;
  description: string;
  type: string;
  intensity: string;
  duration_minutes: number;
  trimester: string[];
  benefits: string[];
  video_url?: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface CheckInRequest {
  user_id: string;
  energy_level: number; // 1-5
  symptoms: string[];
  moods: string[];
  preferred_workout_type?: string;
}

export interface WorkoutRecommendation {
  workout: Workout;
  reason: string;
  match_score: number;
}

export interface CheckInResponse {
  check_in_id: string;
  recommendations: WorkoutRecommendation[];
  ai_message: string;
  created_at: string;
}

export interface CheckInHistory {
  id: string;
  user_id: string;
  energy_level: number;
  symptoms: string[];
  moods: string[];
  recommendations: WorkoutRecommendation[];
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  workout_id: string;
  workout?: Workout;
  created_at: string;
}

export interface AddFavoriteRequest {
  user_id: string;
  workout_id: string;
}

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  age?: number;
  due_date?: string;
  weeks_pregnant?: number;
  trimester?: number;
  fitness_level?: string;
  medical_conditions?: string[];
  preferences?: {
    workout_types?: string[];
    intensity_preference?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DoctorSearchResult {
  id: string;
  name: string;
  specialty: string;
  distanceMiles: number | null;
  rating: number | null;
  accepts: string;
  telehealth: boolean;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  npi?: string;
}

export interface DoctorSearchResponse {
  success: boolean;
  doctors: DoctorSearchResult[];
  source?: string;
  error?: string;
}

export interface TtsRequest {
  text: string;
  language?: string;
  voiceId?: string;
}
