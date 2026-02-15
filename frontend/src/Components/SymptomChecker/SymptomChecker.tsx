import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { SymptomType, MoodType } from "../../types/enums";
import {
  FiArrowLeft,
  FiCheck,
  FiZap,
  FiSend,
} from "react-icons/fi";
import {
  TbMoodSmile,
  TbMoodSad,
  TbMoodNervous,
  TbMoodAngry,
  TbMoodCrazyHappy,
  TbMoodSick,
  TbZzz,
  TbStarFilled,
} from "react-icons/tb";
import {
  PiBone,
  PiHandFist,
  PiPersonSimpleRun,
  PiLightningFill,
  PiThermometerHot,
  PiSunHorizon,
  PiBatteryLow,
  PiBatteryEmpty,
  PiBatteryMedium,
  PiBatteryHigh,
  PiBatteryFull,
  PiBrain,
  PiWind,
  PiFlower,
  PiHeartBreak,
  PiSmileyXEyes,
} from "react-icons/pi";

interface SymptomMoodItem {
  label: string;
  icon: React.ReactNode;
  color?: string;
}

interface ChipButtonProps {
  item: SymptomMoodItem;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}

/** Maps UI labels to database enum values (symptom_type) */
const LABEL_TO_SYMPTOM: Record<string, SymptomType> = {
  "Back Pain": "back_pain",
  "Weak Arms": "weak_arm",
  "Weak Legs": "weak_legs",
  "Sciatica Pain": "sciatica_pain",
  "Nausea": "nausea",
  "Morning Sickness": "morning_sickness",
  "Fatigue": "fatigue",
  "Headaches": "headaches",
  "Bloating": "bloating",
  "Weakness": "weakness",
  "Stomach Pain": "stomach_pain",
  "Weak in General": "weak_in_general",
};

const symptoms: SymptomMoodItem[] = [
  { label: "Back Pain", icon: <PiBone size={18} /> },
  { label: "Weak Arms", icon: <PiHandFist size={18} /> },
  { label: "Weak Legs", icon: <PiPersonSimpleRun size={18} /> },
  { label: "Sciatica Pain", icon: <PiLightningFill size={18} /> },
  { label: "Nausea", icon: <PiThermometerHot size={18} /> },
  { label: "Morning Sickness", icon: <PiSunHorizon size={18} /> },
  { label: "Fatigue", icon: <PiBatteryLow size={18} /> },
  { label: "Headaches", icon: <PiBrain size={18} /> },
  { label: "Bloating", icon: <PiWind size={18} /> },
  { label: "Weakness", icon: <PiFlower size={18} /> },
  { label: "Stomach Pain", icon: <PiHeartBreak size={18} /> },
  { label: "Weak in General", icon: <PiSmileyXEyes size={18} /> },
];

const moods: SymptomMoodItem[] = [
  { label: "Anxious", icon: <TbMoodNervous size={18} />, color: "#E8A87C" },
  { label: "Fear", icon: <TbMoodSad size={18} />, color: "#D4A5A5" },
  { label: "Happy", icon: <TbMoodSmile size={18} />, color: "#F9D976" },
  { label: "Moody", icon: <TbMoodSad size={18} />, color: "#C4A1D4" },
  { label: "Frustrated", icon: <TbMoodAngry size={18} />, color: "#E88B8B" },
  { label: "Energetic", icon: <TbMoodCrazyHappy size={18} />, color: "#A8E6CF" },
  { label: "Lazy", icon: <TbMoodSick size={18} />, color: "#B8CCE0" },
  { label: "Productive", icon: <TbStarFilled size={18} />, color: "#95DAB6" },
];

const energyIcons = [
  <PiBatteryEmpty key="1" size={22} />,
  <PiBatteryLow key="2" size={22} />,
  <PiBatteryMedium key="3" size={22} />,
  <PiBatteryHigh key="4" size={22} />,
  <PiBatteryFull key="5" size={22} />,
];

function ChipButton({ item, selected, onClick, disabled }: ChipButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled && !selected}
      className="chip-btn"
      data-selected={selected}
      data-disabled={disabled && !selected}
    >
      <span className="chip-icon" data-selected={selected}>
        {item.icon}
      </span>
      {item.label}
      {selected && (
        <span className="chip-check">
          <FiCheck size={11} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

export default function SymptomTracker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const error = (location.state as { error?: string } | null)?.error ?? "";

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

    const userId = user?.email || "guest";
    const checkInData = {
      user_id: userId,
      energy_level: energyLevel,
      symptoms: selectedSymptoms
        .map((s) => LABEL_TO_SYMPTOM[s])
        .filter((s): s is SymptomType => s != null),
      moods: selectedMoods.map((m) => m.toLowerCase() as MoodType),
    };

    // Navigate immediately to loading page; it will make the API call and then go to recommendations
    navigate("/loading", {
      replace: true,
      state: { checkInData },
    });
  };

  const hasSelection = selectedSymptoms.length > 0 || selectedMoods.length > 0;

  return (
    <div className="sc-page">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap"
        rel="stylesheet"
      />

      <div className="sc-container">
        {/* Back link */}
        <Link to="/" className="sc-back">
          <FiArrowLeft size={16} />
          Back to home
        </Link>

        {/* Header */}
        <div className="sc-header">
          <h1 className="sc-title">Daily Check-in</h1>
          <p className="sc-subtitle">
            Tap what applies to you today — it only takes a minute.
          </p>
        </div>

        {/* Energy Level */}
        <section className="sc-section">
          <div className="sc-section-header">
            <FiZap size={18} className="sc-section-icon" />
            <h2 className="sc-section-title">Energy Level</h2>
          </div>
          <div className="energy-row">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                className="energy-btn"
                data-active={energyLevel === level}
              >
                <span className="energy-icon">{energyIcons[level - 1]}</span>
                <span className="energy-num">{level}</span>
              </button>
            ))}
          </div>
          <div className="energy-labels">
            <span>Running on empty</span>
            <span>Fully charged</span>
          </div>
        </section>

        {/* Symptoms */}
        <section className="sc-section">
          <div className="sc-section-header">
            <h2 className="sc-section-title">What's bothering you?</h2>
            <span
              className="sc-counter"
              data-maxed={selectedSymptoms.length >= 5}
            >
              {selectedSymptoms.length} / 5
            </span>
          </div>
          <div className="chip-grid">
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
        </section>

        {/* Mood */}
        <section className="sc-section">
          <div className="sc-section-header">
            <h2 className="sc-section-title">How's your mood?</h2>
            <span
              className="sc-counter"
              data-maxed={selectedMoods.length >= 3}
            >
              {selectedMoods.length} / 3
            </span>
          </div>
          <div className="chip-grid">
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
        </section>

        {/* Submit */}
        <div className="sc-submit-area">
          {error && <div className="sc-error">{error}</div>}
          <button
            onClick={handleSubmit}
            disabled={!hasSelection}
            className="sc-submit-btn"
            data-active={hasSelection}
          >
            <FiSend size={18} />
            Get my recommendations
          </button>
          {hasSelection && (
            <p className="sc-selection-summary">
              {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""} &{" "}
              {selectedMoods.length} mood{selectedMoods.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sc-page {
          min-height: 100vh;
          background: #FAF7F5;
          font-family: 'DM Sans', sans-serif;
        }

        .sc-container {
          max-width: 720px;
          margin: 0 auto;
          padding: 40px 24px 100px;
          animation: scFadeUp 0.4s ease-out;
          zoom: 1.2;
        }

        /* Back link */
        .sc-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #9B8E8E;
          font-size: 14px;
          text-decoration: none;
          margin-bottom: 32px;
          transition: color 0.2s;
        }
        .sc-back:hover { color: #6B5E5E; }

        /* Header */
        .sc-header {
          margin-bottom: 40px;
          text-align: center;
        }
        .sc-title {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(28px, 5vw, 36px);
          font-weight: 700;
          color: #3D2C2C;
          margin-bottom: 6px;
          line-height: 1.2;
        }
        .sc-subtitle {
          font-size: 16px;
          color: #A0908F;
          font-weight: 400;
          line-height: 1.5;
        }

        /* Sections */
        .sc-section {
          background: #fff;
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 24px;
          border: 1px solid #F0EAE6;
        }
        .sc-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 10px;
        }
        .sc-section-icon {
          color: #B07CC8;
          flex-shrink: 0;
        }
        .sc-section-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          font-weight: 600;
          color: #3D2C2C;
          flex: 1;
        }
        .sc-counter {
          font-size: 12px;
          font-weight: 600;
          color: #B5A8A0;
          background: #F7F3F0;
          padding: 3px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .sc-counter[data-maxed="true"] {
          color: #C87C7C;
          background: #FDF2F0;
        }

        /* Energy */
        .energy-row {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .energy-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 58px;
          padding: 12px 0 8px;
          border-radius: 14px;
          border: 2px solid #E8D0E6;
          background: #F2D5F0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .energy-btn[data-active="true"] {
          border-color: #B07CC8;
          background: #F8F0FC;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(176,124,200,0.15);
        }
        .energy-btn:hover:not([data-active="true"]) {
          border-color: #D4B8D2;
          background: #ECC8EA;
        }
        .energy-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          color: #B5A8A0;
        }
        .energy-btn[data-active="true"] .energy-icon {
          color: #7A4E8B;
        }
        .energy-num {
          font-size: 12px;
          font-weight: 600;
          color: #B5A8A0;
        }
        .energy-btn[data-active="true"] .energy-num {
          color: #7A4E8B;
        }
        .energy-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          padding: 0 4px;
          font-size: 12px;
          color: #C5B8B0;
        }

        /* Chips */
        .chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          border-radius: 10px;
          border: 1.5px solid #E8D0E6;
          background: #F2D5F0;
          color: #7A6B6B;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          line-height: 1;
        }
        .chip-btn:hover:not([data-disabled="true"]) {
          border-color: #D4B8D2;
          background: #ECC8EA;
        }
        .chip-btn[data-selected="true"] {
          border-color: #B07CC8;
          background: #F8F0FC;
          color: #4A3A5C;
          font-weight: 600;
        }
        .chip-btn[data-disabled="true"] {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .chip-icon {
          display: inline-flex;
          color: #C4A8CC;
          transition: color 0.2s;
        }
        .chip-icon[data-selected="true"] {
          color: #B07CC8;
        }
        .chip-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #B07CC8;
          color: white;
          margin-left: 2px;
        }

        /* Submit area */
        .sc-submit-area {
          text-align: center;
          padding-top: 8px;
        }
        .sc-error {
          margin-bottom: 14px;
          padding: 10px 18px;
          border-radius: 10px;
          background: #FDF2F0;
          color: #C87C7C;
          font-size: 14px;
          font-weight: 500;
        }
        .sc-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 40px;
          border-radius: 12px;
          border: none;
          background: #DDD4CC;
          color: #A09890;
          font-size: 16px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: not-allowed;
          transition: all 0.25s ease;
          letter-spacing: 0.2px;
        }
        .sc-submit-btn[data-active="true"] {
          background: #3D2C2C;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(61,44,44,0.2);
        }
        .sc-submit-btn[data-active="true"]:hover {
          background: #4E3C3C;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(61,44,44,0.25);
        }
        .sc-selection-summary {
          margin-top: 12px;
          font-size: 13px;
          color: #B5A8A0;
          animation: scFadeUp 0.25s ease-out;
        }

        button:focus-visible {
          outline: 2px solid #B07CC8;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
