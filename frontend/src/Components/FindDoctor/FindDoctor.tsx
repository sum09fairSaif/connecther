import { useState } from "react";
import "./FindDoctor.css";
import FiltersBar from "./components/FiltersBar";
import MapPanel from "./components/MapPanel";
import DoctorList from "./components/DoctorList";
import BookingPanel from "./components/BookingPanel";
import { useAuth } from "../../context/AuthContext";
import { addAppointmentForUser } from "../../services/appointments.storage";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  distanceMiles: number | null;
  rating: number | null;
  accepts: string;
  telehealth: boolean;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  npi?: string;
};

const BOSTON_DOCTORS: Doctor[] = [
  {
    id: "npi-1346222692",
    name: "Dr. Jodi Abbott",
    specialty: "Obstetrics & Gynecology, Maternal & Fetal Medicine",
    distanceMiles: null,
    rating: null,
    accepts: "Insurance info unavailable",
    telehealth: false,
    city: "Boston",
    state: "MA",
    npi: "1346222692",
  },
  {
    id: "npi-1881804235",
    name: "Dr. Alireza Abdollah Shamshirsaz",
    specialty: "Obstetrics & Gynecology",
    distanceMiles: null,
    rating: null,
    accepts: "Insurance info unavailable",
    telehealth: false,
    city: "Boston",
    state: "MA",
    npi: "1881804235",
  },
  {
    id: "npi-1598228967",
    name: "Dr. Elizabeth Adams",
    specialty: "Obstetrics & Gynecology, Critical Care Medicine",
    distanceMiles: null,
    rating: null,
    accepts: "Insurance info unavailable",
    telehealth: false,
    city: "Boston",
    state: "MA",
    npi: "1598228967",
  },
  {
    id: "npi-1043604283",
    name: "Dr. Amma Agyemang",
    specialty: "Obstetrics & Gynecology, Gynecologic Oncology",
    distanceMiles: null,
    rating: null,
    accepts: "Insurance info unavailable",
    telehealth: false,
    city: "Boston",
    state: "MA",
    npi: "1043604283",
  },
  {
    id: "npi-1851522486",
    name: "Dr. Mobolaji Ajao",
    specialty: "Obstetrics & Gynecology, Gynecology",
    distanceMiles: null,
    rating: null,
    accepts: "Insurance info unavailable",
    telehealth: false,
    city: "Boston",
    state: "MA",
    npi: "1851522486",
  },
  {
    id: "npi-1134143290",
    name: "Dr. John Al-Jamal",
    specialty:
      "Obstetrics & Gynecology, Urogynecology and Reconstructive Pelvic Surgery",
    distanceMiles: null,
    rating: null,
    accepts: "Insurance info unavailable",
    telehealth: false,
    city: "Boston",
    state: "MA",
    npi: "1134143290",
  },
  {
    id: "npi-1669457735",
    name: "Dr. Rebecca Allen",
    specialty: "Obstetrics & Gynecology, Gynecology",
    distanceMiles: null,
    rating: null,
    accepts: "Insurance info unavailable",
    telehealth: false,
    city: "Boston",
    state: "MA",
    npi: "1669457735",
  },
  {
    id: "npi-1740485762",
    name: "Dr. Mallika Anand",
    specialty:
      "Obstetrics & Gynecology, Urogynecology and Reconstructive Pelvic Surgery",
    distanceMiles: null,
    rating: null,
    accepts: "Insurance info unavailable",
    telehealth: false,
    city: "Boston",
    state: "MA",
    npi: "1740485762",
  },
];

export default function FindDoctorPage() {
  const { user, isAuthenticated } = useAuth();
  const [zip, setZip] = useState("");
  const [insurance, setInsurance] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(
    BOSTON_DOCTORS[0]?.id || null,
  );
  const [doctors, setDoctors] = useState<Doctor[]>(BOSTON_DOCTORS);
  const [doctorError, setDoctorError] = useState("");

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) ?? null;

  const runDoctorSearch = (searchZip: string, searchSpecialty: string) => {
    const normalizedZip = searchZip.trim();
    const isValidZip = /^\d{5}(-\d{4})?$/.test(normalizedZip);

    if (normalizedZip && !isValidZip) {
      alert("Please enter a valid US ZIP code (12345 or 12345-6789).");
      return;
    }

    setDoctorError("");
    const normalizedSpecialty = searchSpecialty.trim().toLowerCase();

    const filteredDoctors = BOSTON_DOCTORS.filter((doctor) => {
      if (!normalizedSpecialty) return true;
      return (
        doctor.specialty.toLowerCase().includes(normalizedSpecialty) ||
        doctor.name.toLowerCase().includes(normalizedSpecialty)
      );
    });

    setDoctors(filteredDoctors);
    setSelectedDoctorId(filteredDoctors[0]?.id || null);

    if (filteredDoctors.length === 0) {
      setDoctorError("No doctors found for the current filters.");
    }
  };

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
            onSearch={() => runDoctorSearch(zip, specialty)}
          />
          <MapPanel />
        </section>

        <aside className="fd-right">
          <DoctorList
            doctors={doctors}
            selectedDoctorId={selectedDoctorId}
            onSelectDoctor={setSelectedDoctorId}
            isLoading={false}
            error={doctorError}
          />
          <BookingPanel
            doctor={selectedDoctor}
            userInsurance={insurance}
            onConfirm={({ insurance: selectedInsurance, appointmentTime }) => {
              if (!selectedDoctor) return;
              if (!isAuthenticated || !user?.email) {
                alert("Please log in to schedule and save appointments.");
                return;
              }

              addAppointmentForUser(user.email, {
                doctorId: selectedDoctor.id,
                doctorName: selectedDoctor.name,
                specialty: selectedDoctor.specialty,
                insurance: selectedInsurance,
                appointmentTime,
                city: selectedDoctor.city,
                state: selectedDoctor.state,
                npi: selectedDoctor.npi,
              });

              alert(`Appointment scheduled with ${selectedDoctor.name}.`);
            }}
          />
        </aside>
      </div>
    </div>
  );
}
