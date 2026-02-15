import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiVolume2 } from "react-icons/fi";
import { apiService } from "../../services/api.service";

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
    good_for_symptoms?: string[];
  }>;
  message: string; // AI's encouraging message
  checkIn?: {
    id: string;
    created_at: string;
  };
}

const languageOptions = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" },
];

function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

const iconColor = "#6B3A6B";
const iconColorMuted = "#8B7B8B";

const IconSparkles = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, verticalAlign: "middle" }}>
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 14l1 3 3 1-1-3-3-1z" />
    <path d="M19 14l1 3 3 1-1-3-3-1z" />
  </svg>
);

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColorMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconDumbbell = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColorMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M3 7h4v10H3z" />
    <path d="M17 7h4v10h-4z" />
    <path d="M7 11h10v2H7z" />
  </svg>
);

const IconYoga = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={iconColorMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <path d="M8 21l4-6 4 6" />
    <path d="M12 11l-3 4" />
    <path d="M12 11l3 4" />
  </svg>
);

const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export default function WorkoutRecommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [audioLanguage, setAudioLanguage] = useState<string>("en");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

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

  const recommendationsAudioText = useMemo(() => {
    const intro = message ? `Overview message: ${message}` : "No overview message provided.";
    const workoutText = recommendations
      .map((workout, index) => {
        const symptomsText =
          workout.good_for_symptoms && workout.good_for_symptoms.length > 0
            ? `Helps with ${workout.good_for_symptoms.join(", ")}.`
            : "No specific symptom tags listed.";
        return [
          `Recommendation ${index + 1}: ${workout.title}.`,
          `Duration: ${workout.duration} minutes.`,
          `Intensity: ${workout.intensity_level}.`,
          `Type: ${workout.workout_type.replace(/_/g, " ")}.`,
          `Reasoning: ${workout.reasoning}.`,
          symptomsText,
          `Description: ${workout.description}.`,
        ].join(" ");
      })
      .join(" ");

    return [
      "Workout recommendations page.",
      "Heading: Your Personalized Workouts.",
      intro,
      workoutText,
      "Action button: Go to Dashboard.",
    ].join(" ");
  }, [message, recommendations]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      for (const objectUrl of audioCacheRef.current.values()) {
        URL.revokeObjectURL(objectUrl);
      }
      audioCacheRef.current.clear();
    };
  }, []);

  const handleListen = async () => {
    setAudioError("");
    setIsSpeaking(true);

    try {
      const cacheKey = `${audioLanguage}::${recommendationsAudioText}`;
      let audioUrl = audioCacheRef.current.get(cacheKey);

      if (!audioUrl) {
        const blob = await apiService.synthesizeSpeech({
          text: recommendationsAudioText,
          language: audioLanguage,
        });
        audioUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(cacheKey, audioUrl);
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        setAudioError("Audio playback failed. Please try again.");
      };
      await audio.play();
    } catch (err) {
      setIsSpeaking(false);
      const messageText =
        err instanceof Error && err.message ? err.message : "Audio unavailable right now.";
      setAudioError(messageText);
    }
  };

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

      {/* Decorative blob */}
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
              boxShadow: "0 4px 16px rgba(200,162,200,0.2)",
            }}
            >
            <IconSparkles />
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
            <p
              style={{
                maxWidth: "560px",
                margin: "0 auto",
                fontSize: "16px",
                color: "#5C3A5C",
                lineHeight: 1.65,
                fontWeight: 450,
                letterSpacing: "0.01em",
              }}
            >
              {message}
            </p>
          )}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <label style={{ fontSize: "14px", color: "#6B3A6B", fontWeight: 600 }}>
              Audio language
            </label>
            <select
              value={audioLanguage}
              onChange={(e) => setAudioLanguage(e.target.value)}
              style={{
                border: "1px solid #D9C8E8",
                borderRadius: "10px",
                padding: "9px 12px",
                background: "white",
                color: "#5C3A5C",
                fontSize: "14px",
              }}
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleListen}
              disabled={isSpeaking}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "none",
                borderRadius: "10px",
                padding: "10px 14px",
                background: isSpeaking ? "#DDD4CC" : "#5E746A",
                color: isSpeaking ? "#8C837B" : "white",
                cursor: isSpeaking ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              <FiVolume2 size={16} />
              {isSpeaking ? "Playing..." : "Listen page"}
            </button>
          </div>
          {audioError && (
            <p style={{ marginTop: "10px", color: "#BA6D6D", fontSize: "14px" }}>{audioError}</p>
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
                  background: "rgba(255,255,255,0.85)",
                  borderRadius: "24px",
                  padding: "24px",
                  boxShadow: "0 2px 24px rgba(200,162,200,0.08)",
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
                        <IconClock /> {workout.duration} min
                      </span>
                      <span style={{ fontSize: "14px", color: "#8B7B8B", display: "flex", alignItems: "center", gap: "6px", textTransform: "capitalize" }}>
                        <IconDumbbell /> {workout.intensity_level}
                      </span>
                      <span style={{ fontSize: "14px", color: "#8B7B8B", display: "flex", alignItems: "center", gap: "6px", textTransform: "capitalize" }}>
                        <IconYoga /> {workout.workout_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* AI Reasoning */}
                    <div
                      style={{
                        padding: "14px 18px",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, rgba(243,232,249,0.4) 0%, rgba(248,240,252,0.35) 100%)",
                        fontSize: "14px",
                        color: "#6B3A6B",
                        lineHeight: 1.55,
                        marginBottom: isExpanded ? "16px" : 0,
                      }}
                    >
                      <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px" }}>
                        <strong style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><IconSparkles size={14} /> Why this workout:</strong>
                        <span>{workout.reasoning}</span>
                      </span>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: "16px",
                          paddingTop: "16px",
                          borderTop: "1px solid rgba(200,162,200,0.08)",
                          animation: "fadeIn 0.3s ease-out",
                        }}
                      >
                        {/* Thumbnail */}
                        {thumbnailUrl && (
                          <div style={{ marginBottom: "16px", borderRadius: "16px", overflow: "hidden" }}>
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
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <IconPlay /> Watch Video on YouTube
                          </span>
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
