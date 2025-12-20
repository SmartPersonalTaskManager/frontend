import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import { MissionProvider } from "./context/MissionContext";
import { TaskProvider } from "./context/TaskContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <MissionProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
      </MissionProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
