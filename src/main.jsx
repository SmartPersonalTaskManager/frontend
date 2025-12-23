import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import { MissionProvider } from "./context/MissionContext";
import { TaskProvider } from "./context/TaskContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleCalendarProvider } from "./context/GoogleCalendarContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GoogleCalendarProvider>
        <MissionProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
        </MissionProvider>
      </GoogleCalendarProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
