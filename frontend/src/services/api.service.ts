import { API_BASE_URL, API_ENDPOINTS } from "../config/api";
import type {
  Workout,
  CheckInRequest,
  CheckInResponse,
  CheckInHistory,
  Favorite,
  AddFavoriteRequest,
  UserProfile,
} from "../types/api";

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
      const body = await response.json().catch(() => ({}));
      const message = body.error || body.message || `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }

    return response.json();
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
    return this.fetch<CheckInResponse>(API_ENDPOINTS.CHECK_IN, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCheckInHistory(userId: string): Promise<CheckInHistory[]> {
    return this.fetch<CheckInHistory[]>(
      API_ENDPOINTS.CHECK_IN_HISTORY(userId)
    );
  }

  // Favorites API
  async getFavorites(userId: string): Promise<Favorite[]> {
    return this.fetch<Favorite[]>(API_ENDPOINTS.FAVORITES(userId));
  }

  async addFavorite(data: AddFavoriteRequest): Promise<Favorite> {
    return this.fetch<Favorite>(API_ENDPOINTS.ADD_FAVORITE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removeFavorite(favoriteId: string): Promise<void> {
    await this.fetch(API_ENDPOINTS.REMOVE_FAVORITE(favoriteId), {
      method: "DELETE",
    });
  }

  // Profile API
  async getProfile(userId: string): Promise<UserProfile> {
    return this.fetch<UserProfile>(API_ENDPOINTS.PROFILE(userId));
  }

  async createProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.fetch<UserProfile>(API_ENDPOINTS.CREATE_PROFILE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProfile(
    userId: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile> {
    return this.fetch<UserProfile>(API_ENDPOINTS.UPDATE_PROFILE(userId), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
