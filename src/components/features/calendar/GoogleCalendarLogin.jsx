import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useGoogleCalendar } from "../../../hooks/useGoogleCalendar";
import { LogOut, Calendar, Loader2 } from "lucide-react";
import { api } from "../../../services/api";

export default function GoogleCalendarLogin() {
  const {
    isAuthenticated,
    googleUser,
    handleAuthCodeLoginSuccess,
    handleLoginFailure,
    logout,
    error,
  } = useGoogleCalendar();

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const login = useGoogleLogin({
    flow: 'auth-code', // KRİTİK: Implicit yerine Auth Code Flow
    onSuccess: async (response) => {
      console.log("Auth Code received:", response.code);
      setIsConnecting(true);
      setConnectionError(null);

      try {
        // Authorization code'u backend'e gönder
        await api.post('/calendar/sync', { code: response.code });

        // Başarılı olursa user info'yu al ve context'i güncelle
        await handleAuthCodeLoginSuccess(response);
      } catch (err) {
        console.error("Backend sync error:", err);
        setConnectionError("Google Calendar bağlantısı kurulamadı. Lütfen tekrar deneyin.");
        handleLoginFailure();
      } finally {
        setIsConnecting(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setConnectionError("Google ile giriş başarısız oldu.");
      handleLoginFailure();
    },
    scope: "https://www.googleapis.com/auth/calendar",
  });

  if (isAuthenticated && googleUser) {
    return (
      <div style={styles.container}>
        <div style={styles.userInfo}>
          <div style={styles.greeting}>{googleUser.name || "User"}</div>
          <p style={styles.email}>{googleUser.email}</p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={14} />
          Disconnect
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Google Calendar</h4>
      <p style={styles.description}>Connect to sync tasks</p>

      <button
        onClick={() => login()}
        disabled={isConnecting}
        style={{
          ...styles.googleBtn,
          opacity: isConnecting ? 0.7 : 1,
          cursor: isConnecting ? 'not-allowed' : 'pointer',
        }}
      >
        {isConnecting ? (
          <>
            <Loader2 size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
            Connecting...
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '50%', width: '18px', height: '18px', marginRight: '8px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
            </div>
            Sign in with Google
          </>
        )}
      </button>

      {(error || connectionError) && <p style={styles.error}>{connectionError || error}</p>}
    </div>
  );
}

const styles = {
  container: {
    padding: "1rem",
    backgroundColor: "rgba(var(--color-primary-rgb, 99, 102, 241), 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "8px",
    border: "1px solid rgba(var(--color-primary-rgb, 99, 102, 241), 0.2)",
    fontSize: "0.85rem",
  },
  title: {
    margin: "0 0 0.3rem 0",
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  description: {
    margin: "0 0 0.8rem 0",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "0.75rem",
  },
  userInfo: {
    marginBottom: "0.8rem",
  },
  greeting: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: "0.2rem",
    fontSize: "0.9rem",
  },
  email: {
    color: "rgba(255, 255, 255, 0.6)",
    margin: 0,
    fontSize: "0.75rem",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    width: "100%",
    padding: "0.5rem 0.8rem",
    backgroundColor: "rgba(var(--color-danger-rgb, 239, 68, 68), 0.2)",
    color: "#fff",
    border: "1px solid rgba(var(--color-danger-rgb, 239, 68, 68), 0.3)",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.75rem",
    transition: "all 0.3s ease",
    fontWeight: "500",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "0.5rem 0.8rem",
    backgroundColor: "#4285F4",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  error: {
    color: "#ff6b6b",
    marginTop: "0.5rem",
    fontSize: "0.7rem",
  },
};
