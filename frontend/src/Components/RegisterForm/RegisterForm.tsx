import React from "react";
import "./RegisterForm.css";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { FaAt } from "react-icons/fa";

const RegisterForm = () => {
  return (
    <div className="register-page">
      <div className="wrapper">
        <form action="">
          <h1>Register</h1>
          <div className="input-box">
            <input type="text" placeholder="First Name" required />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input type="text" placeholder="Last Name" required />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input type="email" placeholder="Email" required />
            <FaAt className="icon" />
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
