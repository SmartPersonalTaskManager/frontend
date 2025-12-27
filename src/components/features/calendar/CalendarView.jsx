import React, { useState, useRef, useEffect } from "react";
import { useTasks } from "../../../context/TaskContext";
import { useMission } from "../../../context/MissionContext";
import { ChevronLeft, ChevronRight, Calendar, X, Clock, Tag, CheckCircle2, Target, AlertCircle, Archive, Circle, CheckCircle, RefreshCw } from "lucide-react";
import GoogleCalendarSync from "./GoogleCalendarSync";

export default function CalendarView({ initialDate }) {
  const { tasks, deleteTask, toggleTaskStatus } = useTasks();
  const { missions = [], visions = [], values = [] } = useMission();
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());

  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const todayRef = useRef(null);
  const calendarGridRef = useRef(null);

  const handleHeaderClick = () => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (calendarGridRef.current) {
      calendarGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getTasksForDate = (day) => {
    if (!day) return [];

    // Target date components
    const targetYear = currentDate.getFullYear();
    const targetMonth = currentDate.getMonth(); // 0-indexed
    const targetDay = day;

    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      if (t.isArchived) return false; // Don't show archived tasks

      const taskDate = new Date(t.dueDate);
      if (isNaN(taskDate.getTime())) return false; // Invalid date

      return (
        taskDate.getDate() === targetDay &&
        taskDate.getMonth() === targetMonth &&
        taskDate.getFullYear() === targetYear
      );
    });
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        position: "relative" // For absolute positioning of modals
      }}
    >
      <div
        className="glass-panel"
        style={{
          flex: 1,
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Calendar Header inside the panel */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}>
          {/* Left Side: Title */}
          <h3
            className="text-gradient-primary"
            onClick={handleHeaderClick}
            style={{
              fontSize: "1.25rem",
              margin: 0,
              lineHeight: 1,
              cursor: "pointer",
              userSelect: "none",
              minWidth: "110px"
            }}
            title="Scroll to Today"
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>

          {/* Right Side: Navigation & Sync */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Navigation Arrows */}
            <div style={{
              display: "flex",
              gap: "0.25rem",
              background: 'rgba(255,255,255,0.03)',
              padding: '0.2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <button
                className="btn btn-ghost"
                onClick={handlePrevMonth}
                style={{ borderRadius: '6px', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}
                title="Previous Month"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="btn btn-ghost"
                onClick={handleNextMonth}
                style={{ borderRadius: '6px', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}
                title="Next Month"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Sync Button */}
            <button
              className="btn btn-ghost"
              onClick={() => {
                handleHeaderClick();
                setTimeout(() => {
                  setShowSyncModal(true);
                }, 300);
              }}
              style={{
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#ffffff',
                fontSize: "0.85rem",
                fontWeight: 600,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
              title="Calendar Sync"
            >
              <RefreshCw size={16} />
              <span>Sync Calendar</span>
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.01)"
        }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              style={{
                padding: "0.5rem",
                textAlign: "center",
                color: "var(--color-text-muted)",
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          ref={calendarGridRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gridAutoRows: "120px",
            overflowY: "auto",
            flex: 1
          }}>
          {days.map((day, idx) => {
            const isToday = day && day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={idx}
                ref={isToday ? todayRef : null}
                style={{
                  padding: "0.5rem",
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  height: "120px",
                  maxHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  background: isToday
                    ? "rgba(99, 102, 241, 0.03)" // Subtle highlight for entire today cell
                    : "transparent"
                }}
              >
                {day && (
                  <>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem',
                      flexShrink: 0,
                    }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background:
                            day === new Date().getDate() &&
                              currentDate.getMonth() === new Date().getMonth() &&
                              currentDate.getFullYear() === new Date().getFullYear()
                              ? "var(--color-primary)"
                              : "transparent",
                          color:
                            day === new Date().getDate() &&
                              currentDate.getMonth() === new Date().getMonth() &&
                              currentDate.getFullYear() === new Date().getFullYear()
                              ? "white"
                              : "inherit",
                          fontWeight:
                            day === new Date().getDate() &&
                              currentDate.getMonth() === new Date().getMonth() &&
                              currentDate.getFullYear() === new Date().getFullYear()
                              ? "bold"
                              : "normal",
                          boxShadow: day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()
                            ? "0 0 10px var(--color-primary-glow)"
                            : 'none'
                        }}
                      >
                        {day}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        paddingRight: "2px",
                      }}
                      className="calendar-day-tasks"
                    >
                      {getTasksForDate(day).map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="calendar-task-item"
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.2rem 0.4rem",
                            background:
                              task.status === "done"
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(99, 102, 241, 0.2)",
                            borderRadius: "3px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color:
                              task.status === "done"
                                ? "var(--color-text-muted)"
                                : "var(--color-text-main)",
                            textDecoration:
                              task.status === "done" ? "line-through" : "none",
                            flexShrink: 0,
                            cursor: "pointer",
                            transition: "transform 0.15s ease, box-shadow 0.15s ease",
                          }}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Task Mini Modal */}
      {
        selectedTask && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              animation: "fadeIn 0.2s ease",
            }}
            onClick={() => setSelectedTask(null)}
          >
            <div
              className="glass-panel"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "380px",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                animation: "scaleIn 0.2s ease",
              }}
            >
              {/* Modal Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1rem",
              }}>
                <div style={{ flex: 1, paddingRight: "0.5rem" }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--color-text-main)",
                    lineHeight: 1.3,
                  }}>
                    {selectedTask.title}
                  </h4>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {/* Completion Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(selectedTask.id);
                      // Update local state to reflect the change
                      setSelectedTask({ ...selectedTask, status: selectedTask.status === 'done' ? 'todo' : 'done' });
                    }}
                    title={selectedTask.status === 'done' ? "Mark as Undone" : "Mark as Done"}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: selectedTask.status === 'done' ? 'none' : '2px solid rgba(255,255,255,0.3)',
                      background: selectedTask.status === 'done' ? 'rgba(16, 185, 129, 0.8)' : 'transparent',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s ease-in-out',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTask.status !== 'done') {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTask.status !== 'done') {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {selectedTask.status === 'done' && <CheckCircle size={18} strokeWidth={3} />}
                  </button>

                  {/* Archive Button - Only enabled when task is done */}
                  <button
                    onClick={() => {
                      if (selectedTask.status === 'done') {
                        deleteTask(selectedTask.id);
                        setSelectedTask(null);
                      }
                    }}
                    disabled={selectedTask.status !== 'done'}
                    style={{
                      background: selectedTask.status === 'done'
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(156, 163, 175, 0.1)",
                      border: selectedTask.status === 'done'
                        ? "1px solid rgba(16, 185, 129, 0.2)"
                        : "1px solid rgba(156, 163, 175, 0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.4rem 0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      cursor: selectedTask.status === 'done' ? "pointer" : "not-allowed",
                      color: selectedTask.status === 'done' ? "#10b981" : "#9ca3af",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      opacity: selectedTask.status === 'done' ? 1 : 0.5,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTask.status === 'done') {
                        e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
                        e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTask.status === 'done') {
                        e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)";
                        e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.2)";
                      }
                    }}
                    title={selectedTask.status === 'done' ? "Archive this task" : "Complete the task first to archive"}
                  >
                    <Archive size={14} />
                    Archive
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedTask(null)}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      transition: "all 0.15s ease",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                      e.currentTarget.style.color = "var(--color-text-main)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.color = "var(--color-text-muted)";
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Task Details */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}>
                {/* Submission / Linked Item */}
                {(() => {
                  const linkedItem = selectedTask.missionId
                    ? [...missions, ...visions, ...values].find(i => i.id === selectedTask.missionId)
                    : null;

                  return linkedItem ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.75rem",
                      background: "rgba(99, 102, 241, 0.1)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                    }}>
                      <Target size={16} style={{ color: "#a5b4fc", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: "0.7rem",
                          color: "var(--color-text-muted)",
                          marginBottom: "0.15rem",
                        }}>
                          Linked Submission
                        </div>
                        <div style={{
                          fontSize: "0.85rem",
                          color: "#a5b4fc",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {linkedItem.text}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Due Date */}
                {selectedTask.dueDate && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--color-text-muted)",
                    fontSize: "0.85rem",
                  }}>
                    <Clock size={16} style={{ opacity: 0.7, flexShrink: 0 }} />
                    <span>
                      {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {/* Context */}
                {selectedTask.context && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--color-text-muted)",
                    fontSize: "0.85rem",
                  }}>
                    <Tag size={16} style={{ opacity: 0.7, flexShrink: 0 }} />
                    <span style={{
                      padding: "0.2rem 0.6rem",
                      background: "rgba(99, 102, 241, 0.15)",
                      borderRadius: "var(--radius-sm)",
                      color: "#a5b4fc",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}>
                      {selectedTask.context}
                    </span>
                  </div>
                )}

                {/* Urgent / Important Quadrant */}
                {(() => {
                  const urge = selectedTask.urge;
                  const imp = selectedTask.imp;

                  // Determine quadrant and styling
                  let quadrantLabel = "";
                  let quadrantColor = "";
                  let quadrantBg = "";
                  let quadrantBorder = "";

                  if (urge && imp) {
                    quadrantLabel = "Urgent & Important";
                    quadrantColor = "#f87171"; // Red
                    quadrantBg = "rgba(248, 113, 113, 0.1)";
                    quadrantBorder = "rgba(248, 113, 113, 0.3)";
                  } else if (!urge && imp) {
                    quadrantLabel = "Not Urgent but Important";
                    quadrantColor = "#a5b4fc"; // Blue
                    quadrantBg = "rgba(99, 102, 241, 0.1)";
                    quadrantBorder = "rgba(99, 102, 241, 0.3)";
                  } else if (urge && !imp) {
                    quadrantLabel = "Urgent but Not Important";
                    quadrantColor = "#fbbf24"; // Yellow
                    quadrantBg = "rgba(251, 191, 36, 0.1)";
                    quadrantBorder = "rgba(251, 191, 36, 0.3)";
                  } else {
                    quadrantLabel = "Not Urgent & Not Important";
                    quadrantColor = "#9ca3af"; // Gray
                    quadrantBg = "rgba(156, 163, 175, 0.1)";
                    quadrantBorder = "rgba(156, 163, 175, 0.2)";
                  }

                  return (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.75rem",
                      background: quadrantBg,
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${quadrantBorder}`,
                    }}>
                      <AlertCircle size={16} style={{ color: quadrantColor, flexShrink: 0 }} />
                      <div style={{
                        fontSize: "0.85rem",
                        color: quadrantColor,
                        fontWeight: 500,
                      }}>
                        {quadrantLabel}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )
      }
      {/* Sync Modal */}
      {showSyncModal && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowSyncModal(false)}
        >
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              animation: "scaleIn 0.2s ease",
              position: "relative"
            }}
          >
            <button
              onClick={() => setShowSyncModal(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "transparent",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                padding: "0.25rem",
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.1rem", borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              Google Calendar Sync
            </h3>

            <GoogleCalendarSync />
          </div>
        </div>
      )}
    </div>
  );
}
