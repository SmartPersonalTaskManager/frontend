import { useState } from "react";
import { Settings } from "lucide-react";
import MissionView from "./components/features/mission/MissionView";
import CoveyMatrix from "./components/features/tasks/CoveyMatrix";
import MissionWidget from "./components/features/mission/MissionWidget";
import CalendarView from "./components/features/calendar/CalendarView";
import StatsView from "./components/features/stats/StatsView";
import ArchivedTasksView from "./components/features/tasks/ArchivedTasksView";
import InboxWidget from "./components/features/inbox/InboxWidget";
import WeeklyReview from "./components/features/review/WeeklyReview";
import NotificationsWidget from "./components/features/notifications/NotificationsWidget";
import { GoogleCalendarProvider } from "./context/GoogleCalendarContext";
import { useGoogleCalendar } from "./hooks/useGoogleCalendar";

import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useTasks } from './context/TaskContext';
import TaskCard from './components/features/tasks/TaskCard';
import Sidebar from "./components/layout/Sidebar";
import WelcomePage from "./components/layout/WelcomePage";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMissionCollapsed, setMissionCollapsed] = useState(false);
  const { updateTask, tasks } = useTasks();
  const [activeDragId, setActiveDragId] = useState(null);
  const { isAuthenticated, logout, googleUser } = useGoogleCalendar();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const quadrant = over.id;
      let updates = {};

      switch (quadrant) {
        case 'q1': updates = { urge: true, imp: true }; break;
        case 'q2': updates = { urge: false, imp: true }; break;
        case 'q3': updates = { urge: true, imp: false }; break;
        case 'q4': updates = { urge: false, imp: false }; break;
        default: return;
      }

      updateTask(active.id, {
        ...updates,
        isInbox: false,
        context: '@home'
      });
    }
  };

  if (!isAuthenticated) {
    return <WelcomePage />;
  }

  return (
    <div
      className="app-shell"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem 2rem 0.75rem 2rem",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: "-20%",
            right: "-10%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(15,23,42,0) 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />

        {activeTab !== "settings" && (
          <header
            style={{
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ textTransform: "capitalize", margin: 0 }}>
                {activeTab === "archive"
                  ? "Archived Tasks"
                  : activeTab === "review"
                    ? "Weekly Review"
                    : activeTab === "mission"
                      ? "My Mission"
                      : activeTab === "stats"
                        ? "Insights"
                        : activeTab}
              </h2>

            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ position: "relative" }}>
                <NotificationsWidget />
              </div>
              <div
                className="glass-panel"
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-xl)",
                  fontSize: "0.875rem",
                }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </header>
        )}

        <div className="content-area">
          {activeTab === "dashboard" && (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                <div style={{ flexShrink: 0, transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: '-0.25rem' }}>
                  <MissionWidget collapsed={isMissionCollapsed} />
                </div>

                {/* Collapsible Handle */}
                <div
                  onClick={() => setMissionCollapsed(!isMissionCollapsed)}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0.25rem 0 0.5rem 0',
                    cursor: 'pointer',
                    marginTop: isMissionCollapsed ? '0' : '-0.5rem',
                    zIndex: 10,
                    position: 'relative'
                  }}
                  title={isMissionCollapsed ? "Expand" : "Collapse"}
                  className="group"
                >
                  <div style={{
                    width: '40px',
                    height: '4px',
                    borderRadius: '2px',
                    background: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden",
                    marginTop: '-0.75rem'
                  }}
                >
                  <CoveyMatrix />
                </div>
              </div>
              <DragOverlay dropAnimation={null}>
                {activeDragId ? (
                  <div style={{
                    cursor: 'grabbing',
                    opacity: 1,
                    background: 'rgba(30, 41, 59, 0.9)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.2), 0 8px 32px rgba(0,0,0,0.5)',
                    transform: 'scale(1.02)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <TaskCard task={tasks.find(t => t.id === activeDragId)} compact={true} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
          {activeTab === "mission" && <MissionView />}
          {activeTab === "calendar" && <CalendarView />}
          {activeTab === "stats" && <StatsView />}
          {activeTab === "archive" && <ArchivedTasksView />}
          {activeTab === "review" && <WeeklyReview />}
          {activeTab === "settings" && (
            <div className="glass-panel" style={{ padding: "3rem", maxWidth: "700px", margin: "2rem auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ padding: "0.75rem", background: "rgba(168, 85, 247, 0.1)", borderRadius: "12px", color: "#a855f7" }}>
                  <Settings size={28} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Settings</h2>
                  <p style={{ margin: "0.25rem 0 0 0", color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
                    Manage your preferences and account
                  </p>
                </div>
              </div>

              <section style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Profile</h3>
                <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                    {googleUser?.picture ? (
                      <img
                        src={googleUser.picture}
                        alt="Profile"
                        style={{ width: "64px", height: "64px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)" }}
                      />
                    ) : (
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
                        {googleUser?.name?.charAt(0) || "U"}
                      </div>
                    )}

                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                        {googleUser?.name || "User Name"}
                      </div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>
                        {googleUser?.email || "user@example.com"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    style={{
                      padding: "0.75rem 1.75rem",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                  >
                    Sign Out
                  </button>
                </div>
              </section>

              <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "4rem", opacity: 0.5 }}>
                SPTM System v2.0 • Build 2024.12
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
