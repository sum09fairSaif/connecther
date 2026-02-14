import React from "react";
import "./LoginForm.css";
import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { FaAt } from "react-icons/fa";

const LoginForm = () => {
  return (
    <div className="login-page">
      <div className="wrapper">
        <form action="">
          <h1>Log In</h1>
          <div className="input-box">
            <input type="email" placeholder="Email" required />
            <FaAt className="icon" />
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" required />
            <FaLock className="icon" />
          </div>

          <div className="remember-forgot">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit">Login</button>

          <div className="register-link">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;