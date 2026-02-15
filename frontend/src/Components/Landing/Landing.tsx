import "./Landing.css";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import mainLogo from "../Assets/connecther-logo.png";
import textLogo from "../Assets/text-logo.png";
import heroImage from "../Assets/doctor-consultation.png";
import womanYoga from "../Assets/woman-yoga.png";

function Landing() {
  const { user, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const displayName = user?.name || "Guest";
    document.title = `ConnectHER - Welcome, ${displayName}`;
  }, [user?.name]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuOpen) return;
      if (!navWrapRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="landing-root">
      <div className="parallax-bg" aria-hidden="true" />

      <header>
        <h1 className="logo">
          <img src={mainLogo} alt="" className="logo-img logo-main" />
          <img src={textLogo} alt="ConnectHER" className="logo-img logo-text" />
        </h1>
        <div className="container" ref={navWrapRef}>
          <button
            type="button"
            className="hamburger"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={menuOpen ? "nav open" : "nav"}>
            <ul className="nav-links">
              <li>
                <Link
                  to={isAuthenticated ? "/your-profile" : "/login"}
                  onClick={() => setMenuOpen(false)}
                >
                  {isAuthenticated ? "Logged In" : "Login"}
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="/your-profile"
                  onClick={() => setMenuOpen(false)}
                >
                  Your Profile
                </Link>
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

      <section id="about" className="about-section">
        <div className="container about-shell">
          <article className="about-card">
            <div className="about-media" aria-hidden="true">
              <img src={womanYoga} alt="" className="about-media-image" />
            </div>
            <div className="about-content">
              <p className="about-eyebrow">Our Mission</p>
              <h3>
                ConnectHer empowers women with accessible healthcare guidance,
                trusted resources, and faster paths to care.
              </h3>
              <p className="about-body">
                We built this platform to reduce uncertainty, improve health
                literacy, and help every user move from symptoms to informed
                care decisions with confidence.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section
        className="parallax-transition"
        aria-hidden="true"
      >
        <div className="transition-shape transition-shape-a" />
        <div className="transition-shape transition-shape-b" />
      </section>
    </div>
  );
}

export default Landing;
