import React, { useState } from 'react';
import { useTasks } from '../../../context/TaskContext';
import { useMission } from '../../../context/MissionContext';
import { Archive, Trash2, RotateCcw, Target, Flag } from 'lucide-react';

export default function ArchivedTasksView() {
    const { tasks, deletePermanently, unarchiveTask, cascadeUnarchiveTasksBySubmissionIds, cascadeDeleteTasksBySubmissionIds } = useTasks();
    const { missions, unarchiveMission, deleteMissionPermanently } = useMission();

    const [activeTab, setActiveTab] = useState('tasks');

    // Filter archived items
    const archivedTasks = tasks.filter(t => t.isArchived);
    const archivedMissions = missions.filter(m => m.isArchived && m.type === 'mission');
    const archivedSubmissions = missions.filter(m => m.isArchived && m.type === 'submission');

    // Sort by completion date descending (newest first)
    const sortedArchivedTasks = [...archivedTasks].sort((a, b) => {
        return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
    });
    const sortedArchivedMissions = [...archivedMissions].sort((a, b) => {
        return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
    });
    const sortedArchivedSubmissions = [...archivedSubmissions].sort((a, b) => {
        return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
    });

    const tabs = [
        { id: 'tasks', label: 'Tasks', count: archivedTasks.length, icon: Archive },
        { id: 'missions', label: 'Missions', count: archivedMissions.length, icon: Target },
        { id: 'submissions', label: 'Submissions', count: archivedSubmissions.length, icon: Flag },
    ];

    const renderEmptyState = (type) => (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-lg)' }}>
            <Archive size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No archived {type} yet.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Completed {type} moved to archive will appear here.</p>
        </div>
    );

    return (
        <div style={{ padding: '0 1rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '0.75rem',
                alignItems: 'center'
            }}>
                {tabs.map(tab => {
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === tab.id ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                                border: activeTab === tab.id ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                                borderRadius: '8px',
                                color: activeTab === tab.id ? '#fff' : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '1rem', // Font boyutu büyütüldü
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '10px',
                                    fontSize: '0.75rem'
                                }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {activeTab === 'tasks' && (
                sortedArchivedTasks.length === 0 ? renderEmptyState('tasks') : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {sortedArchivedTasks.map(task => (
                            <ArchivedItem
                                key={task.id}
                                item={task}
                                title={task.title}
                                onRestore={() => unarchiveTask(task.id)}
                                onDelete={() => deletePermanently(task.id)}
                                type="task"
                            />
                        ))}
                    </div>
                )
            )}

            {activeTab === 'missions' && (
                sortedArchivedMissions.length === 0 ? renderEmptyState('missions') : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {sortedArchivedMissions.map(mission => (
                            <ArchivedItem
                                key={mission.id}
                                item={mission}
                                title={mission.text}
                                onRestore={() => unarchiveMission(mission.id, cascadeUnarchiveTasksBySubmissionIds)}
                                onDelete={() => deleteMissionPermanently(mission.id, cascadeDeleteTasksBySubmissionIds)}
                                type="mission"
                            />
                        ))}
                    </div>
                )
            )}

            {activeTab === 'submissions' && (
                sortedArchivedSubmissions.length === 0 ? renderEmptyState('submissions') : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {sortedArchivedSubmissions.map(submission => (
                            <ArchivedItem
                                key={submission.id}
                                item={submission}
                                title={submission.text}
                                onRestore={() => unarchiveMission(submission.id, cascadeUnarchiveTasksBySubmissionIds)}
                                onDelete={() => deleteMissionPermanently(submission.id, cascadeDeleteTasksBySubmissionIds)}
                                type="submission"
                            />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

function ArchivedItem({ item, title, onRestore, onDelete, type }) {
    const [isHovered, setIsHovered] = React.useState(false);

    const getIcon = () => {
        switch (type) {
            case 'mission': return <Target size={16} style={{ color: '#a855f7', opacity: 0.7 }} />;
            case 'submission': return <Flag size={16} style={{ color: '#6366f1', opacity: 0.7 }} />;
            default: return null;
        }
    };

    const getTypeLabel = () => {
        switch (type) {
            case 'mission': return 'Mission';
            case 'submission': return 'Submission';
            default: return 'Task';
        }
    };

    return (
        <div
            className="glass-panel"
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: 'var(--radius-md)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {getIcon()}
            <div style={{ flex: 1 }}>
                <h4 style={{ color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {title}
                    {type !== 'task' && (
                        <span style={{
                            fontSize: '0.65rem',
                            background: type === 'mission' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                            color: type === 'mission' ? '#a855f7' : '#6366f1',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            fontWeight: 600
                        }}>
                            {getTypeLabel()}
                        </span>
                    )}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', opacity: 0.7 }}>
                    Completed: {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Unknown'}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
                <button
                    onClick={onRestore}
                    className="btn btn-ghost"
                    title="Restore"
                    style={{ padding: '0.5rem', color: '#4ade80' }}
                >
                    <RotateCcw size={18} />
                </button>
                <button
                    onClick={() => {
                        if (window.confirm(`Delete this ${type} permanently? This cannot be undone.`)) {
                            onDelete();
                        }
                    }}
                    className="btn btn-ghost"
                    title="Delete Permanently"
                    style={{ padding: '0.5rem', color: 'var(--color-danger)' }}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
