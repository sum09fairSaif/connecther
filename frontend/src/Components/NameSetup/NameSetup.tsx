import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./NameSetup.css";

function NameSetup() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    setIsSubmitting(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Update user in localStorage
      if (user) {
        const updatedUser = { ...user, name: fullName };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Force page reload to update auth context
        window.location.href = "/your-profile";
      }
    } catch (error) {
      console.error("Error updating name:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="name-setup-container">
      <div className="name-setup-card">
        <div className="name-setup-header">
          <div className="setup-icon">👋</div>
          <h1 className="setup-title">Welcome!</h1>
          <p className="setup-subtitle">Let's get to know you better</p>
        </div>

        <form onSubmit={handleSubmit} className="name-setup-form">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
              placeholder="Enter your first name"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input"
              placeholder="Enter your last name (optional)"
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={!firstName.trim() || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NameSetup;
