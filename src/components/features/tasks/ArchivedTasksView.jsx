import React from 'react';
import { useTasks } from '../../../context/TaskContext';
import { Archive, Trash2, RotateCcw } from 'lucide-react';

export default function ArchivedTasksView() {
    const { tasks, deletePermanently, unarchiveTask } = useTasks();

    const archivedTasks = tasks.filter(t => t.isArchived);

    // Sort by completion date descending (newest first)
    const sortedArchived = [...archivedTasks].sort((a, b) => {
        return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
    });

    return (
        <div style={{ padding: '0 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Archive className="text-muted" /> Archived Tasks
            </h3>

            {sortedArchived.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-lg)' }}>
                    <Archive size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No archived tasks yet.</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Completed tasks moved to archive will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {sortedArchived.map(task => (
                        <ArchivedTaskItem 
                            key={task.id} 
                            task={task} 
                            onRestore={unarchiveTask} 
                            onDelete={deletePermanently} 
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
                <h4 style={{ color: 'var(--color-text-muted)' }}>{task.title}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    Completed on: {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Unknown'}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
                <button
                    onClick={() => onRestore(task.id)}
                    className="btn btn-ghost"
                    title="Restore to Dashboard"
                    style={{ padding: '0.5rem', color: '#4ade80' }}
                >
                    <RotateCcw size={18} />
                </button>
                <button
                    onClick={() => {
                        if (window.confirm('Delete this task permanently? This cannot be undone.')) {
                            onDelete(task.id);
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
