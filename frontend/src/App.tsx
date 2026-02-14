import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./Components/Landing/Landing";
import LoginForm from "./Components/LoginForm/LoginForm";
import RegisterForm from "./Components/RegisterForm/RegisterForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/symptom-checker" element={<Landing />} />
        <Route path="/find-a-provider" element={<Landing />} />
        <Route path="/your-profile" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
