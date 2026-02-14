import "./Landing.css";
import brandLogo from "../Assets/connecther-logo.png";
import heroImage from "../Assets/doctor-consultation.png";

function Landing() {
  return (
    <div className="landing-root">
      <div className="parallax-bg" aria-hidden="true" />

      <header>
        <h1 className="logo">
          <img src={brandLogo} alt="ConnectHER logo" className="logo-img" />
        </h1>
        <div className="container">
          <nav>
            <ul className="nav-links">
              <li>
                <a href="/login">Login</a>
              </li>
              <li>
                <a href="/register">Register</a>
              </li>
              <li>
                <a href="/your-profile">Your Profile</a>
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
                <a href="/symptom-checker" className="service-button">
                  Symptom Checker
                </a>
                <a href="/find-a-provider" className="service-button">
                  Find a Provider
                </a>
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
