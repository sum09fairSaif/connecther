import { useMemo, useState } from "react";
import "./FindDoctor.css";
import FiltersBar from "./components/FiltersBar";
import MapPanel from "./components/MapPanel";
import DoctorList from "./components/DoctorList";
import BookingPanel from "./components/BookingPanel";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  distanceMiles: number;
  rating: number;
  accepts: string;
  telehealth: boolean;
};

const MOCK_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Jane Doe",
    specialty: "OB-GYN",
    distanceMiles: 2.1,
    rating: 4.9,
    accepts: "Aetna",
    telehealth: true,
  },
  {
    id: "2",
    name: "Dr. Amy Patel",
    specialty: "Women's Health",
    distanceMiles: 4.9,
    rating: 4.7,
    accepts: "Cigna",
    telehealth: true,
  },
];

export default function FindDoctorPage() {
  const [zip, setZip] = useState("");
  const [insurance, setInsurance] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const doctors = useMemo(() => MOCK_DOCTORS, []);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) ?? null;

  return (
    <div className="fd-root">
      <div className="fd-shell">
        <section className="fd-left">
          <FiltersBar
            zip={zip}
            insurance={insurance}
            specialty={specialty}
            onZipChange={setZip}
            onInsuranceChange={setInsurance}
            onSpecialtyChange={setSpecialty}
            onSearch={() => {
              const normalizedZip = zip.trim();
              const isValidZip = /^\d{5}(-\d{4})?$/.test(normalizedZip);

              if (normalizedZip && !isValidZip) {
                alert("Please enter a valid US ZIP code (12345 or 12345-6789).");
                return;
              }

              // hook API later
              console.log("Search:", {
                zip: normalizedZip,
                insurance: insurance.trim(),
                specialty: specialty.trim(),
              });
            }}
          />
          <MapPanel />
        </section>

        <aside className="fd-right">
          <DoctorList
            doctors={doctors}
            selectedDoctorId={selectedDoctorId}
            onSelectDoctor={setSelectedDoctorId}
          />
          <BookingPanel
            doctor={selectedDoctor}
            onConfirm={() => {
              if (!selectedDoctor) return;
              alert(`Confirmed appointment with ${selectedDoctor.name}!`);
            }}
          />
        </aside>
      </div>
    </div>
  );
}
