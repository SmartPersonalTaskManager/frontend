import React, { useState } from "react";
import { useGoogleCalendar } from "../../../hooks/useGoogleCalendar";
import { useTasks } from "../../../context/TaskContext";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";

export default function GoogleCalendarSync() {
  const {
    isAuthenticated,
    isLoading,
    error,
    createCalendarEvent,
    fetchCalendarEvents,
    calendarEvents
  } = useGoogleCalendar();

  const { tasks } = useTasks();
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncedCount, setSyncedCount] = useState(0);

  const handleSyncTasksToCalendar = async () => {
    if (!isAuthenticated) {
      setSyncStatus("error");
      return;
    }

    setSyncStatus("syncing");
    setSyncedCount(0);
    let synced = 0;

    try {
      for (const task of tasks) {
        if (task.dueDate && task.dueDate !== "") {
          const calendarEvent = {
            title: task.title,
            description: task.description || `Priority: ${task.priority}`,
            startTime: new Date(task.dueDate).toISOString(),
            endTime: new Date(
              new Date(task.dueDate).getTime() + 60 * 60 * 1000
            ).toISOString(),
            missionId: task.missionId,
            taskId: task.id,
            context: task.context,
          };

          const result = await createCalendarEvent(calendarEvent);
          if (result) {
            synced++;
          }
        }
      }

      setSyncedCount(synced);
      setSyncStatus("success");
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.error("Sync error:", err);
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
      setSyncStatus("error");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Calendar size={18} style={styles.icon} />
        <h3 style={styles.title}>Calendar Sync</h3>
      </div>

      <div style={styles.buttonGroup}>
        <button
          onClick={handleSyncTasksToCalendar}
          disabled={isLoading}
          style={{
            ...styles.button,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Syncing..." : "Sync Tasks to Calendar"}
        </button>
        <button
          onClick={handleFetchCalendarEvents}
          disabled={isLoading}
          style={{
            ...styles.button,
            backgroundColor: "rgba(100, 200, 255, 0.2)",
            borderColor: "rgba(100, 200, 255, 0.5)",
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Fetching..." : "Fetch Calendar Events"}
        </button>
      </div>

      {syncStatus === "success" && (
        <div style={styles.successMessage}>
          <CheckCircle size={16} style={styles.messageIcon} />
          <span>{syncedCount} item(s) processed</span>
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

      <p style={styles.info}>
        Sync your tasks with Google Calendar to keep everything organized.
        Fetch events to import them as tasks.
      </p>
    </div>
  );
}

function CalendarEventItem({ event }) {
  const { addTask } = useTasks();
  const [imported, setImported] = useState(false);

  const handleImport = () => {
    addTask({
      title: event.summary || "No Title",
      description: (event.description || "") + "\n\n[Imported from Google Calendar]",
      dueDate: event.start.dateTime ? event.start.dateTime.split('T')[0] : (event.start.date || null),
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
          {event.summary || "No Title"}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {new Date(event.start.dateTime || event.start.date).toLocaleDateString()}
          {event.start.dateTime && ` • ${new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
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
