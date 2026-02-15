import type { Doctor } from "../FindDoctor";
import { useEffect, useState } from "react";
import { insuranceOptions } from "../data/options";

type Props = {
  doctor: Doctor | null;
  onConfirm: (payload: { insurance: string; appointmentTime: string }) => void;
  userInsurance?: string;
};

export default function BookingPanel({ doctor, onConfirm, userInsurance }: Props) {
  const [selectedInsurance, setSelectedInsurance] = useState(
    userInsurance || doctor?.accepts || "",
  );
  const [selectedTime, setSelectedTime] = useState("");
  const canConfirm = !!doctor && !!selectedInsurance && !!selectedTime;

  useEffect(() => {
    setSelectedInsurance(userInsurance || doctor?.accepts || "");
  }, [doctor, userInsurance]);

  useEffect(() => {
    setSelectedTime("");
  }, [doctor]);

  return (
    <div className="card pad">
      <h3 className="fd-subtitle">Booking Summary</h3>

      {!doctor ? (
        <p className="fd-empty-note">Select a doctor to see appointment details.</p>
      ) : (
        <div className="fd-booking-grid">
          <div className="fd-doctor-name">{doctor.name}</div>
          <div className="fd-doctor-meta">
            {doctor.specialty} | 15 min video consultation
          </div>

          <div className="fd-form-grid">
            <label className="fd-field-label">Insurance</label>
            <select
              className="fd-select"
              value={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
            >
              <option value="">Select Insurance</option>
              {insuranceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="fd-field-label">Appointment Time</label>
            <select
              className="fd-select"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">Select Time</option>
              <optgroup label="Monday">
                <option value="Monday, 9:00 AM">Monday, 9:00 AM</option>
                <option value="Monday, 10:00 AM">Monday, 10:00 AM</option>
                <option value="Monday, 11:00 AM">Monday, 11:00 AM</option>
                <option value="Monday, 2:00 PM">Monday, 2:00 PM</option>
                <option value="Monday, 3:00 PM">Monday, 3:00 PM</option>
                <option value="Monday, 4:00 PM">Monday, 4:00 PM</option>
              </optgroup>
              <optgroup label="Tuesday">
                <option value="Tuesday, 9:00 AM">Tuesday, 9:00 AM</option>
                <option value="Tuesday, 10:00 AM">Tuesday, 10:00 AM</option>
                <option value="Tuesday, 11:00 AM">Tuesday, 11:00 AM</option>
                <option value="Tuesday, 2:00 PM">Tuesday, 2:00 PM</option>
                <option value="Tuesday, 3:00 PM">Tuesday, 3:00 PM</option>
                <option value="Tuesday, 4:00 PM">Tuesday, 4:00 PM</option>
              </optgroup>
              <optgroup label="Wednesday">
                <option value="Wednesday, 9:00 AM">Wednesday, 9:00 AM</option>
                <option value="Wednesday, 10:00 AM">Wednesday, 10:00 AM</option>
                <option value="Wednesday, 11:00 AM">Wednesday, 11:00 AM</option>
                <option value="Wednesday, 2:00 PM">Wednesday, 2:00 PM</option>
                <option value="Wednesday, 3:00 PM">Wednesday, 3:00 PM</option>
                <option value="Wednesday, 4:00 PM">Wednesday, 4:00 PM</option>
              </optgroup>
              <optgroup label="Thursday">
                <option value="Thursday, 9:00 AM">Thursday, 9:00 AM</option>
                <option value="Thursday, 10:00 AM">Thursday, 10:00 AM</option>
                <option value="Thursday, 11:00 AM">Thursday, 11:00 AM</option>
                <option value="Thursday, 2:00 PM">Thursday, 2:00 PM</option>
                <option value="Thursday, 3:00 PM">Thursday, 3:00 PM</option>
                <option value="Thursday, 4:00 PM">Thursday, 4:00 PM</option>
              </optgroup>
              <optgroup label="Friday">
                <option value="Friday, 9:00 AM">Friday, 9:00 AM</option>
                <option value="Friday, 10:00 AM">Friday, 10:00 AM</option>
                <option value="Friday, 11:00 AM">Friday, 11:00 AM</option>
                <option value="Friday, 2:00 PM">Friday, 2:00 PM</option>
                <option value="Friday, 3:00 PM">Friday, 3:00 PM</option>
                <option value="Friday, 4:00 PM">Friday, 4:00 PM</option>
              </optgroup>
            </select>
          </div>
        </div>
      )}

      <button
        onClick={() =>
          onConfirm({ insurance: selectedInsurance, appointmentTime: selectedTime })
        }
        disabled={!canConfirm}
        className="fd-confirm-btn"
      >
        Confirm Appointment
      </button>
    </div>
  );
}
