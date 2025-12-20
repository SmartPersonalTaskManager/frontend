import React, { useState } from "react";
import { useTasks } from "../../../context/TaskContext";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import TaskCard from "../tasks/TaskCard";
import GoogleCalendarSync from "./GoogleCalendarSync";

export default function CalendarView() {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

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
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.1)'
          }}>
            <Calendar size={24} style={{ color: '#bae6fd' }} />
          </div>
          <div>
            <h3 className="text-gradient-primary" style={{ fontSize: "1.75rem", margin: 0, lineHeight: 1 }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Manage your schedule and tasks.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            className="btn btn-ghost"
            onClick={handlePrevMonth}
            style={{ borderRadius: '6px', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleNextMonth}
            style={{ borderRadius: '6px', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <GoogleCalendarSync />

      <div
        className="glass-panel"
        style={{
          flex: 1,
          borderRadius: "var(--radius-lg)",
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: "auto repeat(5, 1fr)", // Header + 5 weeks approx
          overflow: "hidden",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            style={{
              padding: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontWeight: 600,
            }}
          >
            {d}
          </div>
        ))}

        {days.map((day, idx) => (
          <div
            key={idx}
            style={{
              padding: "0.5rem",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              minHeight: "100px",
              position: "relative",
            }}
          >
            {day && (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
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
                  }}
                >
                  {getTasksForDate(day).map((task) => (
                    <div
                      key={task.id}
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
                      }}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
