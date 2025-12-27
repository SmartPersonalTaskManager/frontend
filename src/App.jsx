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




// Mini Calendar Component
function MiniCalendar({ tasks, onDateClick }) {
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
        onClick={() => onDateClick && onDateClick(new Date(currentYear, currentMonth, day))}
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
          cursor: 'pointer',
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


  const [showCalendar, setShowCalendar] = useState(false);
  const [activeCalendarDate, setActiveCalendarDate] = useState(null);

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
                      : activeTab === "settings"
                        ? "Account"
                        : activeTab}
            </h2>
          </div>
          {activeTab !== "settings" && (
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
                      <MiniCalendar
                        tasks={tasks}
                        onDateClick={(date) => {
                          setActiveCalendarDate(date);
                          setActiveTab("calendar");
                          setShowCalendar(false);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </header>

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
          {activeTab === "calendar" && <CalendarView initialDate={activeCalendarDate} />}
          {activeTab === "stats" && <StatsView />}
          {activeTab === "archive" && <ArchivedTasksView />}
          {activeTab === "review" && <WeeklyReview />}
          {activeTab === "settings" && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "2rem"
            }}>
              <div className="glass-panel" style={{
                padding: "3rem",
                width: "100%",
                maxWidth: "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2rem",
                borderRadius: "32px",
                background: "rgba(30, 41, 59, 0.4)",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
              }}>
                {/* Avatar with Ring */}
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    inset: "-4px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    opacity: 0.5,
                    filter: "blur(8px)"
                  }} />
                  {googleUser?.picture ? (
                    <img
                      src={googleUser.picture}
                      alt="Profile"
                      style={{
                        width: "96px",
                        height: "96px",
                        borderRadius: "50%",
                        border: "4px solid #1e293b",
                        position: "relative",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366f1, #a855f7)",
                      border: "4px solid #1e293b",
                      position: "relative"
                    }}>
                      <span style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, calc(-50% - 0.08em))",
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1,
                        userSelect: "none"
                      }}>
                        {googleUser?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem 0", fontWeight: 700 }}>{googleUser?.name || "User"}</h2>
                  <p style={{ margin: 0, color: "var(--color-text-muted)" }}>{googleUser?.email}</p>
                </div>

                {/* Actions */}
                <button
                  onClick={logout}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#f87171",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "16px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                >
                  Sign Out
                </button>
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
      <AppContent />
    </>
  );
}

export default App;
