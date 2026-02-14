import React from "react";
import "./RegisterForm.css";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";

const RegisterForm = () => {
  return (
    <div className="register-page">
      <div className="wrapper">
        <form action="">
          <h1>Parent/Caregiver Registration</h1>
          <div className="input-box">
            <input
              type="text"
              placeholder="Child's First + Last Name"
              required
            />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input
              type="text"
              placeholder="Parent/Caregiver First + Last Name"
              required
            />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input type="email" placeholder="Parent/Caregiver Email" required />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" required />
            <FaLock className="icon" />
          </div>

          <button type="submit">Register</button>

          <div className="login-link">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
