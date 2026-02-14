import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Loading.css";

/** Key used in sessionStorage to allow access to the loading page. */
export const REPORT_SUBMITTED_KEY = "connecther-report-submitted";

/**
 * Call this after the user submits their symptom report and you're about to create recommendations.
 * Sets the flag so /loading is allowed, then navigates to the loading page.
 */
export function goToLoadingPage(navigate: (to: string, options?: { replace?: boolean }) => void) {
  sessionStorage.setItem(REPORT_SUBMITTED_KEY, "true");
  navigate("/loading", { replace: true });
}

export default function Loading() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const submitted = sessionStorage.getItem(REPORT_SUBMITTED_KEY);
    if (!submitted) {
      navigate("/", { replace: true });
      return;
    }
    setAllowed(true);
  }, [navigate]);

  if (allowed !== true) {
    return null;
  }

  return (
    <div className="loading-page">
      <div className="loading-spinner" aria-hidden="true" />
      <h2 className="loading-heading">Creating your tailored picks ✨</h2>
      <p className="loading-text">
        We’re building personalized video recommendations just for you based on your symptoms. Almost there!
      </p>
    </div>
  );
}
