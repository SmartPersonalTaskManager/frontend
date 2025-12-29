import React from 'react';
import { useTasks } from '../../../context/TaskContext';
import { Archive, Trash2, RotateCcw } from 'lucide-react';

export default function ArchivedTasksView() {
    const { tasks, deletePermanently, unarchiveTask } = useTasks();

    // Filter archived tasks only
    const archivedTasks = tasks.filter(t => t.isArchived);

    // Sort by completion date descending (newest first)
    const sortedArchivedTasks = [...archivedTasks].sort((a, b) => {
        return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
    });

    return (
        <div style={{ padding: '0 1rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <Archive size={24} style={{ color: '#a855f7' }} />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                    Archived Tasks
                </h2>
                {archivedTasks.length > 0 && (
                    <span style={{
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#a855f7',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}>
                        {archivedTasks.length}
                    </span>
                )}
            </div>

            {/* Content */}
            {sortedArchivedTasks.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-lg)' }}>
                    <Archive size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No archived tasks yet.</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Completed tasks moved to archive will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {sortedArchivedTasks.map(task => (
                        <ArchivedTaskItem
                            key={task.id}
                            task={task}
                            onRestore={() => unarchiveTask(task.id)}
                            onDelete={() => deletePermanently(task.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ArchivedTaskItem({ task, onRestore, onDelete }) {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            className="glass-panel"
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: 'var(--radius-md)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ flex: 1 }}>
                <h4 style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                    {task.title}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', opacity: 0.7 }}>
                    Completed: {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Unknown'}
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
                        if (window.confirm('Delete this task permanently? This cannot be undone.')) {
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
