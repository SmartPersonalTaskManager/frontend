import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Tag, Archive, Target, ListChecks, AlarmClock } from 'lucide-react';
import { useTasks } from '../../../context/TaskContext';
import { useMission } from '../../../context/MissionContext';

export default function TaskCard({ task, onClick, compact = false }) {
    const { toggleTaskStatus, deleteTask } = useTasks();
    const { missions = [], visions = [], values = [] } = useMission();

    const [isExiting, setIsExiting] = useState(false);

    const handleArchive = (e) => {
        e.stopPropagation();
        setIsExiting(true);
        setTimeout(() => {
            deleteTask(task.id);
        }, 300); // Wait for animation
    };

    const isDone = task.status === 'done';

    // Find linked compass item (Mission, Vision, or Value)
    const linkedItem = task.missionId
        ? [...missions, ...visions, ...values].find(i => (i.realId || i.id) === task.missionId)
        : null;

    // Date Logic
    // Date Logic
    const getDueDateInfo = (dueDateStr) => {
        if (!dueDateStr) return { style: {}, isUrgent: false };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDateStr);
        due.setHours(0, 0, 0, 0);

        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Urgent if 3 days or less (including overdue)
        const isUrgent = diffDays <= 3;

        return {
            style: {
                color: isUrgent ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: isUrgent ? 600 : 500
            },
            isUrgent
        };
    };

    const dateInfo = getDueDateInfo(task.dueDate);

    return (
        <div
            onClick={onClick}
            className={`glass-panel ${isExiting ? 'fade-out-exit' : ''}`}
            style={{
                padding: compact ? '0.4rem' : '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0',
                cursor: 'pointer',
                display: 'flex',
                gap: compact ? '0.5rem' : '0.75rem',
                alignItems: 'center',
                borderLeft: `3px solid ${getPriorityColor(task)}`,
                opacity: isExiting ? 0 : (isDone ? 0.5 : 1),
                transform: isExiting ? 'scale(0.95)' : 'scale(1)',
                transition: 'all 0.3s ease-out',
                filter: isDone ? 'grayscale(0.5)' : 'none',
                position: 'relative',
                height: compact ? '100%' : 'auto',
                background: 'rgba(255,255,255,0.03)',
                pointerEvents: isExiting ? 'none' : 'auto'
            }}
            onMouseEnter={e => !isExiting && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => !isExiting && (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <h4 style={{
                    fontSize: isDone ? '0.75rem' : (compact ? '0.75rem' : '0.85rem'),
                    fontWeight: 400,
                    textDecoration: isDone ? 'line-through' : 'none',
                    textDecorationColor: isDone ? 'rgba(255,255,255,0.2)' : 'inherit', // Very faint line
                    textDecorationThickness: '1px',
                    color: isDone ? 'rgba(255,255,255,0.4)' : 'var(--color-text-main)', // Faded text
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    lineHeight: compact ? '1.2' : 'normal',
                    marginBottom: 0,
                    marginLeft: '0.2rem'
                }}>
                    {task.title}
                </h4>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>

                    {/* 1. Submission / Role / Mission Link */}
                    {linkedItem && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            color: 'rgba(255, 255, 255, 0.9)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            letterSpacing: '0.3px',
                            whiteSpace: 'nowrap' // Enforce single line
                        }}>
                            <Target size={12} style={{ flexShrink: 0, opacity: 1 }} />
                            {(() => {
                                const limit = compact ? 30 : 15;
                                return (
                                    <>
                                        {linkedItem.text.slice(0, limit)}
                                        {linkedItem.text.length > limit ? '...' : ''}
                                    </>
                                );
                            })()}
                        </span>
                    )}

                    {/* 2. Context */}
                    {task.context && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            color: 'rgba(255, 255, 255, 0.9)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 500
                        }}>
                            <Tag size={12} style={{ opacity: 1 }} /> {task.context}
                        </span>
                    )}

                    {/* 3. Due Date - New line in Grid, Inline in List */}
                    {task.dueDate && (
                        <div style={{ width: compact ? 'auto' : '100%', marginTop: compact ? '0' : '0.1rem' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                background: 'rgba(255, 255, 255, 0.08)',
                                ...dateInfo.style
                            }}>
                                {dateInfo.isUrgent ? (
                                    <AlarmClock size={13} style={{ opacity: 1 }} />
                                ) : (
                                    <Clock size={12} style={{ opacity: 1 }} />
                                )}
                                {task.dueDate.split('T')[0].split('-').reverse().join('.')}
                            </span>
                        </div>
                    )}

                    {/* Subtasks (Optional, kept for completeness if user uses them) */}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            color: task.subtasks.filter(s => s.completed).length === task.subtasks.length ? '#10b981' : 'var(--color-text-muted)',
                            marginLeft: 'auto' // Push to right if desired, or keep inline
                        }}>
                            <ListChecks size={10} />
                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Right Action Area - Absolute in Grid, Relative in List */}
            <div style={compact ? {
                display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem'
            } : {
                position: 'absolute',
                bottom: isDone ? '0.25rem' : '0.5rem',
                right: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
            }}>

                {/* Archive Button (Only visible when done) */}
                {isDone && (
                    <button
                        onClick={handleArchive}
                        className="btn-archive"
                        title="Archive Task"
                        style={{
                            border: 'none',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '0.4rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            opacity: 0.8,
                            marginTop: '1px' // Visual alignment correction
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.color = '#10b981'; e.currentTarget.style.opacity = 1; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.opacity = 0.8; }}
                    >
                        <Archive size={18} />
                    </button>
                )}

                {/* Completion Toggle Circle */}
                <button
                    onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.id); }}
                    title={isDone ? "Mark as Undone" : "Mark as Done"}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: isDone ? 'none' : '2px solid rgba(255,255,255,0.3)',
                        background: isDone ? 'rgba(16, 185, 129, 0.8)' : 'transparent', // Pale green when done
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.2s ease-in-out',
                        flexShrink: 0
                    }}
                    onMouseEnter={e => {
                        if (!isDone) {
                            e.currentTarget.style.borderColor = '#10b981';
                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                        }
                    }}
                    onMouseLeave={e => {
                        if (!isDone) {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                            e.currentTarget.style.background = 'transparent';
                        }
                    }}
                >
                    {isDone && <CheckCircle size={16} strokeWidth={3} />}
                </button>
            </div>
        </div>
    );
}

function getPriorityColor(task) {
    if (task.urge && task.imp) return 'var(--color-danger)'; // Q1
    if (!task.urge && task.imp) return 'var(--color-primary)'; // Q2
    if (task.urge && !task.imp) return 'var(--color-warning)'; // Q3
    return 'var(--color-text-muted)'; // Q4
}
