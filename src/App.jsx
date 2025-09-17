// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";

// DEINE Seiten:
import Chat from "./pages/Chat";
import Aktuelles from "./pages/Aktuelles";
import GruppenVerwaltung from "./pages/Verwaltung/Gruppen";
import Profileinstellungen from "./pages/Profileinstellungen";

// Auth-Seiten:
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// Guard:
import ProtectedRoute from "./pages/Auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* öffentlich */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/passwort-vergessen" element={<ForgotPassword />} />

        {/* geschützt */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/aktuelles" replace />} />
          <Route path="/aktuelles" element={<Aktuelles />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/verwaltung/gruppen" element={<GruppenVerwaltung />} />
          {/* weitere Unterpunkte, falls vorhanden */}
          <Route path="/profileinstellungen" element={<Profileinstellungen />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/aktuelles" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
