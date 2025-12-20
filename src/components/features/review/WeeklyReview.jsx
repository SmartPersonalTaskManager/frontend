import React, { useState } from 'react';
import { useTasks } from '../../../context/TaskContext';
import { useMission } from '../../../context/MissionContext';
import { CheckCircle2, Circle, RefreshCcw, ChevronRight, ChevronDown, Brain, Target, ListTodo, Archive, Plus, Trash2, Calendar as CalendarIcon, ArrowRight, Tag } from 'lucide-react';

export default function WeeklyReview() {
    const { tasks, archiveTask, addTask, updateTask, deletePermanently } = useTasks();
    const { visions, values, missions } = useMission();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [expandedStep, setExpandedStep] = useState(0);

    // --- Step 1 Layout: Brain Dump ---
    const [dumpInput, setDumpInput] = useState('');
    const handleDump = (e) => {
        e.preventDefault();
        if(!dumpInput.trim()) return;
        addTask({
            title: dumpInput,
            isInbox: true,
            context: '@inbox',
            createdAt: new Date().toISOString()
        });
        setDumpInput('');
    };

    // --- Step 2 Layout: Process Inbox ---
    const inboxTasks = tasks.filter(t => t.isInbox && !t.isArchived && t.status !== 'done');
    const processInboxItem = (taskId, action, payload = {}) => {
        if (action === 'delete') {
            if(confirm('Delete permanently?')) deletePermanently(taskId);
        } else if (action === 'defer') {
             // Set due date (simple +1 day for now or we could open a picker, simplified for UI)
             const tomorrow = new Date();
             tomorrow.setDate(tomorrow.getDate() + 1);
             updateTask(taskId, { isInbox: false, dueDate: tomorrow.toISOString(), context: '@waiting' });
        } else if (action === 'do') {
             // Move to Next Actions (default @home)
             updateTask(taskId, { isInbox: false, context: payload.context || '@home' });
        } else if (action === 'delegate') {
             updateTask(taskId, { isInbox: false, context: '@waiting' });
        }
    };

    const reviewSteps = [
        {
            id: 'collect',
            title: 'Collect & Capture',
            icon: Brain,
            description: 'Clear your mind. Dump everything that has your attention into the Inbox.',
            actionLabel: 'Brain Dump',
            color: '#a855f7',
            renderContent: () => (
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <form onSubmit={handleDump} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={dumpInput}
                            onChange={(e) => setDumpInput(e.target.value)}
                            placeholder="What's on your mind? (Enter to add)"
                            style={{
                                flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white'
                            }}
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
                            <Plus size={20} />
                        </button>
                    </form>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Added {inboxTasks.filter(t => new Date(t.createdAt) > new Date(Date.now() - 1000 * 60 * 5)).length} items in this session.
                    </div>
                </div>
            )
        },
        {
            id: 'process',
            title: 'Process Inbox',
            icon: ListTodo,
            description: 'Clarify your inputs. Is it actionable? If no, trash it. If yes, decide the next action.',
            actionLabel: 'Zero Inbox',
            color: '#3b82f6',
            stats: () => `${inboxTasks.length} items remaining`,
            renderContent: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {inboxTasks.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            Inbox is empty! Great job.
                        </div>
                    ) : (
                        inboxTasks.map(task => (
                            <div key={task.id} className="glass-panel" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                <span style={{ flex: 1, fontWeight: 500 }}>{task.title}</span>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="btn btn-ghost" title="Do (Move to Actions)" onClick={() => processInboxItem(task.id, 'do')} style={{ color: '#10b981' }}><CheckCircle2 size={16} /></button>
                                    <button className="btn btn-ghost" title="Defer (Tomorrow)" onClick={() => processInboxItem(task.id, 'defer')} style={{ color: '#f59e0b' }}><CalendarIcon size={16} /></button>
                                    <button className="btn btn-ghost" title="Delete" onClick={() => processInboxItem(task.id, 'delete')} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )
        },
        {
            id: 'review-calendar',
            title: 'Review Calendar',
            icon: CalendarIcon, // Changed icon for clarity
            description: 'Look at the upcoming week (Next 7 Days).',
            actionLabel: 'Check Schedule',
            color: '#f59e0b',
            renderContent: () => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const upcoming = tasks.filter(t => {
                    if (t.isArchived || t.status === 'done' || !t.dueDate) return false;
                    const dueDate = new Date(t.dueDate);
                    return dueDate >= new Date() && dueDate <= nextWeek;
                }).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                         {upcoming.length === 0 ? (
                            <div style={{ padding: '1rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No tasks scheduled for the next 7 days.</div>
                         ) : upcoming.map(task => (
                            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '0.8rem', color: '#f59e0b', width: '80px' }}>{new Date(task.dueDate).toLocaleDateString(undefined, {weekday: 'short', month:'short', day:'numeric'})}</div>
                                <div style={{ flex: 1 }}>{task.title}</div>
                            </div>
                         ))}
                    </div>
                )
            }
        },
        {
            id: 'review-mission',
            title: 'Review Mission & Goals',
            icon: Target,
            description: 'Ensure your ladder is leaning against the right wall.',
            actionLabel: 'Align Priorities',
            color: '#ec4899',
            renderContent: () => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Simplified Stats */}
                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                         <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ec4899' }}>{missions.length}</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Active Roles</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                         <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ec4899' }}>{Math.round((tasks.filter(t => !t.isArchived && t.missionId).length / tasks.filter(t => !t.isArchived).length) * 100) || 0}%</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Mission Alignment</div>
                    </div>
                </div>
            )
        },
        {
            id: 'cleanup',
            title: 'Clean Up & Archive',
            icon: Archive,
            description: 'Clear the decks for the new week.',
            actionLabel: 'Archive Completed',
            color: '#6366f1',
            renderContent: () => {
                const completedCount = tasks.filter(t => t.status === 'done' && !t.isArchived).length;
                 return (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        {completedCount > 0 ? (
                             <button className="btn btn-outline" onClick={() => {
                                 tasks.filter(t => t.status === 'done' && !t.isArchived).forEach(t => archiveTask(t.id));
                             }}>
                                Archive All {completedCount} Completed Tasks
                             </button>
                        ) : (
                            <div style={{ color: '#10b981' }}>All completed tasks are archived. Clean slate!</div>
                        )}
                    </div>
                )
            }
        }
    ];

    const markStepComplete = (stepId) => {
        if (!completedSteps.includes(stepId)) {
            setCompletedSteps([...completedSteps, stepId]);
        }
        if (currentStep < reviewSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            setExpandedStep(currentStep + 1);
        }
    };

    const toggleStep = (index) => {
        setExpandedStep(expandedStep === index ? -1 : index);
    };

    const progress = Math.round((completedSteps.length / reviewSteps.length) * 100);
    const isComplete = completedSteps.length === reviewSteps.length;

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                        }}>
                            <RefreshCcw size={28} style={{ color: '#c4b5fd' }} />
                        </div>
                        <div>
                            <h2 className="text-gradient-primary" style={{ fontSize: '2rem', margin: 0, lineHeight: 1.1 }}>Weekly Review</h2>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#cbd5e1', fontSize: '0.95rem' }}>
                                Clear your mind, process inputs, and review commitments.
                            </p>
                        </div>
                    </div>
                
                    {isComplete && (
                        <div style={{
                            padding: '0.75rem 1.25rem', background: 'rgba(16, 185, 129, 0.2)',
                            borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.9rem',
                            fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                            <CheckCircle2 size={20} /> Review Complete!
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{completedSteps.length}/{reviewSteps.length}</span>
                </div>
            </div>

            {/* Review Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviewSteps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isExpanded = expandedStep === index;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.id}
                            className="glass-panel"
                            style={{
                                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                                borderLeft: `4px solid ${isCompleted ? '#10b981' : step.color}`,
                                opacity: isCompleted && !isExpanded ? 0.6 : 1, // Dim if completed but not focussed
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {/* Step Header */}
                            <div
                                onClick={() => toggleStep(index)}
                                style={{
                                    padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                                    cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent'
                                }}
                            >
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                    background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : `${step.color}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {isCompleted ? <CheckCircle2 size={18} style={{ color: '#10b981' }} /> : <Icon size={18} style={{ color: step.color }} />}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '1rem', textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.7 : 1 }}>
                                        {step.title}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        {step.description}
                                    </div>
                                </div>
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>

                            {/* Step Content */}
                            {isExpanded && (
                                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ margin: '1rem 0' }}>
                                        {step.renderContent && step.renderContent()}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                                        <button
                                            onClick={() => markStepComplete(step.id)}
                                            className={`btn ${isCompleted ? 'btn-ghost' : 'btn-primary'}`}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            {isCompleted ? 'Completed' : `Mark as Done`} {isCompleted && <CheckCircle2 size={16}/>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
