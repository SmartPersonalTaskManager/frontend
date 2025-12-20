import { useState } from "react";
import {
    LayoutDashboard,
    Target,
    Calendar,
    PieChart,
    Archive,
    Settings,
    ChevronLeft,
    ChevronRight,
    User,
} from "lucide-react";
import { useGoogleCalendar } from "../../hooks/useGoogleCalendar";

export default function Sidebar({ activeTab, setActiveTab }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const {
        googleUser,
    } = useGoogleCalendar();

    return (
        <aside
            className="glass-panel"
            style={{
                width: isCollapsed ? "80px" : "280px",
                padding: isCollapsed ? "2rem 1rem" : "2rem",
                display: "flex",
                flexDirection: "column",
                zIndex: 10,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                borderRight: "1px solid rgba(255, 255, 255, 0.05)",
            }}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    position: "absolute",
                    top: "1.5rem",
                    right: isCollapsed ? "50%" : "1rem",
                    transform: isCollapsed ? "translateX(50%)" : "none",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--color-text-muted)",
                    transition: "all 0.2s ease",
                    zIndex: 20,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.color = "var(--color-text-main)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "var(--color-text-muted)";
                }}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo */}
            <div
                style={{
                    marginBottom: "3rem",
                    cursor: "pointer",
                    textAlign: isCollapsed ? "center" : "left",
                    marginTop: isCollapsed ? "2rem" : "0",
                }}
                onClick={() => setActiveTab("dashboard")}
            >
                <h1
                    className="text-gradient-primary"
                    style={{
                        fontSize: isCollapsed ? "1.5rem" : "2rem",
                        letterSpacing: "-0.03em",
                        marginBottom: "0.25rem",
                        transition: "all 0.3s ease",
                    }}
                >
                    {isCollapsed ? "S" : "SPTM"}
                </h1>
                {!isCollapsed && (
                    <p
                        style={{
                            color: "var(--color-text-muted)",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            opacity: 1,
                            transition: "opacity 0.2s ease",
                            display: "block"
                        }}
                    >
                        Smart Personal Task Manager
                    </p>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                <NavButton
                    active={activeTab === "dashboard"}
                    onClick={() => setActiveTab("dashboard")}
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    collapsed={isCollapsed}
                />
                <NavButton
                    active={activeTab === "mission"}
                    onClick={() => setActiveTab("mission")}
                    icon={<Target size={20} />}
                    label="Mission"
                    collapsed={isCollapsed}
                />
                <NavButton
                    active={activeTab === "calendar"}
                    onClick={() => setActiveTab("calendar")}
                    icon={<Calendar size={20} />}
                    label="Calendar"
                    collapsed={isCollapsed}
                />
                <NavButton
                    active={activeTab === "stats"}
                    onClick={() => setActiveTab("stats")}
                    icon={<PieChart size={20} />}
                    label="Insights"
                    collapsed={isCollapsed}
                />
                <NavButton
                    active={activeTab === "archive"}
                    onClick={() => setActiveTab("archive")}
                    icon={<Archive size={20} />}
                    label="Archive"
                    collapsed={isCollapsed}
                />
            </nav>

            {/* Footer / User Profile & Settings */}
            <div
                style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: isCollapsed ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                }}
            >
                {/* User Info (Opens Settings) */}
                <NavButton
                    active={activeTab === "settings"}
                    onClick={() => setActiveTab("settings")}
                    icon={<User size={20} />}
                    label={googleUser?.name || "Name Surname"}
                    collapsed={isCollapsed}
                />
            </div>
        </aside>
    );
}

function NavButton({ active, onClick, icon, label, collapsed, style }) {
    return (
        <button
            onClick={onClick}
            title={collapsed ? label : ""}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: collapsed ? "0" : "0.75rem", // Optimized gap for consistency
                padding: "0.85rem 1rem",
                border: "none",
                background: active ? "linear-gradient(90deg, rgba(99, 102, 241, 0.15), transparent)" : "transparent",
                color: active ? "#a855f7" : "var(--color-text-muted)",
                borderLeft: active && !collapsed ? "3px solid #a855f7" : "3px solid transparent",
                borderRadius: collapsed ? "var(--radius-md)" : "0 var(--radius-md) var(--radius-md) 0",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: active ? 600 : 500,
                transition: "all 0.2s ease",
                textAlign: "left",
                width: "100%",
                marginLeft: collapsed ? "0" : "-1rem",
                paddingLeft: collapsed ? "1rem" : "2rem",
                ...style
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.color = "var(--color-text-main)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.color = style?.color || "var(--color-text-muted)";
                    e.currentTarget.style.background = "transparent";
                }
            }}
        >
            <span style={{
                opacity: active ? 1 : 0.7,
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: "24px" // Standardized icon container width
            }}>
                {icon}
            </span>
            {!collapsed && (
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {label}
                </span>
            )}
        </button>
    );
}
