import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./Components/Landing/Landing";
import LoginForm from "./Components/LoginForm/LoginForm";
import RegisterForm from "./Components/RegisterForm/RegisterForm";
import FindDoctorPage from "./Components/FindDoctor/FindDoctor";
import Dashboard from "./Components/Dashboard/Dashboard";
import Onboarding from "./Components/Onboarding/Onboarding";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* LANDING */}
          <Route path="/" element={<Landing />} />

          {/* AUTH FLOW */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* ONBOARDING - requires auth but not onboarding completion */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* PUBLIC PAGES */}
          <Route path="/symptom-checker" element={<Landing />} />
          <Route path="/find-a-provider" element={<FindDoctorPage />} />

          {/* PROTECTED ROUTES - require both auth and onboarding */}
          <Route
            path="/your-profile"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
