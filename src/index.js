// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./pages/Auth/AuthContext";
import { GroupsProvider } from "./state/GroupsContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <GroupsProvider>
        <App />
      </GroupsProvider>
    </AuthProvider>
  </React.StrictMode>
);
