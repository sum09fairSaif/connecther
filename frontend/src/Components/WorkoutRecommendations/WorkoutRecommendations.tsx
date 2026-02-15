import { useLocation, Link } from "react-router-dom";

interface LocationState {
  recommendations: Array<Record<string, unknown> & { reasoning?: string }>;
  aiMessage?: string;
  checkInId?: string;
}

/** Normalize API response - backend may return flat objects with reasoning */
function normalizeRecommendation(rec: unknown): { workout: Record<string, unknown>; reason: string } {
  const r = rec as Record<string, unknown>;
  if (r.workout && typeof r.reason === "string") {
    return { workout: r.workout as Record<string, unknown>, reason: r.reason };
  }
  const { reasoning, ...workout } = r;
  return { workout, reason: (reasoning as string) || "Recommended for you" };
}

function getVideoUrl(workout: Record<string, unknown>): string {
  return (workout.video_url as string) || (workout.youtube_url as string) || "";
}

function getYouTubeThumbnail(videoUrl: string): string {
  if (!videoUrl) return "";
  const match = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
}

export default function WorkoutRecommendations() {
  const location = useLocation();
  const state = location.state as LocationState;

  if (!state || !state.recommendations) {
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

  const recommendations = (state.recommendations || []).map(normalizeRecommendation);

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

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 6vw, 48px)",
              fontWeight: 700,
              color: "#4A2A4A",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            We've Got You
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#6B3A6B",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Here are your workout recommendations
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {recommendations.map((rec, index) => {
            const videoUrl = getVideoUrl(rec.workout);
            const thumbnailUrl =
              (rec.workout.thumbnail_url as string) ||
              (videoUrl ? getYouTubeThumbnail(videoUrl) : "");
            const workoutId = (rec.workout.id as string) || `rec-${index}`;

            return (
              <div
                key={workoutId}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(200,162,200,0.15)",
                  transition: "all 0.3s ease",
                }}
              >
                <a
                  href={videoUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                  onClick={(e) => !videoUrl && e.preventDefault()}
                >
                  <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
                    <div
                      style={{
                        width: "200px",
                        minWidth: "200px",
                        height: "112px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        background: "rgba(200,162,200,0.2)",
                        flexShrink: 0,
                      }}
                    >
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "32px",
                          }}
                        >
                          🎥
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "#4A2A4A",
                          margin: "0 0 8px",
                          lineHeight: 1.4,
                          textDecoration: "none",
                        }}
                      >
                        {(rec.workout.title as string) || "Workout"}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginBottom: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {(rec.workout.duration_minutes ?? rec.workout.duration) != null && (
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#8B7B8B",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            ⏱️ {Number(rec.workout.duration_minutes ?? rec.workout.duration)} min
                          </span>
                        )}
                        {rec.workout.intensity != null && rec.workout.intensity !== "" && (
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#8B7B8B",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            💪 {String(rec.workout.intensity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>

                <div
                  style={{
                    padding: "14px 20px",
                    background: "rgba(243,232,249,0.5)",
                    borderTop: "1px solid rgba(200,162,200,0.1)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6B3A6B",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Good for symptoms:</strong> {rec.reason}
                  </p>
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
      `}</style>
    </div>
  );
}
