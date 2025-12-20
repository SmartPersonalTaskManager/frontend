import React from 'react';
import { useTasks } from '../../../context/TaskContext';
import { useMission } from '../../../context/MissionContext';
import { PieChart, Target, CheckCircle, Clock, Inbox, Compass } from 'lucide-react';

export default function StatsView() {
    const { tasks } = useTasks();
    const { missions, visions, values } = useMission();

    const activeTasks = tasks.filter(t => !t.isArchived);
    const totalTasks = activeTasks.length;
    const completedTasks = activeTasks.filter(t => t.status === 'done').length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const urgentTasks = activeTasks.filter(t => t.urge && t.status !== 'done').length;
    const importantTasks = activeTasks.filter(t => t.imp && t.status !== 'done').length;
    const inboxTasks = activeTasks.filter(t => t.isInbox && t.status !== 'done').length;

    // Mission alignment
    const linkedTasks = activeTasks.filter(t => t.missionId && t.status !== 'done').length;
    const unlinkedTasks = activeTasks.filter(t => !t.missionId && t.status !== 'done' && !t.isInbox).length;

    // Context distribution - GTD contexts
    const contextCounts = {
        '@home': activeTasks.filter(t => t.context === '@home').length,
        '@work': activeTasks.filter(t => t.context === '@work').length,
        '@computer': activeTasks.filter(t => t.context === '@computer').length,
        '@phone': activeTasks.filter(t => t.context === '@phone').length,
        '@errands': activeTasks.filter(t => t.context === '@errands').length,
        '@waiting': activeTasks.filter(t => t.context === '@waiting').length,
        '@anywhere': activeTasks.filter(t => t.context === '@anywhere').length
    };

    // Covey Matrix distribution
    const q1 = activeTasks.filter(t => t.urge && t.imp && t.status !== 'done').length;
    const q2 = activeTasks.filter(t => !t.urge && t.imp && t.status !== 'done').length;
    const q3 = activeTasks.filter(t => t.urge && !t.imp && t.status !== 'done').length;
    const q4 = activeTasks.filter(t => !t.urge && !t.imp && t.status !== 'done' && !t.isInbox).length;

    // Subtask stats
    const tasksWithSubtasks = activeTasks.filter(t => t.subtasks && t.subtasks.length > 0);
    const totalSubtasks = tasksWithSubtasks.reduce((acc, t) => acc + t.subtasks.length, 0);
    const completedSubtasks = tasksWithSubtasks.reduce((acc, t) => acc + t.subtasks.filter(s => s.completed).length, 0);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <PieChart size={24} style={{ color: '#bae6fd' }} />
                </div>
                <div>
                     <h2 className="text-gradient-primary" style={{ fontSize: '1.75rem', margin: 0 }}>Productivity Insights</h2>
                     <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Track your performance and alignment.</p>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <StatCard 
                    title="Completion Rate" 
                    value={`${completionRate}%`} 
                    sub={`of ${totalTasks} active tasks`} 
                    color="var(--color-primary)" 
                    icon={<Target size={20} />}
                />
                <StatCard 
                    title="Completed" 
                    value={completedTasks} 
                    color="#10b981" 
                    icon={<CheckCircle size={20} />}
                />
                <StatCard 
                    title="In Progress" 
                    value={totalTasks - completedTasks - inboxTasks} 
                    color="#f59e0b" 
                    icon={<Clock size={20} />}
                />
                <StatCard 
                    title="In Inbox" 
                    value={inboxTasks} 
                    color="#a855f7" 
                    icon={<Inbox size={20} />}
                />

            </div>

            {/* Two Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* GTD Context Distribution */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                         <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>📍</span> Context Distribution
                         </h4>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.entries(contextCounts).map(([context, count]) => (
                            <ProgressBar
                                key={context}
                                label={context}
                                value={count}
                                total={totalTasks}
                                color={getContextColor(context)}
                            />
                        ))}
                    </div>
                </div>

                {/* Covey Matrix Breakdown */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>📊 Covey Matrix Breakdown</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <ProgressBar label="Q1: Urgent & Important" value={q1} total={q1 + q2 + q3 + q4} color="#ef4444" />
                        <ProgressBar label="Q2: Not Urgent & Important" value={q2} total={q1 + q2 + q3 + q4} color="#6366f1" />
                        <ProgressBar label="Q3: Urgent & Not Important" value={q3} total={q1 + q2 + q3 + q4} color="#f59e0b" />
                        <ProgressBar label="Q4: Neither" value={q4} total={q1 + q2 + q3 + q4} color="#94a3b8" />
                    </div>
                </div>
            </div>

            {/* Mission Alignment & Subtasks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Mission Alignment */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>🎯 Mission Alignment</h4>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: `conic-gradient(#6366f1 ${linkedTasks / (linkedTasks + unlinkedTasks) * 360}deg, rgba(255,255,255,0.1) 0deg)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.5rem'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                }}>
                                    {linkedTasks + unlinkedTasks > 0 ? Math.round((linkedTasks / (linkedTasks + unlinkedTasks)) * 100) : 0}%
                                </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Linked to Mission</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ color: '#6366f1', fontWeight: 600 }}>{linkedTasks}</span> linked
                            </div>
                            <div>
                                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{unlinkedTasks}</span> unlinked
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtasks Progress */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>✅ Checklist Progress</h4>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981' }}>
                            {completedSubtasks}/{totalSubtasks}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            subtasks completed
                        </div>
                        <div style={{
                            height: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
                                background: '#10b981',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                            {tasksWithSubtasks.length} tasks have checklists
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function getContextColor(context) {
    const colors = {
        '@home': '#f472b6',
        '@work': '#60a5fa',
        '@computer': '#a78bfa',
        '@phone': '#34d399',
        '@errands': '#fbbf24',
        '@waiting': '#94a3b8',
        '@anywhere': '#22d3d1'
    };
    return colors[context] || '#94a3b8';
}

function StatCard({ title, value, sub, color, icon }) {
    return (
        <div className="glass-panel" style={{ 
            padding: '1.5rem', 
            borderRadius: 'var(--radius-lg)', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative', 
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '1rem', 
                opacity: 0.1, 
                color: color, 
                transform: 'scale(1.5)' 
            }}>
                {icon}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ 
                    padding: '0.25rem', 
                    borderRadius: '4px', 
                    background: `${color}20`, 
                    display: 'flex', 
                    color: color 
                }}>
                    {icon}
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{title}</span>
            </div>
            
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{value}</span>
            {sub && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{sub}</span>}
        </div>
    )
}

function ProgressBar({ label, value, total, color }) {
    const pct = total === 0 ? 0 : Math.round((value / total) * 100);
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <span>{label}</span>
                <span>{value} ({pct}%)</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color }} />
            </div>
        </div>
    )
}
