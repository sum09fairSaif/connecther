import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./Components/Landing/Landing";
import LoginForm from "./Components/LoginForm/LoginForm";
import RegisterForm from "./Components/RegisterForm/RegisterForm";
import Dashboard from "./Components/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LANDING */}
        <Route path="/" element={<Landing />} />

        {/* AUTH FLOW */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/your-profile"element= {<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
