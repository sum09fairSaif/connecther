import { useState } from "react";

interface SymptomMoodItem {
  label: string;
  icon: string;
  color?: string;
}

interface ChipButtonProps {
  item: SymptomMoodItem;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}

const symptoms = [
  { label: "Back Pain", icon: "🦴" },
  { label: "Weak Arms", icon: "💪" },
  { label: "Weak Legs", icon: "🦵" },
  { label: "Sciatica Pain", icon: "⚡" },
  { label: "Nausea", icon: "🤢" },
  { label: "Morning Sickness", icon: "🌅" },
  { label: "Fatigue", icon: "😴" },
  { label: "Headaches", icon: "🤕" },
  { label: "Bloating", icon: "🎈" },
  { label: "Weakness", icon: "🥀" },
  { label: "Stomach Pain", icon: "😣" },
  { label: "Weak in General", icon: "🫠" },
];

const moods = [
  { label: "Anxious", icon: "😰", color: "#E8A87C" },
  { label: "Fear", icon: "😨", color: "#D4A5A5" },
  { label: "Happy", icon: "😊", color: "#F9D976" },
  { label: "Moody", icon: "🌧️", color: "#C4A1D4" },
  { label: "Frustrated", icon: "😤", color: "#E88B8B" },
  { label: "Energetic", icon: "⚡", color: "#A8E6CF" },
  { label: "Lazy", icon: "🦥", color: "#B8CCE0" },
  { label: "Productive", icon: "✨", color: "#95DAB6" },
];

function ChipButton({ item, selected, onClick, disabled }: ChipButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled && !selected}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 20px",
        borderRadius: "50px",
        border: selected ? "2px solid #C8A2C8" : "2px solid rgba(200,162,200,0.25)",
        background: selected
          ? "linear-gradient(135deg, #F3E8F9 0%, #FCE4EC 100%)"
          : "rgba(255,255,255,0.6)",
        color: selected ? "#6B3A6B" : "#8B7B8B",
        fontSize: "15px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: selected ? 600 : 500,
        cursor: disabled && !selected ? "not-allowed" : "pointer",
        opacity: disabled && !selected ? 0.4 : 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: selected ? "scale(1.05)" : "scale(1)",
        boxShadow: selected
          ? "0 4px 15px rgba(200,162,200,0.35)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        letterSpacing: "0.2px",
      }}
      onMouseEnter={(e) => {
        if (!disabled || selected) {
          e.currentTarget.style.transform = selected ? "scale(1.07)" : "scale(1.04)";
          e.currentTarget.style.boxShadow = "0 4px 18px rgba(200,162,200,0.3)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = selected ? "scale(1.05)" : "scale(1)";
        e.currentTarget.style.boxShadow = selected
          ? "0 4px 15px rgba(200,162,200,0.35)"
          : "0 1px 4px rgba(0,0,0,0.04)";
      }}
    >
      <span style={{ fontSize: "18px" }}>{item.icon}</span>
      {item.label}
      {selected && (
        <span
          style={{
            marginLeft: "2px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "#C8A2C8",
            color: "white",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

export default function SymptomTracker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const toggleSymptom = (label: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(label)
        ? prev.filter((s) => s !== label)
        : prev.length < 5
        ? [...prev, label]
        : prev
    );
  };

  const toggleMood = (label: string) => {
    setSelectedMoods((prev) =>
      prev.includes(label)
        ? prev.filter((m) => m !== label)
        : prev.length < 3
        ? [...prev, label]
        : prev
    );
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0 && selectedMoods.length === 0) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setSelectedSymptoms([]);
    setSelectedMoods([]);
  };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #FFF5F7 0%, #F5EBF8 40%, #EBF0FA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Poppins', sans-serif",
          padding: "20px",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <div
          style={{
            textAlign: "center",
            animation: "fadeUp 0.6s ease-out",
            maxWidth: "500px",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌸</div>
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "32px",
              color: "#5C3A5C",
              marginBottom: "12px",
            }}
          >
            Logged!
          </h2>
          <p style={{ color: "#8B7B8B", fontSize: "16px", lineHeight: 1.6, marginBottom: "8px" }}>
            <strong style={{ color: "#6B3A6B" }}>Symptoms:</strong>{" "}
            {selectedSymptoms.join(", ") || "None selected"}
          </p>
          <p style={{ color: "#8B7B8B", fontSize: "16px", lineHeight: 1.6, marginBottom: "32px" }}>
            <strong style={{ color: "#6B3A6B" }}>Mood:</strong>{" "}
            {selectedMoods.join(", ") || "None selected"}
          </p>
          <button
            onClick={handleReset}
            style={{
              padding: "14px 40px",
              borderRadius: "50px",
              border: "none",
              background: "linear-gradient(135deg, #C8A2C8 0%, #D4A5C8 50%, #E8A5B8 100%)",
              color: "white",
              fontSize: "16px",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 6px 24px rgba(200,162,200,0.4)",
            }}
          >
            Log Again
          </button>
        </div>
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

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
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
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
          maxWidth: "680px",
          margin: "0 auto",
          padding: "48px 24px 100px",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
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
            🤰
          </div>
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "clamp(32px, 5vw, 42px)",
              fontWeight: 700,
              color: "#4A2A4A",
              margin: "0 0 8px",
              lineHeight: 1.2,
            }}
          >
            Hello!
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "#9B8B9B",
              margin: 0,
              fontWeight: 500,
            }}
          >
            How are you feeling today? Let's check in.
          </p>
        </div>

        {/* Symptoms Section */}
        <div style={{ marginBottom: "44px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "22px",
                fontWeight: 600,
                color: "#5C3A5C",
                margin: 0,
              }}
            >
              Enter Your Symptoms
            </h2>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: selectedSymptoms.length >= 5 ? "#D4A5A5" : "#B8A8B8",
                background: selectedSymptoms.length >= 5 ? "#FFF0F0" : "#F8F4FA",
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              {selectedSymptoms.length}/5
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {symptoms.map((s) => (
              <ChipButton
                key={s.label}
                item={s}
                selected={selectedSymptoms.includes(s.label)}
                onClick={() => toggleSymptom(s.label)}
                disabled={selectedSymptoms.length >= 5}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(200,162,200,0.3), transparent)",
            margin: "0 0 44px",
          }}
        />

        {/* Mood Section */}
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "22px",
                fontWeight: 600,
                color: "#5C3A5C",
                margin: 0,
              }}
            >
              Enter Your Mood
            </h2>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: selectedMoods.length >= 3 ? "#D4A5A5" : "#B8A8B8",
                background: selectedMoods.length >= 3 ? "#FFF0F0" : "#F8F4FA",
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              {selectedMoods.length}/3
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {moods.map((m) => (
              <ChipButton
                key={m.label}
                item={m}
                selected={selectedMoods.includes(m.label)}
                onClick={() => toggleMood(m.label)}
                disabled={selectedMoods.length >= 3}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleSubmit}
            disabled={selectedSymptoms.length === 0 && selectedMoods.length === 0}
            style={{
              padding: "16px 56px",
              borderRadius: "50px",
              border: "none",
              background:
                selectedSymptoms.length === 0 && selectedMoods.length === 0
                  ? "#E0D6E0"
                  : "linear-gradient(135deg, #C8A2C8 0%, #D4A5C8 50%, #E8A5B8 100%)",
              color:
                selectedSymptoms.length === 0 && selectedMoods.length === 0
                  ? "#B8A8B8"
                  : "white",
              fontSize: "17px",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              cursor:
                selectedSymptoms.length === 0 && selectedMoods.length === 0
                  ? "not-allowed"
                  : "pointer",
              boxShadow:
                selectedSymptoms.length === 0 && selectedMoods.length === 0
                  ? "none"
                  : "0 8px 28px rgba(200,162,200,0.4)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: "scale(1)",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              if (selectedSymptoms.length > 0 || selectedMoods.length > 0) {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 10px 36px rgba(200,162,200,0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                selectedSymptoms.length === 0 && selectedMoods.length === 0
                  ? "none"
                  : "0 8px 28px rgba(200,162,200,0.4)";
            }}
          >
            Submit
          </button>
          {(selectedSymptoms.length > 0 || selectedMoods.length > 0) && (
            <p
              style={{
                marginTop: "14px",
                fontSize: "13px",
                color: "#B8A8B8",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""} &
              {" " + selectedMoods.length} mood{selectedMoods.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:focus-visible {
          outline: 2px solid #C8A2C8;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}