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

        tasks.filter(t => !t.isArchived).forEach(t => {
            let mId = 'unlinked';
            // Find which root mission this task belongs to
            if (t.missionId) {
                // If t.missionId is a sub-mission, we need to find its root parent
                // But simplified logic: check if t.missionId exists in our list.
                // Since missions list is flat, we can look it up.
                const mission = missions.find(m => m.id === t.missionId);
                if (mission) {
                    if (mission.parentId) {
                        // It's a submission, find parent
                        const parent = missions.find(p => p.id === mission.parentId);
                        if (parent) mId = parent.id;
                    } else {
                        // It's a root mission
                        mId = mission.id;
                    }
                }
            }

            if (!missionProgress[mId]) {
                // Fallback if mission logic fails or new mission not yet in initialized list
                // Just ignore or add to unlinked? Let's add if we have the name
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

        return {
            completedTasks: completedLastWeek,
            missionProgress: Object.values(missionProgress).filter(m => m.total > 0),
            dateRangeLabel
        };
    }, [tasks, missions, getRootMissions]);


    // --- Data Processing for General Stats (Filtered) ---
    const filteredStats = useMemo(() => {
        let filteredTasks = tasks.filter(t => !t.isArchived);

        if (selectedMissionId !== 'all') {
            filteredTasks = filteredTasks.filter(t => {
                if (selectedMissionId === 'unlinked') return !t.missionId;

                // Check if task is directly linked or linked to a submission of this mission
                if (t.missionId === selectedMissionId) return true;

                // If selected is a root mission, include its submissions' tasks
                const subMissions = missions.filter(m => m.parentId === selectedMissionId).map(m => m.id);
                if (subMissions.includes(t.missionId)) return true;

                return false;
            });
        }

        const total = filteredTasks.length;
        const completed = filteredTasks.filter(t => t.status === 'done').length;
        const inProgress = total - completed; // Simplified (includes todo, waiting, etc.)
        const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { total, completed, inProgress, rate };
    }, [tasks, selectedMissionId, missions]);


    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* --- WEEKLY REVIEW SECTION --- */}
            <div
                ref={weeklyRef}
                className="glass-panel"
                style={{
                    padding: '1.0rem 1.5rem 1.5rem 1.5rem',
                    borderRadius: 'var(--radius-lg)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3
                        className="text-gradient-primary"
                        style={{ fontSize: '1.5rem', margin: 0, lineHeight: 1.2, cursor: 'pointer' }}
                        onClick={() => weeklyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                        Weekly Review
                    </h3>
                    <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {weeklyStats.dateRangeLabel}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

                    {/* Recently Completed Submissions */}
                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Completed Submissions</span>
                        </h4>

                        {weeklyStats.completedTasks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {weeklyStats.completedTasks.map(task => (
                                    <div key={task.id} style={{
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <div style={{ color: '#10b981' }}><CheckCircle size={18} /></div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.1rem' }}>
                                                {task.subtasks && task.subtasks.length > 0 && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <ListChecks size={12} /> {task.subtasks.length} tasks
                                                    </span>
                                                )}
                                                {task.completedAt && (
                                                    <span>{new Date(task.completedAt).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem', padding: '1rem' }}>
                                No completed submissions this week.
                            </div>
                        )}
                    </div>

                    {/* Mission Progress */}
                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Mission Alignment
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                            {weeklyStats.missionProgress.map((mp, idx) => (
                                <div key={idx}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                                        <span style={{ fontWeight: 500 }}>{mp.name}</span>
                                        <span style={{ color: 'var(--color-text-muted)' }}>{Math.round((mp.completed / mp.total) * 100)}%</span>
                                    </div>
                                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(mp.completed / mp.total) * 100}%`,
                                            background: idx % 2 === 0 ? '#6366f1' : '#ec4899', // Alternating colors for aesthetics
                                            borderRadius: '3px',
                                            transition: 'width 0.5s ease-out'
                                        }} />
                                    </div>
                                </div>
                            ))}
                            {weeklyStats.missionProgress.length === 0 && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem', padding: '1rem' }}>
                                    No linked activity found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* --- PROGRESS METRICS SECTION --- */}
            <div
                ref={statsRef}
                className="glass-panel"
                style={{
                    padding: '1.0rem 1.5rem 1.5rem 1.5rem',
                    borderRadius: 'var(--radius-lg)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                    <div style={{ position: 'relative', width: '250px' }}>
                        <button
                            onClick={() => setShowMissionDropdown(!showMissionDropdown)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {/* Stats Cards */}
                        <div style={{ position: 'relative', overflow: 'hidden', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', height: '150px' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#10b981' }} />
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Completed</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>{filteredStats.completed}</div>
                            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.25rem' }}>Submissions Done</div>
                        </div>

                        <div style={{ position: 'relative', overflow: 'hidden', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', height: '150px' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#f59e0b' }} />
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>In Progress</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>{filteredStats.inProgress}</div>
                            <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.25rem' }}>Active Submissions</div>
                        </div>
                    </div>

                    <div style={{ position: 'relative', overflow: 'hidden', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', height: '150px' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#6366f1' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Completion Rate</span>
                            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#6366f1' }}>{filteredStats.rate}%</span>
                        </div>
                        <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${filteredStats.rate}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
                        </div>
                        <div style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', textAlign: 'right' }}>
                            {filteredStats.completed} / {filteredStats.total} Total Submissions
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
