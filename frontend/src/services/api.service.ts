import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import type {
  Workout,
  CheckInRequest,
  CheckInResponse,
  CheckInHistory,
  Favorite,
  AddFavoriteRequest,
  UserProfile,
  DoctorSearchResult,
  DoctorSearchResponse,
  TtsRequest,
} from "../types/api";

// DEMO USER ID - Hardcoded for demo purposes
// TODO: Replace with real Auth0 user ID after demo
const DEMO_USER_ID = 'ea395f3d-93b6-4c89-a910-91d6f68fcef1';

class ApiService {
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const rawBody = await response.text().catch(() => "");
      let message = `HTTP error! status: ${response.status}`;

      if (rawBody) {
        try {
          const parsedBody = JSON.parse(rawBody) as {
            error?: string;
            message?: string;
          };
          message = parsedBody.error || parsedBody.message || message;
        } catch {
          const compact = rawBody.replace(/\s+/g, " ").trim();
          if (compact) {
            message = compact.slice(0, 200);
          }
        }
      }

      throw new Error(message);
    }

    return response.json();
  }

  private async fetchBlob(
    endpoint: string,
    options?: RequestInit
  ): Promise<Blob> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const rawBody = await response.text().catch(() => "");
      let message = `HTTP error! status: ${response.status}`;

      if (rawBody) {
        try {
          const parsedBody = JSON.parse(rawBody) as {
            error?: string;
            message?: string;
          };
          message = parsedBody.error || parsedBody.message || message;
        } catch {
          message = rawBody;
        }
      }

      throw new Error(message.slice(0, 350));
    }

    return response.blob();
  }

  // Workouts API
  async getWorkouts(): Promise<Workout[]> {
    return this.fetch<Workout[]>(API_ENDPOINTS.WORKOUTS);
  }

  async getWorkoutById(id: string): Promise<Workout> {
    return this.fetch<Workout>(API_ENDPOINTS.WORKOUT_BY_ID(id));
  }

  async filterWorkouts(params: {
    intensity?: string;
    type?: string;
    trimester?: string;
  }): Promise<Workout[]> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return this.fetch<Workout[]>(
      `${API_ENDPOINTS.WORKOUTS_FILTER}?${queryString}`
    );
  }

  // Check-In API
  async submitCheckIn(data: CheckInRequest): Promise<CheckInResponse> {
    // Force use of demo user ID for now
    const checkInData = {
      ...data,
      user_id: DEMO_USER_ID  // ← Hardcoded for demo
    };
    
    return this.fetch<CheckInResponse>(API_ENDPOINTS.CHECK_IN, {
      method: "POST",
      body: JSON.stringify(checkInData),
    });
  }

  async getCheckInHistory(userId?: string): Promise<CheckInHistory[]> {
    // Use demo user ID if none provided
    const id = userId || DEMO_USER_ID;
    
    return this.fetch<CheckInHistory[]>(
      API_ENDPOINTS.CHECK_IN_HISTORY(id)
    );
  }

  // Favorites API
  async getFavorites(userId?: string): Promise<Favorite[]> {
    const id = userId || DEMO_USER_ID;
    
    return this.fetch<Favorite[]>(API_ENDPOINTS.FAVORITES(id));
  }

  async addFavorite(data: AddFavoriteRequest): Promise<Favorite> {
    // Force use of demo user ID
    const favoriteData = {
      ...data,
      user_id: DEMO_USER_ID
    };
    
    return this.fetch<Favorite>(API_ENDPOINTS.ADD_FAVORITE, {
      method: "POST",
      body: JSON.stringify(favoriteData),
    });
  }

  async removeFavorite(favoriteId: string): Promise<void> {
    await this.fetch(API_ENDPOINTS.REMOVE_FAVORITE(favoriteId), {
      method: "DELETE",
    });
  }

  // Profile API
  async getProfile(userId?: string): Promise<UserProfile> {
    const id = userId || DEMO_USER_ID;
    
    return this.fetch<UserProfile>(API_ENDPOINTS.PROFILE(id));
  }

  async createProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    // Force use of demo user ID
    const profileData = {
      ...data,
      user_id: DEMO_USER_ID
    };
    
    return this.fetch<UserProfile>(API_ENDPOINTS.CREATE_PROFILE, {
      method: "POST",
      body: JSON.stringify(profileData),
    });
  }

  async updateProfile(
    userId?: string,
    data?: Partial<UserProfile>
  ): Promise<UserProfile> {
    const id = userId || DEMO_USER_ID;
    
    return this.fetch<UserProfile>(API_ENDPOINTS.UPDATE_PROFILE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Doctors API
  async searchDoctors(params: {
    zip?: string;
    specialty?: string;
    city?: string;
    state?: string;
    limit?: number;
  }): Promise<DoctorSearchResult[]> {
    const queryParams: Record<string, string> = {};

    if (params.zip) queryParams.zip = params.zip;
    if (params.specialty) queryParams.specialty = params.specialty;
    if (params.city) queryParams.city = params.city;
    if (params.state) queryParams.state = params.state;
    if (params.limit) queryParams.limit = String(params.limit);

    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.DOCTORS_SEARCH}?${queryString}`
      : API_ENDPOINTS.DOCTORS_SEARCH;

    const response = await this.fetch<DoctorSearchResponse>(endpoint);
    return response.doctors || [];
  }

  async synthesizeSpeech(payload: TtsRequest): Promise<Blob> {
    return this.fetchBlob(API_ENDPOINTS.TTS, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const apiService = new ApiService();
