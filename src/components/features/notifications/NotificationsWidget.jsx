import React, { useState, useEffect } from 'react';
import { useTasks } from '../../../context/TaskContext';
import { Bell, X, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function NotificationsWidget() {
    const { tasks } = useTasks();
    const [showPanel, setShowPanel] = useState(false);
    const [dismissedIds, setDismissedIds] = useState([]);

    // Calculate notifications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const activeTasks = tasks.filter(t => !t.isArchived && t.status !== 'done');

    // Overdue tasks
    const overdueTasks = activeTasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    });

    // Due today
    const dueTodayTasks = activeTasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === today.getTime();
    });

    // Due tomorrow
    const dueTomorrowTasks = activeTasks.filter(t => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() === tomorrow.getTime();
    });

    // Inbox items needing processing
    const inboxItems = tasks.filter(t => t.isInbox && !t.isArchived && t.status !== 'done');

    // Build notifications array
    const notifications = [];

    if (overdueTasks.length > 0) {
        notifications.push({
            id: 'overdue',
            type: 'danger',
            icon: AlertTriangle,
            title: 'Overdue Tasks',
            message: `${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} past due date`,
            tasks: overdueTasks
        });
    }

    if (dueTodayTasks.length > 0) {
        notifications.push({
            id: 'today',
            type: 'warning',
            icon: Clock,
            title: 'Due Today',
            message: `${dueTodayTasks.length} task${dueTodayTasks.length > 1 ? 's' : ''} due today`,
            tasks: dueTodayTasks
        });
    }

    if (dueTomorrowTasks.length > 0) {
        notifications.push({
            id: 'tomorrow',
            type: 'info',
            icon: Clock,
            title: 'Due Tomorrow',
            message: `${dueTomorrowTasks.length} task${dueTomorrowTasks.length > 1 ? 's' : ''} due tomorrow`,
            tasks: dueTomorrowTasks
        });
    }

    if (inboxItems.length > 0) {
        notifications.push({
            id: 'inbox',
            type: 'info',
            icon: Bell,
            title: 'Inbox Items',
            message: `${inboxItems.length} item${inboxItems.length > 1 ? 's' : ''} waiting to be processed`,
            tasks: inboxItems
        });
    }

    const visibleNotifications = notifications.filter(n => !dismissedIds.includes(n.id));
    const notificationCount = visibleNotifications.length;

    const getTypeColor = (type) => {
        switch (type) {
            case 'danger': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'info': return '#6366f1';
            default: return 'var(--color-text-muted)';
        }
    };

    return (
        <>
            {/* Notification Bell Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    color: notificationCount > 0 ? '#f59e0b' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    top: '2px'
                }}
            >
                <Bell size={22} />
                {notificationCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {notificationCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {showPanel && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 50
                }}>
                    <div className="glass-panel" style={{
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                        background: '#1e293b'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            paddingBottom: '0.75rem',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Notifications</h4>
                            <button
                                onClick={() => setShowPanel(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {visibleNotifications.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: 'var(--color-text-muted)'
                            }}>
                                <CheckCircle size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>All caught up!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {visibleNotifications.map(notification => {
                                    const Icon = notification.icon;
                                    return (
                                        <div
                                            key={notification.id}
                                            style={{
                                                padding: '0.75rem',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: 'var(--radius-md)',
                                                borderLeft: `3px solid ${getTypeColor(notification.type)}`
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <Icon size={16} style={{ color: getTypeColor(notification.type), marginTop: '2px' }} />
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{notification.title}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                            {notification.message}
                                                        </div>
                                                        {notification.tasks && notification.tasks.length > 0 && (
                                                            <div style={{ marginTop: '0.5rem' }}>
                                                                {notification.tasks.slice(0, 3).map(task => (
                                                                    <div key={task.id} style={{
                                                                        fontSize: '0.75rem',
                                                                        color: 'var(--color-text-main)',
                                                                        padding: '0.2rem 0',
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}>
                                                                        • {task.title}
                                                                    </div>
                                                                ))}
                                                                {notification.tasks.length > 3 && (
                                                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                                        +{notification.tasks.length - 3} more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setDismissedIds([...dismissedIds, notification.id])}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--color-text-muted)',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem',
                                                        opacity: 0.5
                                                    }}
                                                    title="Dismiss"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
