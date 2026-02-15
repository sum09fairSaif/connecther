import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "../../services/api.service";
import type { CheckInRequest } from "../../types/api";
import "./Loading.css";

/** Duration to show loading before navigating to workout recommendations (ms). */
const LOADING_DURATION_MS = 1500;

/** Normalize symptom values to match database enum (symptom_type). */
function normalizeSymptoms(symptoms: string[]): string[] {
  return symptoms.map((s) => (s === "weak_arms" ? "weak_arm" : s));
}

interface LocationState {
  checkInData: CheckInRequest;
}

export default function Loading() {
  const navigate = useNavigate();
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const state = location.state as Record<string, unknown> | null;
    const hasCheckInData = state && typeof state === "object" && "checkInData" in state;
    const hasRecommendations = state && typeof state === "object" && "recommendations" in state;

    if (!hasCheckInData && !hasRecommendations) {
      navigate("/symptom-checker", { replace: true });
      return;
    }
    setAllowed(true);
  }, [navigate, location.state]);

  useEffect(() => {
    if (allowed !== true) return;

    const state = location.state as Record<string, unknown> | null;
    const checkInData = state?.checkInData as CheckInRequest | undefined;

    const navigateToRecommendations = (result: {
      recommendations: unknown[];
      aiMessage?: string;
      checkInId?: string;
    }) => {
      navigate("/recommendations", {
        state: {
          recommendations: result.recommendations,
          aiMessage: result.aiMessage,
          checkInId: result.checkInId,
        },
        replace: true,
      });
    };

    if (checkInData) {
      const normalizedData: CheckInRequest = {
        ...checkInData,
        symptoms: normalizeSymptoms(checkInData.symptoms),
      };
      const minDuration = new Promise<void>((r) => setTimeout(r, LOADING_DURATION_MS));
      const apiCall = apiService.submitCheckIn(normalizedData);

      Promise.all([minDuration, apiCall])
        .then(([, res]) => {
          const data = res as { recommendations?: unknown[]; ai_message?: string; message?: string; check_in_id?: string };
          navigateToRecommendations({
            recommendations: data.recommendations ?? [],
            aiMessage: data.ai_message ?? data.message,
            checkInId: data.check_in_id,
          });
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : "Failed to submit check-in.";
          const isNetworkError = message === "Failed to fetch" || message.includes("NetworkError");
          navigate("/symptom-checker", {
            replace: true,
            state: {
              error: isNetworkError
                ? "Could not connect to the server. Make sure the backend is running (cd backend && npm run dev)."
                : message,
            },
          });
        });
    } else if (state?.recommendations) {
      const timer = setTimeout(() => {
        navigateToRecommendations({
          recommendations: state.recommendations as unknown[],
          aiMessage: state.aiMessage as string | undefined,
          checkInId: state.checkInId as string | undefined,
        });
      }, LOADING_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [allowed, navigate, location.state]);

  if (allowed !== true) {
    return null;
  }

  return (
    <div className="loading-page">
      <div className="loading-dots" aria-hidden="true">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
      <h2 className="loading-heading">Creating your tailored picks ✨</h2>
      <p className="loading-text">
        We're building personalized video recommendations just for you based on your symptoms. Almost there!
      </p>
    </div>
  );
}
