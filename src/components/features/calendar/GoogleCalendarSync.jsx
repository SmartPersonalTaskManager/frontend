import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useGoogleCalendar } from "../../../hooks/useGoogleCalendar";
import { api } from "../../../services/api";
import { useTasks } from "../../../context/TaskContext";
import { Calendar, AlertCircle, CheckCircle, Link2 } from "lucide-react";
import GoogleCalendarLogin from "./GoogleCalendarLogin";

export default function GoogleCalendarSync() {
  const {
    isAuthenticated,
    isLoading,
    error,
    createCalendarEvent,
    fetchCalendarEvents,
    calendarEvents,
    handleAuthCodeLoginSuccess // Need this to update context
  } = useGoogleCalendar();

  const { tasks } = useTasks();
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncedCount, setSyncedCount] = useState(0);
  const [showLinkButton, setShowLinkButton] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(null); // null = checking, true/false = result
  const [checkingConnection, setCheckingConnection] = useState(true);

  // Check if user has Google Calendar connection on mount
  useEffect(() => {
    const checkGoogleConnection = async () => {
      if (!isAuthenticated) {
        setCheckingConnection(false);
        return;
      }

      try {
        // Use the dedicated status endpoint to check connection
        const response = await api.get('/calendar/status');
        const connected = response.data?.connected === true;
        setIsGoogleConnected(connected);
        setShowLinkButton(!connected);
      } catch (err) {
        console.log("Google Calendar connection check error:", err.message);
        // If API call fails, assume not connected
        setIsGoogleConnected(false);
        setShowLinkButton(true);
      } finally {
        setCheckingConnection(false);
      }
    };

    checkGoogleConnection();
  }, [isAuthenticated]);

  const linkGoogleAccount = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (response) => {
      console.log("Auth Code received:", response.code);
      setSyncStatus("linking");
      try {
        await api.post('/calendar/sync', { code: response.code });
        // Handle success in context (although typically just sets user)
        if (handleAuthCodeLoginSuccess) handleAuthCodeLoginSuccess(response);

        setSyncStatus("success");
        setShowLinkButton(false);
        setIsGoogleConnected(true); // Mark as connected
        setTimeout(() => setSyncStatus(null), 3000);
      } catch (err) {
        console.error("Link error:", err);
        setSyncStatus("error");
      }
    },
    onError: (err) => {
      console.error("Google Link Error:", err);
      setSyncStatus("error");
    },
    scope: "https://www.googleapis.com/auth/calendar",
  });

  // Tarih string'ini güvenli şekilde parse eden yardımcı fonksiyon
  const parseDateSafely = (dateValue) => {
    if (!dateValue) return null;

    // Eğer zaten Date objesi ise
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    // String ise parse et
    if (typeof dateValue === 'string') {
      // YYYY-MM-DD formatı için özel işlem (timezone sorununu önlemek için)
      const dateOnlyMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        // Yerel saat dilimine göre gece yarısı yap
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      }

      // Diğer formatlar için standart parse
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  };

  const handleSyncTasksToCalendar = async () => {
    if (!isAuthenticated) {
      setSyncStatus("error");
      return;
    }

    setSyncStatus("syncing");
    setSyncedCount(0);
    let synced = 0;
    let skippedNoDate = 0;
    let skippedInvalidDate = 0;

    // Debug: Mevcut görevleri logla
    console.log("=== CALENDAR SYNC DEBUG ===");
    console.log("Total tasks in context:", tasks?.length || 0);
    console.log("Tasks:", tasks);

    try {
      // Tarihli görev sayısını kontrol et
      const tasksWithDates = tasks.filter(task => {
        const hasDate = task.dueDate && task.dueDate !== "";
        const parsedDate = parseDateSafely(task.dueDate);

        console.log(`Task "${task.title}": dueDate=${task.dueDate}, hasDate=${hasDate}, parsedDate=${parsedDate}`);

        if (!hasDate) {
          skippedNoDate++;
          return false;
        }
        if (!parsedDate) {
          skippedInvalidDate++;
          console.warn(`Invalid date format for task "${task.title}": ${task.dueDate}`);
          return false;
        }
        return true;
      });

      console.log(`Found ${tasksWithDates.length} tasks with valid dates (skipped ${skippedNoDate} without date, ${skippedInvalidDate} with invalid date)`);

      // Eğer senkronize edilecek görev yoksa
      if (tasksWithDates.length === 0) {
        setSyncedCount(0);
        setSyncStatus("no_tasks");
        setTimeout(() => setSyncStatus(null), 5000);
        return;
      }

      for (const task of tasksWithDates) {
        const parsedDate = parseDateSafely(task.dueDate);

        const calendarEvent = {
          taskId: task.id
        };

        console.log(`Creating calendar event for "${task.title}":`, calendarEvent);

        const result = await createCalendarEvent(calendarEvent);
        if (result) {
          synced++;
          console.log(`✓ Successfully synced: ${task.title}`);
        } else {
          console.warn(`✗ Failed to sync: ${task.title}`);
        }
      }

      setSyncedCount(synced);
      setSyncStatus("success");
      console.log(`=== SYNC COMPLETE: ${synced}/${tasksWithDates.length} tasks synced ===`);
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.error("Sync error:", err);
      if (err.message && err.message.includes("User is not connected")) {
        setShowLinkButton(true);
      }
      setSyncStatus("error");
    }
  };

  const handleFetchCalendarEvents = async () => {
    if (!isAuthenticated) {
      setSyncStatus("error");
      return;
    }

    setSyncStatus("syncing");
    try {
      const events = await fetchCalendarEvents();
      setSyncedCount(events.length);
      setSyncStatus("success");
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.message && err.message.includes("User is not connected")) {
        setShowLinkButton(true);
      }
      setSyncStatus("error");
    }
  };

  // !!! CHANGE HERE: Render Login component if not authenticated !!!
  if (!isAuthenticated) {
    return <GoogleCalendarLogin />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Calendar size={18} style={styles.icon} />
        <h3 style={styles.title}>Calendar Sync</h3>
      </div>

      {/* Connection Status */}
      {checkingConnection ? (
        <div style={{ padding: '0.5rem', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Checking Google Calendar connection...
        </div>
      ) : isGoogleConnected === false ? (
        <div style={{ padding: '0.75rem', marginBottom: '0.75rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px dashed #f59e0b', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#f59e0b' }}>
            ⚠️ Google Calendar is not connected. Connect to sync tasks and import events.
          </p>
          <button
            onClick={() => linkGoogleAccount()}
            disabled={syncStatus === 'linking'}
            style={{
              ...styles.button,
              backgroundColor: "#FFF",
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              width: "100%",
              opacity: syncStatus === 'linking' ? 0.7 : 1
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" fillRule="evenodd" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.049 13.56c-.806.54-1.836.86-3.049.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" fillRule="evenodd" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" fillRule="evenodd" />
              <path d="M9 3.58c1.321 0 2.508.455 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" fillRule="evenodd" />
            </svg>
            {syncStatus === 'linking' ? 'Connecting...' : 'Connect Google Calendar'}
          </button>
        </div>
      ) : isGoogleConnected === true ? (
        <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          Google Calendar connected
        </div>
      ) : null}

      <div style={styles.buttonGroup}>
        <button
          onClick={handleSyncTasksToCalendar}
          disabled={isLoading || !isGoogleConnected}
          style={{
            ...styles.button,
            opacity: (isLoading || !isGoogleConnected) ? 0.6 : 1,
            cursor: (isLoading || !isGoogleConnected) ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Syncing..." : "Sync Tasks to Calendar"}
        </button>
        <button
          onClick={handleFetchCalendarEvents}
          disabled={isLoading || !isGoogleConnected}
          style={{
            ...styles.button,
            backgroundColor: "rgba(100, 200, 255, 0.2)",
            borderColor: "rgba(100, 200, 255, 0.5)",
            opacity: (isLoading || !isGoogleConnected) ? 0.6 : 1,
            cursor: (isLoading || !isGoogleConnected) ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Fetching..." : "Fetch Calendar Events"}
        </button>
      </div>

      <div style={{ ...styles.buttonGroup, marginTop: '0.5rem' }}>
        <button
          onClick={() => window.open('https://calendar.google.com', '_blank')}
          style={{
            ...styles.button,
            backgroundColor: "#FFFFFF",
            border: "1px solid #dadce0",
            color: "#3c4043",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            width: "100%",
            borderRadius: "4px",
            height: "40px",
            fontWeight: "500",
            fontFamily: "'Roboto', sans-serif",
            fontSize: "0.875rem",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f8f9fa";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.15)";
            e.currentTarget.style.borderColor = "#d2e3fc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
            e.currentTarget.style.borderColor = "#dadce0";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" fillRule="evenodd" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.049 13.56c-.806.54-1.836.86-3.049.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" fillRule="evenodd" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" fillRule="evenodd" />
            <path d="M9 3.58c1.321 0 2.508.455 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" fillRule="evenodd" />
          </svg>
          <span style={{ paddingTop: '1px' }}>Open Google Calendar</span>
        </button>
      </div>

      {syncStatus === "success" && (
        <div style={styles.successMessage}>
          <CheckCircle size={16} style={styles.messageIcon} />
          <span>{syncedCount} item(s) processed</span>
        </div>
      )}

      {syncStatus === "no_tasks" && (
        <div style={styles.warningMessage}>
          <AlertCircle size={16} style={styles.messageIcon} />
          <span>Senkronize edilecek tarihli görev bulunamadı. Görevlerinize tarih ekleyerek takvime senkronize edebilirsiniz.</span>
        </div>
      )}

      {syncStatus === "error" && (
        <div style={styles.errorMessage}>
          <AlertCircle size={16} style={styles.messageIcon} />
          <span>{error || "Sync failed"}</span>
        </div>
      )}

      {/* Events List for Import */}
      {calendarEvents && calendarEvents.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Found {calendarEvents.length} Events (Click to Import)
          </h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {calendarEvents.map(event => (
              <CalendarEventItem key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {showLinkButton && (
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px dashed #f59e0b', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#f59e0b' }}>
            Google Calendar connection lost or not fully established. Please re-connect.
          </p>
          <button
            onClick={() => linkGoogleAccount()}
            style={{
              ...styles.button,
              backgroundColor: "#FFF",
              color: "#333",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" fillRule="evenodd" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.049 13.56c-.806.54-1.836.86-3.049.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" fillRule="evenodd" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" fillRule="evenodd" />
              <path d="M9 3.58c1.321 0 2.508.455 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" fillRule="evenodd" />
            </svg>
            Reconnect Google Calendar
          </button>
        </div>
      )}

    </div>
  );
}

function CalendarEventItem({ event }) {
  const { addTask } = useTasks();
  const [imported, setImported] = useState(false);

  // Backend returns "startTime" (ISO string), GAPI returned "start.dateTime"
  // We handle both for robustness, but prioritize backend format.
  const startTime = event.startTime || (event.start && (event.start.dateTime || event.start.date));
  const summary = event.summary || event.title || "No Title";
  const description = event.description || "";

  const handleImport = () => {
    addTask({
      title: summary,
      description: description + "\n\n[Imported from Google Calendar]",
      dueDate: startTime ? new Date(startTime).toISOString().split('T')[0] : null,
      context: '@work' // Default context
    });
    setImported(true);
  };

  if (imported) return null;

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px',
      fontSize: '0.85rem', marginBottom: '0.25rem'
    }}>
      <div style={{ overflow: 'hidden', flex: 1, marginRight: '0.5rem' }}>
        <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-main)' }}>
          {summary}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {startTime ? new Date(startTime).toLocaleDateString() : 'No Date'}
          {startTime && ` • ${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        </div>
      </div>
      <button
        onClick={handleImport}
        className="btn btn-ghost"
        style={{
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          color: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        disabled={imported}
      >
        <div>Import</div>
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "1rem",
    backgroundColor: "rgba(var(--color-primary-rgb, 99, 102, 241), 0.08)",
    borderRadius: "8px",
    border: "1px solid rgba(var(--color-primary-rgb, 99, 102, 241), 0.15)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  icon: {
    color: "var(--color-primary, #6366f1)",
  },
  title: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "var(--color-text-main)"
  },
  buttonGroup: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.75rem",
    flexWrap: "wrap",
  },
  button: {
    padding: "0.5rem 0.8rem",
    backgroundColor: "rgba(var(--color-primary-rgb, 99, 102, 241), 0.15)",
    color: "#fff",
    border: "1px solid rgba(var(--color-primary-rgb, 99, 102, 241), 0.3)",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    transition: "all 0.3s ease",
    flex: 1,
    minWidth: "140px",
    fontWeight: "500",
  },
  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.6rem",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    color: "#81c784",
    borderRadius: "6px",
    marginBottom: "0.5rem",
    fontSize: "0.85rem",
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.6rem",
    backgroundColor: "rgba(244, 67, 54, 0.15)",
    color: "#ef5350",
    borderRadius: "6px",
    marginBottom: "0.5rem",
    fontSize: "0.85rem",
  },
  warningMessage: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    padding: "0.6rem",
    backgroundColor: "rgba(255, 193, 7, 0.15)",
    color: "#ffc107",
    borderRadius: "6px",
    marginBottom: "0.5rem",
    fontSize: "0.8rem",
    lineHeight: "1.4",
  },
  messageIcon: {
    flexShrink: 0,
  },
  info: {
    margin: "0.5rem 0 0 0",
    color: "var(--color-text-muted)",
    fontSize: "0.75rem",
    lineHeight: "1.3",
  },
};
