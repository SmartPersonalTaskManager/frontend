import React, { useState, useMemo, useRef } from 'react';
import { useTasks } from '../../../context/TaskContext';
import { useMission } from '../../../context/MissionContext';
import {
    CheckCircle,
    Filter,
    ListChecks,
    TrendingUp,
    ChevronDown,
    PieChart
} from 'lucide-react';

export default function StatsView() {
    const { tasks } = useTasks();
    const { missions, getRootMissions } = useMission();
    const [selectedMissionId, setSelectedMissionId] = useState('all');
    const [showMissionDropdown, setShowMissionDropdown] = useState(false);

    // Refs for scrolling
    const weeklyRef = useRef(null);
    const statsRef = useRef(null);

    // --- Data Processing for Weekly Review ---
    const weeklyStats = useMemo(() => {
        const now = new Date();

        // Calculate Start of Current Week (Monday)
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay(); // 0 is Sunday
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        // Calculate End of Current Week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Format Date Range Label (e.g., "Dec 25 - Dec 31")
        const options = { month: 'short', day: 'numeric' };
        const dateRangeLabel = `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}`;

        const completedLastWeek = tasks.filter(t => {
            if (t.status !== 'done' || !t.completedAt) return false;
            const completedDate = new Date(t.completedAt);
            return completedDate >= startOfWeek && completedDate <= endOfWeek;
        });

        // Group by Mission for Progress (Overall, not just weekly)
        const missionProgress = {};

        // Initialize all root missions
        getRootMissions().forEach(m => {
            missionProgress[m.id] = {
                name: m.text,
                total: 0,
                completed: 0
            };
        });
        // Add an 'Unlinked' category
        missionProgress['unlinked'] = { name: 'Unlinked / General', total: 0, completed: 0 };

        // Include ALL tasks (including archived) for progress metrics
        tasks.forEach(t => {
            let mId = 'unlinked';
            // Find which root mission this task belongs to
            if (t.missionId) {
                const mission = missions.find(m => m.realId === t.missionId && (m.id.startsWith('submission-') || m.id.startsWith('mission-')));

                if (mission && mission.parentId) {
                    const parent = missions.find(p => p.id === mission.parentId);
                    if (parent) mId = parent.id;
                }
            }

            if (!missionProgress[mId]) {
                const m = missions.find(x => x.id === mId);
                if (m) {
                    missionProgress[mId] = { name: m.text, total: 0, completed: 0 };
                } else {
                    mId = 'unlinked';
                }
            }

            missionProgress[mId].total++;
            if (t.status === 'done') missionProgress[mId].completed++;
        });

        // --- Calculate Mission Progress Bars with 3 segments ---
        const missionProgressBars = getRootMissions()
            .filter(m => !m.isArchived)
            .map(rootMission => {
                // Get all submissions for this mission (including archived for progress)
                const subs = missions.filter(m => m.parentId === rootMission.id);
                const subRealIds = subs.map(s => s.realId);

                // Get all tasks linked to submissions of this mission (including archived)
                const linkedTasks = tasks.filter(t => {
                    if (!t.missionId) return false;
                    return subRealIds.includes(t.missionId);
                });

                const totalTasks = linkedTasks.length;

                const getTaskDate = (task) => {
                    if (task.dueDate) return new Date(task.dueDate);
                    if (task.completedAt) return new Date(task.completedAt);
                    return null;
                };

                const completedBeforeWeek = linkedTasks.filter(t => {
                    if (t.status !== 'done') return false;
                    const taskDate = getTaskDate(t);
                    if (!taskDate) return false;
                    return taskDate < startOfWeek;
                }).length;

                const completedThisWeek = linkedTasks.filter(t => {
                    if (t.status !== 'done') return false;
                    const taskDate = getTaskDate(t);
                    if (!taskDate) return false;
                    return taskDate >= startOfWeek && taskDate <= endOfWeek;
                }).length;

                const remaining = totalTasks - completedBeforeWeek - completedThisWeek;

                return {
                    missionId: rootMission.id,
                    missionName: rootMission.text,
                    totalTasks,
                    completedBeforeWeek,
                    completedThisWeek,
                    remaining
                };
            })
            .filter(mp => mp.totalTasks > 0);

        return {
            completedTasks: completedLastWeek,
            missionProgress: Object.values(missionProgress).filter(m => m.total > 0),
            missionProgressBars,
            dateRangeLabel
        };
    }, [tasks, missions, getRootMissions]);


    // --- Data Processing for General Stats (Filtered) ---
    const filteredStats = useMemo(() => {
        // Include ALL tasks for progress metrics (archived tasks still count)
        let filteredTasks = tasks;

        if (selectedMissionId !== 'all') {
            filteredTasks = filteredTasks.filter(t => {
                if (selectedMissionId === 'unlinked') return !t.missionId;

                const subMissionsRealIds = missions.filter(m => m.parentId === selectedMissionId).map(m => m.realId);
                if (subMissionsRealIds.includes(t.missionId)) return true;

                return false;
            });
        }

        const totalTasks = filteredTasks.length;
        const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
        const inProgressTasks = totalTasks - completedTasks;

        // 2. Submission Stats - Include archived for progress
        let filteredSubmissions = [];
        if (selectedMissionId === 'all') {
            filteredSubmissions = missions.filter(m => m.parentId);
        } else if (selectedMissionId === 'unlinked') {
            filteredSubmissions = [];
        } else {
            filteredSubmissions = missions.filter(m => m.parentId === selectedMissionId);
        }

        const totalSubs = filteredSubmissions.length;
        const completedSubs = filteredSubmissions.filter(s => {
            if (s.status === 'done') return true;

            // Include all tasks (archived and active) for progress calculation
            const subTasks = tasks.filter(t => t.missionId === s.realId);

            if (subTasks.length > 0 && subTasks.every(t => t.status === 'done')) {
                return true;
            }

            return false;
        }).length;
        const inProgressSubs = totalSubs - completedSubs;

        // 3. Mission Stats (only for "All Missions" view)
        let completedMissions = 0;
        let inProgressMissions = 0;

        if (selectedMissionId === 'all') {
            const rootMissions = getRootMissions().filter(m => !m.isArchived);

            rootMissions.forEach(rootMission => {
                // Get all submissions for this mission (include archived for progress)
                const missionSubmissions = missions.filter(m => m.parentId === rootMission.id);

                if (missionSubmissions.length === 0) {
                    inProgressMissions++;
                } else {
                    const allSubsComplete = missionSubmissions.every(s => {
                        if (s.status === 'done') return true;
                        // Include all tasks for progress calculation
                        const subTasks = tasks.filter(t => t.missionId === s.realId);
                        return subTasks.length > 0 && subTasks.every(t => t.status === 'done');
                    });

                    if (allSubsComplete) {
                        completedMissions++;
                    } else {
                        inProgressMissions++;
                    }
                }
            });
        }

        return {
            completedTasks,
            inProgressTasks,
            completedSubs,
            inProgressSubs,
            completedMissions,
            inProgressMissions
        };
    }, [tasks, selectedMissionId, missions, getRootMissions]);


    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

            {/* --- COLUMN 1: PROGRESS METRICS --- */}
            <div
                ref={statsRef}
                className="glass-panel"
                style={{
                    padding: '1rem 1.5rem 1.5rem 1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    height: '100%'
                }}
            >
                <div style={{ height: '3.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.35rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <h3
                            className="text-gradient-primary"
                            style={{ fontSize: '1.5rem', margin: 0, lineHeight: 1.2, cursor: 'pointer' }}
                            onClick={() => statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        >
                            Progress Metrics
                        </h3>
                    </div>

                    {/* Filter - Custom Dropdown */}
                    <div style={{ position: 'relative', width: '220px' }}>
                        <button
                            onClick={() => setShowMissionDropdown(!showMissionDropdown)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.5rem 1rem',
                                color: 'white',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                outline: 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                <Filter size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {selectedMissionId === 'all' ? 'All Missions' :
                                        selectedMissionId === 'unlinked' ? 'Unlinked Tasks' :
                                            missions.find(m => m.id === selectedMissionId)?.text || 'Unknown'}
                                </span>
                            </div>
                            <ChevronDown size={16} style={{ color: 'var(--color-text-muted)', transform: showMissionDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                        </button>

                        {/* Dropdown Menu */}
                        {showMissionDropdown && (
                            <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowMissionDropdown(false)} />
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 6px)',
                                    left: 0,
                                    width: '100%',
                                    background: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                                    zIndex: 50,
                                    padding: '0.5rem',
                                    animation: 'fadeIn 0.1s ease-out'
                                }}>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <button
                                            onClick={() => { setSelectedMissionId('all'); setShowMissionDropdown(false); }}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '6px',
                                                background: selectedMissionId === 'all' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                color: selectedMissionId === 'all' ? '#818cf8' : 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                fontSize: '0.9rem',
                                                marginBottom: '2px',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            All Missions
                                        </button>

                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

                                        {getRootMissions().map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => { setSelectedMissionId(m.id); setShowMissionDropdown(false); }}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '6px',
                                                    background: selectedMissionId === m.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                    color: selectedMissionId === m.id ? '#818cf8' : 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    fontSize: '0.9rem',
                                                    marginBottom: '2px',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                {m.text}
                                            </button>
                                        ))}


                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* 1. TASK Card */}
                    <div style={{
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '0.85rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        minHeight: '95px',
                        height: '120px'
                    }}>
                        {/* Header */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tasks</span>
                        </div>

                        {/* Progress Bar with Labels */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8', lineHeight: 1 }}>{filteredStats.completedTasks}</span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.2rem' }}>Done</span>
                            </div>

                            <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(filteredStats.completedTasks + filteredStats.inProgressTasks) > 0
                                        ? (filteredStats.completedTasks / (filteredStats.completedTasks + filteredStats.inProgressTasks)) * 100
                                        : 0}%`,
                                    background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                                    boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)',
                                    transition: 'width 0.5s ease-out'
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#cbd5e1', lineHeight: 1 }}>{filteredStats.inProgressTasks}</span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.2rem' }}>Active</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. SUBMISSION Card */}
                    <div style={{
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '0.85rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        minHeight: '95px',
                        height: '120px'
                    }}>
                        {/* Header */}
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submissions</span>
                        </div>

                        {/* Progress Bar with Labels */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8', lineHeight: 1 }}>{filteredStats.completedSubs}</span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.2rem' }}>Done</span>
                            </div>

                            <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(filteredStats.completedSubs + filteredStats.inProgressSubs) > 0
                                        ? (filteredStats.completedSubs / (filteredStats.completedSubs + filteredStats.inProgressSubs)) * 100
                                        : 0}%`,
                                    background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                                    boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)',
                                    transition: 'width 0.5s ease-out'
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#cbd5e1', lineHeight: 1 }}>{filteredStats.inProgressSubs}</span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.2rem' }}>Active</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. MISSION Card - Only visible when "All Missions" is selected */}
                    {selectedMissionId === 'all' && (
                        <div style={{
                            position: 'relative',
                            overflow: 'hidden',
                            padding: '0.85rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minHeight: '95px',
                            height: '120px'
                        }}>
                            {/* Header */}
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Missions</span>
                            </div>

                            {/* Progress Bar with Labels */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8', lineHeight: 1 }}>{filteredStats.completedMissions}</span>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.2rem' }}>Done</span>
                                </div>

                                <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(filteredStats.completedMissions + filteredStats.inProgressMissions) > 0
                                            ? (filteredStats.completedMissions / (filteredStats.completedMissions + filteredStats.inProgressMissions)) * 100
                                            : 0}%`,
                                        background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                                        boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)',
                                        transition: 'width 0.5s ease-out'
                                    }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#cbd5e1', lineHeight: 1 }}>{filteredStats.inProgressMissions}</span>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.2rem' }}>Active</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>

            {/* --- COLUMN 2: WEEKLY REVIEW --- */}
            <div
                ref={weeklyRef}
                className="glass-panel"
                style={{
                    padding: '1rem 1.5rem 1.5rem 1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    height: '100%'
                }}
            >
                <div style={{ height: '3.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.35rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3
                        className="text-gradient-primary"
                        style={{ fontSize: '1.5rem', margin: 0, lineHeight: 1.2, cursor: 'pointer' }}
                        onClick={() => weeklyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                        Weekly Review
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {weeklyStats.dateRangeLabel}
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Mission Progress Bars */}
                    {weeklyStats.missionProgressBars && weeklyStats.missionProgressBars.length > 0 ? (
                        weeklyStats.missionProgressBars.map((mp) => {
                            const beforePercent = mp.totalTasks > 0 ? (mp.completedBeforeWeek / mp.totalTasks) * 100 : 0;
                            const thisWeekPercent = mp.totalTasks > 0 ? (mp.completedThisWeek / mp.totalTasks) * 100 : 0;
                            const isComplete = mp.remaining === 0 && mp.totalTasks > 0;

                            return (
                                <div key={mp.missionId} style={{
                                    padding: '0.85rem 1.25rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: 'var(--radius-md)',
                                    border: isComplete ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                                    minHeight: '95px',
                                    height: '120px'
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
                                            {isComplete && (
                                                <CheckCircle size={16} style={{ color: '#10b981' }} />
                                            )}
                                            {mp.missionName}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'white',
                                            fontWeight: 400
                                        }}>
                                            {mp.completedBeforeWeek + mp.completedThisWeek}/{mp.totalTasks}
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
                                                title={`Before this week: ${mp.completedBeforeWeek} tasks`}
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
                                                title={`This week: ${mp.completedThisWeek} tasks`}
                                            />
                                        )}
                                        {/* Remaining - Dark (already background color) */}
                                    </div>

                                    {/* Legend */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        marginTop: '0.4rem',
                                        fontSize: '0.7rem',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {mp.completedBeforeWeek > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '2px',
                                                    background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                                                    opacity: 0.6
                                                }} />
                                                <span>Previous ({mp.completedBeforeWeek})</span>
                                            </div>
                                        )}
                                        {mp.completedThisWeek > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '2px',
                                                    background: 'linear-gradient(90deg, #06b6d4, #22d3ee)'
                                                }} />
                                                <span>This Week ({mp.completedThisWeek})</span>
                                            </div>
                                        )}
                                        {mp.remaining > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '2px',
                                                    background: 'rgba(255,255,255,0.15)'
                                                }} />
                                                <span>Remaining ({mp.remaining})</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{
                            padding: '3rem 2rem',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)',
                            fontStyle: 'italic',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            No missions with linked tasks found.
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}
