import React, { useMemo } from 'react';
import { useTasks } from '../../../context/TaskContext';
import { useMission } from '../../../context/MissionContext';
import { Target, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function WeeklyReview() {
    const { tasks } = useTasks();
    const { missions, getRootMissions, getSubMissions } = useMission();

    // Calculate current week boundaries (Sunday to Saturday or Monday to Sunday based on locale)
    // Using Sunday as week start for simplicity
    const weekBoundaries = useMemo(() => {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Get the start of the current week (Sunday 00:00:00)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - currentDay);
        weekStart.setHours(0, 0, 0, 0);

        // Get the end of the current week (Saturday 23:59:59)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return { weekStart, weekEnd };
    }, []);

    // Format week range for display
    const weekRangeDisplay = useMemo(() => {
        const { weekStart, weekEnd } = weekBoundaries;
        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        };
        return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    }, [weekBoundaries]);

    // Get only root missions (not submissions/archived)
    const rootMissions = useMemo(() => {
        return missions.filter(m => m.type === 'mission' && !m.isArchived);
    }, [missions]);

    // Calculate progress for each mission
    const missionProgressData = useMemo(() => {
        const { weekStart, weekEnd } = weekBoundaries;

        return rootMissions.map(mission => {
            // Get all submissions for this mission
            const submissions = getSubMissions(mission.id);
            const submissionIds = submissions.map(s => s.realId);

            // Get all tasks linked to submissions of this mission
            const linkedTasks = tasks.filter(t => {
                if (!t.missionId) return false;
                // missionId in task context is actually subMissionId (submission's realId)
                const taskSubMissionId = typeof t.missionId === 'string'
                    ? parseInt(t.missionId.replace('submission-', ''))
                    : t.missionId;
                return submissionIds.includes(taskSubMissionId);
            });

            const totalTasks = linkedTasks.length;

            // Count completed tasks before this week
            const completedBeforeWeek = linkedTasks.filter(t => {
                if (t.status !== 'done' || !t.completedAt) return false;
                const completedDate = new Date(t.completedAt);
                return completedDate < weekStart;
            }).length;

            // Count completed tasks this week
            const completedThisWeek = linkedTasks.filter(t => {
                if (t.status !== 'done' || !t.completedAt) return false;
                const completedDate = new Date(t.completedAt);
                return completedDate >= weekStart && completedDate <= weekEnd;
            }).length;

            // Remaining tasks
            const remaining = totalTasks - completedBeforeWeek - completedThisWeek;

            return {
                mission,
                totalTasks,
                completedBeforeWeek,
                completedThisWeek,
                remaining,
                submissions,
                linkedTasks
            };
        });
    }, [rootMissions, tasks, weekBoundaries, getSubMissions]);

    // Filter only missions that have linked tasks
    const missionsWithTasks = missionProgressData.filter(mp => mp.totalTasks > 0);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Header */}
            <div className="glass-panel" style={{
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="text-gradient-primary" style={{ fontSize: '2rem', margin: 0, lineHeight: 1.1 }}>
                        Weekly Review
                    </h2>
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(99, 102, 241, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#c4b5fd',
                        letterSpacing: '0.5px'
                    }}>
                        {weekRangeDisplay}
                    </div>
                </div>
            </div>

            {/* Mission Progress Section */}
            <div className="glass-panel" style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255,255,255,0.08)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Target size={18} style={{ color: '#a855f7' }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                        Mission Progress
                    </h3>
                </div>

                {missionsWithTasks.length === 0 ? (
                    <div style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic'
                    }}>
                        No missions with linked tasks found.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {missionsWithTasks.map(({ mission, totalTasks, completedBeforeWeek, completedThisWeek, remaining }) => {
                            // Calculate percentages
                            const beforePercent = totalTasks > 0 ? (completedBeforeWeek / totalTasks) * 100 : 0;
                            const thisWeekPercent = totalTasks > 0 ? (completedThisWeek / totalTasks) * 100 : 0;
                            const remainingPercent = totalTasks > 0 ? (remaining / totalTasks) * 100 : 0;
                            const isComplete = remaining === 0;

                            return (
                                <div key={mission.id} style={{
                                    padding: '1rem 1.25rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    {/* Mission Name */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {mission.text}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            {completedBeforeWeek + completedThisWeek}/{totalTasks}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{
                                        height: '12px',
                                        borderRadius: '6px',
                                        background: 'rgba(255,255,255,0.08)',
                                        overflow: 'hidden',
                                        display: 'flex'
                                    }}>
                                        {/* Before This Week - Muted Purple */}
                                        {beforePercent > 0 && (
                                            <div
                                                style={{
                                                    width: `${beforePercent}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                                                    opacity: 0.6,
                                                    transition: 'width 0.5s ease'
                                                }}
                                                title={`Before this week: ${completedBeforeWeek} tasks`}
                                            />
                                        )}
                                        {/* This Week - Bright Cyan/Teal */}
                                        {thisWeekPercent > 0 && (
                                            <div
                                                style={{
                                                    width: `${thisWeekPercent}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
                                                    boxShadow: '0 0 12px rgba(34, 211, 238, 0.5)',
                                                    transition: 'width 0.5s ease'
                                                }}
                                                title={`This week: ${completedThisWeek} tasks`}
                                            />
                                        )}
                                        {/* Remaining - Dark (already background color) */}
                                    </div>

                                    {/* Legend */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        marginTop: '0.75rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {completedBeforeWeek > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '2px',
                                                    background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                                                    opacity: 0.6
                                                }} />
                                                <span>Previous ({completedBeforeWeek})</span>
                                            </div>
                                        )}
                                        {completedThisWeek > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '2px',
                                                    background: 'linear-gradient(90deg, #06b6d4, #22d3ee)'
                                                }} />
                                                <span>This Week ({completedThisWeek})</span>
                                            </div>
                                        )}
                                        {remaining > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '2px',
                                                    background: 'rgba(255,255,255,0.15)'
                                                }} />
                                                <span>Remaining ({remaining})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Weekly Stats Summary */}
                {missionsWithTasks.length > 0 && (
                    <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}>
                                <TrendingUp size={20} style={{ color: '#22d3ee' }} />
                                {missionsWithTasks.reduce((sum, mp) => sum + mp.completedThisWeek, 0)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                Tasks Completed This Week
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: '#a855f7'
                            }}>
                                {missionsWithTasks.filter(mp => mp.remaining === 0).length}/{missionsWithTasks.length}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                Missions Completed
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
