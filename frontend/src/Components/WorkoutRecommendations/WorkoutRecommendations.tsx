import { useLocation, Link } from "react-router-dom";

interface LocationState {
  recommendations: Array<{
    id: string;
    title: string;
    youtube_url: string;
    youtube_id: string;
    duration: number;
    intensity_level: string;
    workout_type: string;
    description: string;
    reasoning: string; // From Gemini AI
  }>;
  message: string; // AI's encouraging message
  checkIn?: {
    id: string;
    created_at: string;
  };
}

function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export default function WorkoutRecommendations() {
  const location = useLocation();
  const state = location.state as LocationState;

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
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Decorative background elements */}
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
          position: "fixed",
          bottom: "-100px",
          left: "-60px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,162,200,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "48px 24px 100px",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        {/* Back button */}
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
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(42px, 8vw, 56px)",
              fontWeight: 700,
              color: "#4A2A4A",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            We've Got You!
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#6B3A6B",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Here are your personalized workouts
          </p>
        </div>

        {/* AI Encouragement Message */}
        {message && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(232,168,200,0.1) 0%, rgba(200,162,200,0.1) 100%)",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "32px",
              border: "1px solid rgba(200,162,200,0.2)",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                color: "#4A2A4A",
                margin: 0,
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              💜 {message}
            </p>
          </div>
        )}

        {/* Workout Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {recommendations.map((workout) => {
            const thumbnailUrl = getYouTubeThumbnail(workout.youtube_id);

            return (
              <div
                key={workout.id}
                style={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(200,162,200,0.15)",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Video Link Section */}
                <a
                  href={workout.youtube_url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: "200px",
                        minWidth: "200px",
                        height: "112px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        background: "rgba(200,162,200,0.2)",
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      {thumbnailUrl ? (
                        <>
                          <img
                            src={thumbnailUrl}
                            alt={workout.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          {/* Play button overlay */}
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "48px",
                              height: "48px",
                              background: "rgba(0,0,0,0.7)",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "20px",
                            }}
                          >
                            ▶️
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            color: "#8B7B8B",
                          }}
                        >
                          Video
                        </div>
                      )}
                    </div>

                    {/* Workout Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "#4A2A4A",
                          margin: "0 0 8px",
                          lineHeight: 1.4,
                        }}
                      >
                        {workout.title}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginBottom: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#8B7B8B",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {workout.duration} min
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#8B7B8B",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            textTransform: "capitalize",
                          }}
                        >
                          {workout.intensity_level}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#8B7B8B",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            textTransform: "capitalize",
                          }}
                        >
                          {workout.workout_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>

                {/* AI Reasoning Section */}
                <div
                  style={{
                    padding: "16px 20px",
                    background: "rgba(243,232,249,0.5)",
                    borderTop: "1px solid rgba(200,162,200,0.1)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6B3A6B",
                      margin: "0 0 4px",
                      fontWeight: 600,
                    }}
                  >
                    ✨ Why this workout?
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6B3A6B",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {workout.reasoning}
                  </p>
                </div>

                {/* Optional: Favorite Button */}
                <div style={{ padding: "12px 20px", textAlign: "center" }}>
                  <button
                    onClick={() => {
                      // TODO: Call POST /api/favorites
                      console.log('Add to favorites:', workout.id);
                    }}
                    style={{
                      background: "linear-gradient(135deg, #E8A8C8 0%, #C8A2C8 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "10px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    ❤️ Save to Favorites
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        a:hover h3 {
          color: #C8A2C8 !important;
        }
        button:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(200,162,200,0.3);
        }
      `}</style>
    </div>
  );
}