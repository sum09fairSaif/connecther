import type { Doctor } from "../FindDoctor";

type Props = {
  doctors: Doctor[];
  selectedDoctorId: string | null;
  onSelectDoctor: (id: string) => void;
};

export default function DoctorList({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
}: Props) {
  return (
    <div className="card pad">
      <h2 style={{ margin: 0, marginBottom: 12 }}>Find a Doctor</h2>

      <div style={{ display: "grid", gap: 12 }}>
        {doctors.map((d) => {
          const active = d.id === selectedDoctorId;
          return (
            <button
              key={d.id}
              onClick={() => onSelectDoctor(d.id)}
              style={{
                textAlign: "left",
                borderRadius: 18,
                border: active
                  ? "2px solid rgba(139,124,246,0.55)"
                  : "1px solid rgba(140,120,246,0.18)",
                background: "rgba(255,255,255,0.72)",
                padding: 12,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 800 }}>{d.name}</div>
              <div style={{ color: "rgba(44,44,52,0.7)", marginTop: 2 }}>
                {d.specialty} • {d.distanceMiles} miles • ⭐ {d.rating}
              </div>
              <div style={{ color: "rgba(44,44,52,0.6)", marginTop: 6 }}>
                Accepts: {d.accepts} {d.telehealth ? "• Telehealth" : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
