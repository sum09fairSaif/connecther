import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";

interface Workout {
  id: string;
  title: string;
  youtube_url: string;
  youtube_id: string;
  duration: number;
  intensity_level: string;
  workout_type: string;
  description: string;
  reasoning: string; // From Gemini AI
  good_for_symptoms?: string[];
}

interface LocationState {
  recommendations: Workout[];
  message: string; // AI's encouraging message (changed from aiMessage)
  checkInId?: string;
}

function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export default function Recommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // debug logs
  console.log('Full state:', state);
  console.log('Recommendations:', state?.recommendations);
  console.log('Message:', state?.message);

  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  if (!state || !state.recommendations || state.recommendations.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #FFF5F7 0%, #F5EBF8 40%, #EBF0FA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#5C3A5C", marginBottom: "16px" }}>No recommendations found</h2>
          <Link
            to="/symptom-checker"
            style={{
              color: "#C8A2C8",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            ← Back to Symptom Checker
          </Link>
        </div>
      </div>
    );
  }

  const { recommendations, message } = state;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FFF5F7 0%, #F5EBF8 40%, #EBF0FA 100%)",
        fontFamily: "'Poppins', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Decorative blobs */}
      <div
        style={{
          position: "fixed",
          top: "-120px",
          right: "-80px",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,168,200,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "48px 24px 100px",
        }}
      >
        {/* Back link */}
        <div style={{ marginBottom: "24px" }}>
          <Link
            to="/symptom-checker"
            style={{
              color: "#8B7B8B",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← New Check-In
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #F3E8F9, #FCE4EC)",
              marginBottom: "20px",
              fontSize: "28px",
              boxShadow: "0 4px 16px rgba(200,162,200,0.2)",
            }}
          >
            ✨
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 38px)",
              fontWeight: 700,
              color: "#4A2A4A",
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            Your Personalized Workouts
          </h1>
          {message && (
            <div
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                padding: "16px 24px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(200,162,200,0.2)",
                fontSize: "15px",
                color: "#6B3A6B",
                lineHeight: 1.6,
              }}
            >
              💜 {message}
            </div>
          )}
        </div>

        {/* Recommendations List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {recommendations.map((workout, index) => {
            const isExpanded = expandedWorkout === workout.id;
            const thumbnailUrl = getYouTubeThumbnail(workout.youtube_id);

            return (
              <div
                key={workout.id}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(200,162,200,0.15)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
              >
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                  {/* Rank Badge */}
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #C8A2C8, #D4A5C8)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* Workout Title */}
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#4A2A4A",
                        margin: "0 0 12px",
                      }}
                    >
                      {workout.title}
                    </h3>

                    {/* Workout Details */}
                    <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", color: "#8B7B8B", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>⏱️</span> {workout.duration} min
                      </span>
                      <span style={{ fontSize: "14px", color: "#8B7B8B", display: "flex", alignItems: "center", gap: "6px", textTransform: "capitalize" }}>
                        <span>💪</span> {workout.intensity_level}
                      </span>
                      <span style={{ fontSize: "14px", color: "#8B7B8B", display: "flex", alignItems: "center", gap: "6px", textTransform: "capitalize" }}>
                        <span>🧘</span> {workout.workout_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* AI Reasoning */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: "rgba(243,232,249,0.5)",
                        fontSize: "14px",
                        color: "#6B3A6B",
                        lineHeight: 1.5,
                        marginBottom: isExpanded ? "16px" : 0,
                      }}
                    >
                      <strong>✨ Why this workout:</strong> {workout.reasoning}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: "16px",
                          paddingTop: "16px",
                          borderTop: "1px solid rgba(200,162,200,0.15)",
                          animation: "fadeIn 0.3s ease-out",
                        }}
                      >
                        {/* Thumbnail */}
                        {thumbnailUrl && (
                          <div style={{ marginBottom: "16px", borderRadius: "12px", overflow: "hidden" }}>
                            <img
                              src={thumbnailUrl}
                              alt={workout.title}
                              style={{
                                width: "100%",
                                maxHeight: "300px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        )}

                        <p style={{ fontSize: "14px", color: "#6B3A6B", lineHeight: 1.6, marginBottom: "16px" }}>
                          {workout.description}
                        </p>

                        {workout.good_for_symptoms && workout.good_for_symptoms.length > 0 && (
                          <div style={{ marginBottom: "16px" }}>
                            <strong style={{ fontSize: "14px", color: "#5C3A5C", display: "block", marginBottom: "8px" }}>
                              Helps with:
                            </strong>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                              {workout.good_for_symptoms.map((symptom, i) => (
                                <span
                                  key={i}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    background: "rgba(168,230,207,0.3)",
                                    color: "#2E7D32",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {symptom.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Watch Video Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(workout.youtube_url, "_blank");
                          }}
                          style={{
                            padding: "12px 24px",
                            borderRadius: "12px",
                            border: "none",
                            background: "linear-gradient(135deg, #C8A2C8, #D4A5C8)",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            width: "100%",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.02)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          Watch Video on YouTube 🎥
                        </button>
                      </div>
                    )}

                    {/* Expand indicator */}
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "13px",
                        color: "#B8A8B8",
                        textAlign: "center",
                      }}
                    >
                      {isExpanded ? "Click to collapse ▲" : "Click to see more ▼"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Dashboard */}
        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <button
            onClick={() => navigate("/your-profile")}
            style={{
              padding: "14px 32px",
              borderRadius: "50px",
              border: "2px solid #C8A2C8",
              background: "transparent",
              color: "#C8A2C8",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#C8A2C8";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#C8A2C8";
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}