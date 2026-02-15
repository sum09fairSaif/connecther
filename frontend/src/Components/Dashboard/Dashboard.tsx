import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import fullLogo from "../Assets/full-logo.png";
import "./Dashboard.css";
import { getAppointmentsForUser, type StoredAppointment } from "../../services/appointments.storage";

function splitName(fullName?: string) {
  if (!fullName) return { firstName: "User", lastName: "" };
  const cleaned = fullName.trim();
  if (!cleaned) return { firstName: "User", lastName: "" };
  const parts = cleaned.split(/\s+/);
  return {
    firstName: parts[0] || "User",
    lastName: parts.slice(1).join(" "),
  };
}

function extractFirstNumber(value: string): number | null {
  const match = value.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function heightToMeters(height: string): number | null {
  const value = height.trim().toLowerCase();
  if (!value) return null;

  const feetInches = value.match(/(\d+)\s*'\s*(\d+)?/);
  if (feetInches) {
    const feet = Number(feetInches[1] || 0);
    const inches = Number(feetInches[2] || 0);
    return (feet * 12 + inches) * 0.0254;
  }

  const n = extractFirstNumber(value);
  if (!n) return null;

  if (value.includes("cm")) return n / 100;
  if (value.includes("m")) return n;
  if (value.includes("in")) return n * 0.0254;
  if (value.includes("ft")) return n * 0.3048;

  if (n > 100) return n / 100;
  if (n > 3) return n * 0.0254;
  return n;
}

function weightToKg(weight: string): number | null {
  const value = weight.trim().toLowerCase();
  if (!value) return null;
  const n = extractFirstNumber(value);
  if (!n) return null;
  if (value.includes("kg")) return n;
  return n * 0.45359237;
}

function calculateBmi(height: string, weight: string): string {
  const meters = heightToMeters(height);
  const kg = weightToKg(weight);
  if (!meters || !kg || meters <= 0) return "-";
  const bmi = kg / (meters * meters);
  if (!Number.isFinite(bmi)) return "-";
  return bmi.toFixed(1);
}

function Dashboard() {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [form, setForm] = useState({
    age: "",
    location: "",
    height: "",
    weight: "",
    dueDate: "",
    weeksPregnant: "",
  });

  useEffect(() => {
    if (user && user.name) {
      const hasProperName =
        !user.name.includes("@") && user.name.split(" ").length >= 1 && user.name.length > 2;

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email && (parsed.name === parsed.email.split("@")[0] || !hasProperName)) {
          navigate("/name-setup", { replace: true });
        }
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    setForm({
      age: user?.age !== undefined ? String(user.age) : "",
      location: user?.location || "",
      height: user?.height || "",
      weight: user?.weight || "",
      dueDate: user?.dueDate || "",
      weeksPregnant: user?.weeksPregnant !== undefined ? String(user.weeksPregnant) : "",
    });
  }, [user]);

  useEffect(() => {
    if (!user?.email) {
      setAppointments([]);
      return;
    }
    setAppointments(getAppointmentsForUser(user.email));
  }, [user?.email]);

  const { firstName, lastName } = splitName(user?.name);
  const avatarInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`
    .trim()
    .toUpperCase() || "U";
  const bmiFromForm = useMemo(() => calculateBmi(form.height, form.weight), [form.height, form.weight]);
  const bmiFromProfile = calculateBmi(user?.height || "", user?.weight || "");

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        age: form.age ? Number(form.age) : undefined,
        location: form.location.trim() || undefined,
        height: form.height.trim(),
        weight: form.weight.trim(),
        dueDate: form.dueDate || undefined,
        weeksPregnant: form.weeksPregnant ? Number(form.weeksPregnant) : undefined,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={fullLogo} alt="ConnectHER" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li className="sidebar-item active">
              <Link to="/your-profile" className="sidebar-link">
                Dashboard
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/find-a-provider" className="sidebar-link">
                Find a Doctor
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/symptom-checker" className="sidebar-link">
                Symptom Checker
              </Link>
            </li>
          </ul>

          <button onClick={logout} className="logout-button">
            Log Out
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <section className="profile-hero-card">
            <div className="profile-hero-top">
              <div>
                <div className="welcome-heading-row">
                  <div className="welcome-avatar" aria-hidden="true">
                    <span className="welcome-avatar-icon">{avatarInitials}</span>
                  </div>
                  <h1 className="greeting-title">Welcome back, {firstName}!</h1>
                </div>
                <p className="greeting-subtitle">Your profile summary</p>
              </div>
              <button
                type="button"
                className="edit-profile-button"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                {isEditing ? "Close" : "Edit Profile"}
              </button>
            </div>

            <div className="profile-grid">
              <div className="profile-row">
                <span className="profile-label">First Name</span>
                <span className="profile-value">{firstName || "-"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Last Name</span>
                <span className="profile-value">{lastName || "-"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user?.email || "-"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Age</span>
                <span className="profile-value">{user?.age ?? "-"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Location</span>
                <span className="profile-value">{user?.location || "-"}</span>
              </div>
            </div>
          </section>

          <section className="dashboard-card profile-details-card">
            <h2 className="card-title">Profile Details</h2>

            <div className="profile-grid details-grid">
              <div className="profile-row">
                <span className="profile-label">Weight</span>
                <span className="profile-value">{user?.weight || "-"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Height</span>
                <span className="profile-value">{user?.height || "-"}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">BMI</span>
                <span className="profile-value">{bmiFromProfile}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Due Date</span>
                <span className="profile-value">
                  {user?.dueDate ? new Date(user.dueDate).toLocaleDateString() : "-"}
                </span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Week of Pregnancy</span>
                <span className="profile-value">{user?.weeksPregnant ?? "-"}</span>
              </div>
            </div>

            {isEditing && (
              <div className="edit-panel">
                <h3 className="edit-title">Edit Profile</h3>
                <div className="edit-grid">
                  <label className="edit-field">
                    <span>Age</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.age}
                      onChange={(e) => handleFormChange("age", e.target.value)}
                      placeholder="Enter your age"
                    />
                  </label>

                  <label className="edit-field">
                    <span>Location / Address</span>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => handleFormChange("location", e.target.value)}
                      placeholder="e.g., Austin, TX"
                    />
                  </label>

                  <label className="edit-field">
                    <span>Weight</span>
                    <input
                      type="text"
                      value={form.weight}
                      onChange={(e) => handleFormChange("weight", e.target.value)}
                      placeholder="e.g., 140 lbs or 63.5 kg"
                    />
                  </label>

                  <label className="edit-field">
                    <span>Height</span>
                    <input
                      type="text"
                      value={form.height}
                      onChange={(e) => handleFormChange("height", e.target.value)}
                      placeholder="e.g., 5'6 or 167 cm"
                    />
                  </label>

                  <label className="edit-field">
                    <span>BMI</span>
                    <input type="text" value={bmiFromForm} readOnly />
                  </label>

                  <label className="edit-field">
                    <span>Due Date</span>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => handleFormChange("dueDate", e.target.value)}
                    />
                  </label>

                  <label className="edit-field">
                    <span>Week of Pregnancy</span>
                    <input
                      type="number"
                      min={1}
                      max={42}
                      value={form.weeksPregnant}
                      onChange={(e) => handleFormChange("weeksPregnant", e.target.value)}
                      placeholder="1-42"
                    />
                  </label>
                </div>

                <div className="edit-actions">
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="primary-action"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="dashboard-card appointments-card">
            <h2 className="card-title">Upcoming Appointments</h2>
            {appointments.length === 0 ? (
              <p className="appointments-empty">
                No appointments scheduled yet. Book one from Find a Doctor.
              </p>
            ) : (
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <div className="appointment-row" key={appointment.id}>
                    <div className="appointment-main">
                      <div className="appointment-doctor">{appointment.doctorName}</div>
                      <div className="appointment-specialty">{appointment.specialty}</div>
                    </div>
                    <div className="appointment-meta">
                      <div>{appointment.appointmentTime}</div>
                      <div>{appointment.insurance}</div>
                      <div>
                        {[appointment.city, appointment.state].filter(Boolean).join(", ") || "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
