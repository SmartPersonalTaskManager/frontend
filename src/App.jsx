import { useState, useEffect } from "react";
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
import { useDemoLoader } from "./hooks/useDemoLoader";

// Backend warm-up on app load (Render free tier goes to sleep after 15min inactivity)
const API_URL = import.meta.env.VITE_API_URL;

function BackendWarmup() {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        console.log("🔄 Waking up backend...");
        setIsWaking(true);
        const response = await fetch(`${API_URL}/actuator/health`, {
          method: 'GET',
          mode: 'cors'
        });
        if (response.ok) {
          console.log("✅ Backend is awake!");
        }
      } catch (error) {
        console.log("⏳ Backend is starting up... (this may take 30-60 seconds)");
      } finally {
        setIsWaking(false);
      }
    };

    wakeUpBackend();
  }, []);

  // Show subtle indicator while waking up
  if (isWaking) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: 'rgba(99, 102, 241, 0.9)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          background: '#fff',
          borderRadius: '50%',
          animation: 'pulse 1s infinite'
        }}></span>
        Connecting to server...
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  return null;
}

// Mini Calendar Component
function MiniCalendar({ tasks }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  // Get first day of month and total days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Check if a date has tasks
  const hasTasksOnDate = (day) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    return tasks.some(task => task.dueDate && task.dueDate.startsWith(dateStr));
  };

  const today = now.getDate();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar days
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} style={{ aspectRatio: '1' }} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today && isCurrentMonth;
    const hasTasks = hasTasksOnDate(day);

    days.push(
      <div
        key={day}
        style={{
          aspectRatio: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: '6px',
          fontSize: '0.85rem',
          background: isToday ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
          color: isToday ? '#fff' : '#94a3b8',
          fontWeight: isToday ? 600 : 400,
        }}
      >
        {day}
        {hasTasks && (
          <div style={{
            position: 'absolute',
            bottom: '4px',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#a855f7'
          }} />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header with navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <button
          onClick={goToPrevMonth}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            fontSize: '1.2rem',
            transition: 'color 0.2s',
            lineHeight: 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          ‹
        </button>

        <div style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
          {monthName}
        </div>

        <button
          onClick={goToNextMonth}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            fontSize: '1.2rem',
            transition: 'color 0.2s',
            lineHeight: 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          ›
        </button>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px'
      }}>
        {/* Day headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            fontWeight: 600,
            marginBottom: '4px'
          }}>
            {d}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMissionCollapsed, setMissionCollapsed] = useState(false);
  const { updateTask, tasks } = useTasks();
  const [activeDragId, setActiveDragId] = useState(null);
  const { isAuthenticated, logout, googleUser } = useGoogleCalendar();

  // Backend Status Management
  const [backendStatus, setBackendStatus] = useState('unknown'); // 'active', 'sleeping', 'waking', 'unknown'
  const [backendWaking, setBackendWaking] = useState(false);
  const [wakeDuration, setWakeDuration] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

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

  // Backend Status Functions
  const checkBackendStatus = async () => {
    try {
      // Any HTTP response (even 403/404) means backend is running
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      // If we get here, backend responded (active!)
      setBackendStatus('active');
      return true;
    } catch (error) {
      // Network error = backend sleeping or unreachable
      setBackendStatus('sleeping');
      return false;
    }
  };

  const wakeBackend = async () => {
    setBackendWaking(true);
    setBackendStatus('waking');
    setWakeDuration(0);

    const startTime = Date.now();
    const maxWaitTime = 90000; // 90 seconds max
    const pollInterval = 3000; // Check every 3 seconds

    const durationInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setWakeDuration(elapsed);

      // Timeout protection
      if (elapsed * 1000 >= maxWaitTime) {
        clearInterval(durationInterval);
        setBackendStatus('sleeping');
        setBackendWaking(false);
      }
    }, 1000);

    // Poll until backend responds or timeout
    const pollBackend = async () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxWaitTime) {
        clearInterval(durationInterval);
        setBackendStatus('sleeping');
        setBackendWaking(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/actuator/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout per request
        });

        if (response.ok) {
          clearInterval(durationInterval);
          setBackendStatus('active');
          setBackendWaking(false);
          setWakeDuration(Math.floor((Date.now() - startTime) / 1000));
          return;
        }
      } catch (error) {
        // Continue polling
      }

      // Schedule next poll
      setTimeout(pollBackend, pollInterval);
    };

    // Initial ping to wake up, then start polling
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/actuator/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      // Immediate success
      clearInterval(durationInterval);
      setBackendStatus('active');
      setBackendWaking(false);
    } catch (error) {
      // Start polling
      setTimeout(pollBackend, pollInterval);
    }
  };

  // Check backend status on mount
  useEffect(() => {
    checkBackendStatus();
  }, []);



  const { loadDemoData, clearAllData, isLoading: isDemoLoading } = useDemoLoader();
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);
  const [showInjectConfirm, setShowInjectConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Check for first-time login (Fresh User)
  useEffect(() => {
    const isFreshUser = localStorage.getItem("sptm_is_fresh_user");

    if (isAuthenticated && isFreshUser === "true") {
      // Redirect to Settings
      setActiveTab("settings");
      // Show Prompt
      const timer = setTimeout(() => {
        setShowDemoPrompt(true);
        localStorage.removeItem("sptm_is_fresh_user"); // Consumed
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleInitialDemoLoad = async (shouldLoad) => {
    localStorage.setItem("sptm_demo_prompt_shown", "true");
    if (shouldLoad) {
      // Keep modal open but change state to loading
      await loadDemoData();
      setShowDemoPrompt(false); // Close after done
    } else {
      setShowDemoPrompt(false);
    }
  };

  // IMPORTANT: Check authentication BEFORE rendering main app
  if (!isAuthenticated) {
    return <WelcomePage />;
  }

  return (
    <div className="app-shell" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ... Sidebar ... */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem 0.75rem 2rem", position: "relative" }}>
        {/* Background... */}
        <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(15,23,42,0) 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: -1 }} />

        {/* --- Demo Data Prompt / Loading Overlay --- */}
        {showDemoPrompt && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 5, 10, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            {isDemoLoading ? (
              // Minimal Aesthetic Loading State
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div className="pulsing-orb" style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.8), rgba(99, 102, 241, 0.4))',
                  boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)',
                  animation: 'pulse 1.5s ease-in-out infinite alternate'
                }} />
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#fff', marginBottom: '0.5rem' }}>Setting up your workspace...</h3>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Planting seeds for your missions</p>
                </div>
                <style>{`
                    @keyframes pulse {
                        0% { transform: scale(0.95); opacity: 0.8; }
                        100% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 60px rgba(168, 85, 247, 0.6); }
                    }
                  `}</style>
              </div>
            ) : (
              // The Question
              <div className="glass-panel" style={{
                padding: '2.5rem',
                maxWidth: '480px',
                width: '90%',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '14px', color: '#a855f7' }}>
                    <span style={{ fontSize: '1.5rem' }}>🌱</span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 600, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quick Start?</h3>
                </div>

                <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                  Would you like to populate your workspace with a <strong>Sample Workspace</strong>?
                  <br /><br />
                  It includes example missions and tasks to show you the power of the system.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleInitialDemoLoad(false)}
                    style={{
                      padding: '0.85rem 1.5rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'color 0.2s',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                    onMouseLeave={(e) => e.target.style.color = '#64748b'}
                  >
                    Empty Workspace
                  </button>
                  <button
                    onClick={() => handleInitialDemoLoad(true)}
                    style={{
                      padding: '0.85rem 1.75rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                      transition: 'transform 0.2s',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Inject Data
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


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
                      ? "Compass"
                      : activeTab === "stats"
                        ? "Insights"
                        : activeTab}
              </h2>

            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ position: "relative" }}>
                <NotificationsWidget />
              </div>
              <div style={{ position: "relative" }}>
                <div
                  className="glass-panel"
                  onClick={() => setShowCalendar(!showCalendar)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "var(--radius-xl)",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}
                >
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>

                {/* Mini Calendar Popup */}
                {showCalendar && (
                  <>
                    {/* Backdrop */}
                    <div
                      onClick={() => setShowCalendar(false)}
                      style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 999
                      }}
                    />

                    {/* Calendar */}
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 0.5rem)",
                      right: 0,
                      background: "linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "var(--radius-lg)",
                      padding: "1rem",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                      backdropFilter: "blur(12px)",
                      zIndex: 1000,
                      minWidth: "280px"
                    }}>
                      <MiniCalendar tasks={tasks} />
                    </div>
                  </>
                )}
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

              <section style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Utilities</h3>
                <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,255,255,0.05)" }}>

                  {/* Sample Workspace Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>Sample Workspace</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Replace all data with sample missions and tasks.</div>
                    </div>
                    <button
                      onClick={() => setShowInjectConfirm(true)}
                      disabled={isDemoLoading}
                      style={{
                        height: "42px",
                        minWidth: "140px",
                        padding: "0 1rem",
                        background: isDemoLoading ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.1)",
                        color: "#b57bfc",
                        border: "1px solid rgba(168, 85, 247, 0.2)",
                        borderRadius: "var(--radius-md)",
                        cursor: isDemoLoading ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => !isDemoLoading && (e.currentTarget.style.background = "rgba(168, 85, 247, 0.2)")}
                      onMouseLeave={(e) => !isDemoLoading && (e.currentTarget.style.background = "rgba(168, 85, 247, 0.1)")}
                    >
                      {isDemoLoading ? (
                        <>
                          <span className="loading-spinner" style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                          }}></span>
                          Loading...
                        </>
                      ) : 'Load Data'}
                    </button>
                  </div>

                  {/* Clear All Data Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>Clear All Data</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Delete all tasks and missions permanently.</div>
                    </div>
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      disabled={isDemoLoading}
                      style={{
                        height: "42px",
                        minWidth: "140px",
                        padding: "0 1rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#f87171",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                    >
                      Clear Data
                    </button>
                  </div>

                  {/* Backend Status Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>Backend Status</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {backendStatus === 'active'
                            ? 'Server is running and ready.'
                            : backendWaking
                              ? 'Free tier server is spinning up...'
                              : 'Server may be sleeping (free tier limitation).'}
                        </div>
                      </div>
                      <button
                        onClick={wakeBackend}
                        disabled={backendWaking || backendStatus === 'active'}
                        style={{
                          height: "42px",
                          minWidth: "140px",
                          padding: "0 1rem",
                          background: backendWaking
                            ? "rgba(168, 85, 247, 0.2)"
                            : backendStatus === 'active'
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(168, 85, 247, 0.1)",
                          color: backendStatus === 'active' ? "#34d399" : "#b57bfc",
                          border: backendStatus === 'active'
                            ? "1px solid rgba(16, 185, 129, 0.2)"
                            : "1px solid rgba(168, 85, 247, 0.2)",
                          borderRadius: "var(--radius-md)",
                          cursor: backendWaking || backendStatus === 'active' ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => !backendWaking && backendStatus !== 'active' && (e.currentTarget.style.background = "rgba(168, 85, 247, 0.2)")}
                        onMouseLeave={(e) => !backendWaking && backendStatus !== 'active' && (e.currentTarget.style.background = "rgba(168, 85, 247, 0.1)")}
                      >
                        {backendWaking ? (
                          <>
                            <span className="loading-spinner" style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite'
                            }}></span>
                            {wakeDuration}s
                          </>
                        ) : backendStatus === 'active' ? 'Active' : 'Wake Server'}
                      </button>
                    </div>

                    {/* Progress Section - Only shown while waking */}
                    {backendWaking && (
                      <div style={{
                        padding: '1rem',
                        background: 'rgba(168, 85, 247, 0.05)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(168, 85, 247, 0.15)'
                      }}>
                        {/* Progress Bar */}
                        <div style={{
                          height: '6px',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          marginBottom: '0.75rem'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min((wakeDuration / 60) * 100, 100)}%`,
                            background: 'linear-gradient(90deg, #a855f7, #6366f1)',
                            borderRadius: '3px',
                            transition: 'width 1s ease-out'
                          }} />
                        </div>

                        {/* Status Message */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.85rem', color: '#b57bfc' }}>
                            {wakeDuration < 10
                              ? '☁️ Sending wake-up signal...'
                              : wakeDuration < 30
                                ? '⚡ Server is booting up...'
                                : wakeDuration < 50
                                  ? '🔧 Initializing services...'
                                  : '⏳ Almost there, hang tight...'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            ~{Math.max(60 - wakeDuration, 5)}s remaining
                          </div>
                        </div>

                        {/* Helpful Note */}
                        <div style={{
                          marginTop: '0.75rem',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          lineHeight: '1.4'
                        }}>
                          💡 Free tier servers sleep after 15 min of inactivity. First request takes ~30-60s to wake up.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Inject Confirmation Modal */}
              {showInjectConfirm && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: '#1e293b',
                    padding: '2rem',
                    borderRadius: '16px',
                    maxWidth: '400px',
                    width: '90%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Replace All Data?</h3>
                    </div>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                      This will <strong style={{ color: '#ef4444' }}>permanently delete</strong> all your current tasks and missions, then replace them with sample data.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setShowInjectConfirm(false)}
                        style={{
                          padding: '0.6rem 1.25rem',
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setShowInjectConfirm(false);
                          await loadDemoData();
                        }}
                        style={{
                          padding: '0.6rem 1.25rem',
                          background: '#a855f7',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Yes, Replace All
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Clear Confirmation Modal */}
              {showClearConfirm && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: '#1e293b',
                    padding: '2rem',
                    borderRadius: '16px',
                    maxWidth: '400px',
                    width: '90%',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🗑️</span>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ef4444' }}>Delete All Data?</h3>
                    </div>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                      This will <strong style={{ color: '#ef4444' }}>permanently delete</strong> all your tasks and missions. This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        style={{
                          padding: '0.6rem 1.25rem',
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setShowClearConfirm(false);
                          await clearAllData();
                        }}
                        style={{
                          padding: '0.6rem 1.25rem',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Yes, Delete All
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {isDemoLoading && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(5, 5, 10, 0.85)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1001
                }}>
                  <style>{`
                    @keyframes pulse {
                      0%, 100% { transform: scale(1); opacity: 0.8; }
                      50% { transform: scale(1.1); opacity: 1; }
                    }
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    boxShadow: '0 0 60px rgba(168, 85, 247, 0.5)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    marginBottom: '1.5rem'
                  }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#fff', marginBottom: '0.5rem' }}>
                    Setting up your workspace...
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    Planting seeds for your missions
                  </p>
                </div>
              )}

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
    <>
      <BackendWarmup />
      <AppContent />
    </>
  );
}

export default App;
