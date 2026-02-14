import { insuranceOptions, specialtyOptions } from "../data/options";

type Props = {
  zip: string;
  insurance: string;
  specialty: string;
  onZipChange: (v: string) => void;
  onInsuranceChange: (v: string) => void;
  onSpecialtyChange: (v: string) => void;
  onSearch: () => void;
};

export default function FiltersBar({
  zip,
  insurance,
  specialty,
  onZipChange,
  onInsuranceChange,
  onSpecialtyChange,
  onSearch,
}: Props) {
  return (
    <div className="card pad">
      <input
        placeholder="Search your symptoms..."
        style={inputStyle}
        aria-label="Search symptoms"
      />

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <input
          type="text"
          value={zip}
          onChange={(e) => onZipChange(e.target.value)}
          placeholder="Location: Enter ZIP code (e.g., 10001)"
          inputMode="numeric"
          autoComplete="postal-code"
          style={inputStyle}
          aria-label="ZIP code"
        />

        <input
          list="insurance-options"
          type="text"
          value={insurance}
          onChange={(e) => onInsuranceChange(e.target.value)}
          placeholder="Insurance: Select or type insurance"
          style={inputStyle}
          aria-label="Insurance"
        />
        <datalist id="insurance-options">
          {insuranceOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>

        <input
          list="specialty-options"
          type="text"
          value={specialty}
          onChange={(e) => onSpecialtyChange(e.target.value)}
          placeholder="Specialty: Select or type specialty"
          style={inputStyle}
          aria-label="Specialty"
        />
        <datalist id="specialty-options">
          {specialtyOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>

        <button onClick={onSearch} style={primaryBtn}>
          Find a Doctor Nearby -&gt;
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(140,120,246,0.22)",
  outline: "none",
  background: "rgba(255,255,255,0.7)",
};

const primaryBtn: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "none",
  color: "white",
  fontWeight: 700,
  background: "linear-gradient(135deg, #8B7CF6, #F6B8D8)",
  cursor: "pointer",
};
