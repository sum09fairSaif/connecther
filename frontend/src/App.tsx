import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./Components/Landing/Landing";
import LoginForm from "./Components/LoginForm/LoginForm";
import RegisterForm from "./Components/RegisterForm/RegisterForm";
import FindDoctorPage from "./Components/FindDoctor/FindDoctor";
import Onboarding from "./Components/Onboarding/Onboarding";
import SymptomChecker from "./Components/SymptomChecker/SymptomChecker";
import Recommendations from "./Components/Recommendations/Recommendations";
import Dashboard from "./Components/Dashboard/Dashboard";
import NameSetup from "./Components/NameSetup/NameSetup";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import Loading from "./Components/Loading/Loading";
import WorkoutRecommendations from "./Components/WorkoutRecommendations/WorkoutRecommendations";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/workout-recommendations" element={<WorkoutRecommendations />} />
          <Route path="/find-a-provider" element={<FindDoctorPage />} />

          <Route
            path="/name-setup"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <NameSetup />
              </ProtectedRoute>
            }
          />

          <Route
            path="/your-profile"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
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
