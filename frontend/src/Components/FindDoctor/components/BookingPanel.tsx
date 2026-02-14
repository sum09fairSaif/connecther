import type { Doctor } from "../FindDoctor";

type Props = {
  doctor: Doctor | null;
  onConfirm: () => void;
};

export default function BookingPanel({ doctor, onConfirm }: Props) {
  const disabled = !doctor;

  return (
    <div className="card pad">
      <h3 style={{ margin: 0, marginBottom: 10 }}>Booking Summary</h3>

      {!doctor ? (
        <p style={{ margin: 0, color: "rgba(44,44,52,0.65)" }}>
          Select a doctor to see appointment details.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 800 }}>{doctor.name}</div>
          <div style={{ color: "rgba(44,44,52,0.7)" }}>
            {doctor.specialty} • 15 min video consultation
          </div>

          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            <label style={labelStyle}>Insurance</label>
            <select style={selectStyle} defaultValue={doctor.accepts}>
              <option>{doctor.accepts}</option>
              <option>Cigna</option>
              <option>Aetna</option>
            </select>

            <label style={labelStyle}>Appointment Time</label>
            <select style={selectStyle} defaultValue="Friday, 10:00 AM">
              <option>Friday, 10:00 AM</option>
              <option>Friday, 10:30 AM</option>
              <option>Friday, 11:00 AM</option>
            </select>
          </div>
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={disabled}
        style={{
          marginTop: 14,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "none",
          fontWeight: 800,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          color: "white",
          background: "linear-gradient(135deg, #8B7CF6, #F6B8D8)",
        }}
      >
        Confirm Appointment
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(44,44,52,0.65)",
};

const selectStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(140,120,246,0.22)",
  background: "rgba(255,255,255,0.7)",
  outline: "none",
};
