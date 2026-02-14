import "./Landing.css";
import { useEffect } from "react";

function Landing() {
  useEffect(() => {
    document.title = "ConnectHER";

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
  }, []);

  return (
    <div className="landing-root">
      <div className="parallax-bg" aria-hidden="true" />

      <header>
        <h1 className="logo">ConnectHER</h1>
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
          <div className="hero-content">
            <h2>Accessible Women's Healthcare, Anytime</h2>
            <h3>Understand your symptoms. Find the right care.</h3>
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
