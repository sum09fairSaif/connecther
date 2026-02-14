import "./Landing.css";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import mainLogo from "../Assets/connecther-logo.png";
import textLogo from "../Assets/text-logo.png";
import heroImage from "../Assets/doctor-consultation.png";

function Landing() {
  const { user } = useAuth();

  useEffect(() => {
    const displayName = user?.name || "Guest";
    document.title = `ConnectHER - Welcome, ${displayName}`;

    const onScroll = () => {
      const y = window.scrollY;
      document.documentElement.style.setProperty(
        "--parallax-y",
        `${y * 0.35}px`,
      );
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [user?.name]);

  return (
    <div className="landing-root">
      <div className="parallax-bg" aria-hidden="true" />

      <header>
        <h1 className="logo">
          <img src={mainLogo} alt="" className="logo-img logo-main" />
          <img src={textLogo} alt="ConnectHER" className="logo-img logo-text" />
        </h1>
        <div className="container">
          <nav>
            <ul className="nav-links">
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <section id="hero">
        <div className="container">
          <div className="hero-layout">
            <div className="hero-content">
              <h2>Accessible Women's Healthcare, Anytime</h2>
              <h3>Understand your symptoms. Find the right care.</h3>
              <div className="hero-actions">
                <Link to="/symptom-checker" className="service-button">
                  Symptom Checker
                </Link>
                <Link to="/find-a-provider" className="service-button">
                  Find a Provider
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <img
                src={heroImage}
                alt="Doctor consultation illustration"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="spacer" aria-hidden="true" />

      <div className="footer-container">
        <ul className="important-info">
          <li>
            <strong>Disclaimer:</strong> ConnectHER is an informational tool and
            not a substitute for professional medical advice. Always consult a
            healthcare provider for medical concerns.
          </li>
          <li>
            <strong>Privacy:</strong> We prioritize your privacy. Your data is
            securely stored and never shared without your consent.
          </li>
          <li>
            <strong>Inclusive:</strong> We are committed to providing accessible
            and inclusive healthcare information for all women.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Landing;
