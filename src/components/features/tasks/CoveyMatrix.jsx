import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../../../context/TaskContext';
import { useMission } from '../../../context/MissionContext';
import TaskCard from './TaskCard';
import TaskDetailModal from './TaskDetailModal';
import QuickInboxModal from '../inbox/QuickInboxModal';
import ContextManagerModal from './ContextManagerModal';
import { Plus, X, LayoutGrid, List, Zap, Filter, Mic, Settings, Target, ChevronDown, Link2, CornerDownRight, Flame, Star } from 'lucide-react';
import useVoiceInput from '../../../hooks/useVoiceInput';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function CoveyMatrix() {
    const { tasks, addTask, contexts } = useTasks();
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeContextId, setActiveContextId] = useState('all');
    const [showQuickInbox, setShowQuickInbox] = useState(false);
    const [showContextManager, setShowContextManager] = useState(false);
    const [showContextDropdown, setShowContextDropdown] = useState(false);
    const [prefilledTitle, setPrefilledTitle] = useState(''); // For Quick Inbox capture selection
    const [selectedCaptureId, setSelectedCaptureId] = useState(null); // To track which capture is being converted
    const containerRef = useRef(null);

    // Handle capture selection from Quick Inbox
    const handleCaptureSelect = (captureTitle, captureId) => {
        setPrefilledTitle(captureTitle);
        setSelectedCaptureId(captureId); // Store the capture task ID
        setShowQuickInbox(false);
        setShowForm(true);
    };

    // Track which captures have been converted to tasks (local state, doesn't affect tasks array)
    const [convertedCaptureIds, setConvertedCaptureIds] = useState([]);

    // Handle task save - just add capture ID to converted list
    const handleTaskSave = (taskData) => {
        const captureId = selectedCaptureId;

        // Add the new task
        addTask(taskData);

        // If this was from a capture, add its ID to the converted list
        // This will filter it out from Quick Inbox display
        if (captureId) {
            setConvertedCaptureIds(prev => [...prev, captureId]);
        }

        // Clear the capture ID
        setSelectedCaptureId(null);
    };

    // Handle task selection with scroll focus
    const handleTaskSelection = (task) => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => setSelectedTask(task), 250);
    };

    // Filter Logic
    const isVisible = (t) => {
        if (t.isArchived) return false;
        if (t.isInbox) return false;

        // Context Filter
        if (activeContextId !== 'all') {
            const ctx = contexts.find(c => c.id === activeContextId);
            if (ctx && t.context !== ctx.name) return false;
        }

        if (t.status !== 'done') return true;
        const ONE_DAY = 24 * 60 * 60 * 1000;
        const completeTime = new Date(t.completedAt).getTime();
        return (Date.now() - completeTime) < ONE_DAY;
    };

    const visibleTasks = tasks.filter(isVisible).sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const q1 = visibleTasks.filter(t => t.urge && t.imp);
    const q2 = visibleTasks.filter(t => !t.urge && t.imp);
    const q3 = visibleTasks.filter(t => t.urge && !t.imp);
    const q4 = visibleTasks.filter(t => !t.urge && !t.imp);

    return (
        <div ref={containerRef} className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '1.0rem 1.5rem 1rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            overflow: 'visible'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Left: Title & Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h3
                            className="text-gradient-primary"
                            style={{ fontSize: '1.5rem', margin: 0, lineHeight: 1, cursor: 'pointer' }}
                            onClick={() => containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        >
                            Priorities Matrix
                        </h3>

                    </div>


                    {/* View Toggle & Context Filter Group */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

                        {/* View Toggle - Pill Style */}
                        <div style={{
                            background: '#0f172a',
                            padding: '0.2rem',
                            borderRadius: '10px',
                            display: 'flex',
                            border: '1px solid rgba(255,255,255,0.08)',
                            gap: '2px'
                        }}>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    background: viewMode === 'list' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                    color: 'white',
                                    opacity: viewMode === 'list' ? 1 : 0.5,
                                    border: 'none',
                                    padding: '0.4rem 0.6rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="List View"
                            >
                                <List size={16} strokeWidth={viewMode === 'list' ? 2.5 : 2} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    background: viewMode === 'grid' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                    color: 'white',
                                    opacity: viewMode === 'grid' ? 1 : 0.5,
                                    border: 'none',
                                    padding: '0.4rem 0.6rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Card View"
                            >
                                <LayoutGrid size={16} strokeWidth={viewMode === 'grid' ? 2.5 : 2} />
                            </button>
                        </div>

                        {/* Divider */}
                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>

                        {/* Context Filter - Custom Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowContextDropdown(!showContextDropdown)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    background: '#0f172a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    padding: '0.5rem 0.8rem',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '160px',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span><Filter size={14} /></span>
                                    <span style={{ whiteSpace: 'nowrap' }}>
                                        {activeContextId === 'all' ? 'All Contexts' : (() => {
                                            const ctx = contexts.find(c => c.id === activeContextId);
                                            return ctx ? <><span style={{ marginRight: '6px' }}>{ctx.icon}</span>{ctx.name}</> : 'Unknown';
                                        })()}
                                    </span>
                                </div>
                                <ChevronDown size={14} style={{ transform: showContextDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>

                            {/* Dropdown Menu */}
                            {showContextDropdown && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowContextDropdown(false)} />
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 6px)',
                                        left: 0,
                                        width: '240px',
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                                        zIndex: 50,
                                        padding: '0.5rem',
                                        animation: 'fadeIn 0.1s ease-out'
                                    }}>
                                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                            <button
                                                onClick={() => { setActiveContextId('all'); setShowContextDropdown(false); }}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '6px',
                                                    background: activeContextId === 'all' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                    color: activeContextId === 'all' ? '#818cf8' : 'white',
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
                                                <span>🌍</span> All Contexts
                                            </button>
                                            {contexts.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => { setActiveContextId(c.id); setShowContextDropdown(false); }}
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '0.5rem 0.75rem',
                                                        borderRadius: '6px',
                                                        background: activeContextId === c.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                        color: activeContextId === c.id ? '#818cf8' : 'white',
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
                                                    <span>{c.icon}</span> {c.name}
                                                </button>
                                            ))}
                                        </div>

                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

                                        <button
                                            onClick={() => {
                                                containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                // Close dropdown immediately, but maybe delay the modal slightly if desired,
                                                // though usually for modals immediate is fine. matching user request "sanki... tıklamışız gibi"
                                                setShowContextDropdown(false);
                                                setTimeout(() => setShowContextManager(true), 250);
                                            }}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '6px',
                                                background: 'transparent',
                                                color: '#94a3b8',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                fontSize: '0.85rem',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                        >
                                            <Settings size={14} /> Manage Contexts
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>


                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative', marginRight: '0.5rem' }}>


                    {/* Quick Inbox */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                setTimeout(() => setShowQuickInbox(true), 250);
                            }}
                            style={{
                                padding: '0.6rem 1.25rem 0.6rem 1.25rem',
                                fontSize: '0.95rem',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                border: '1px solid transparent',
                                lineHeight: '1.5',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                minWidth: '150px',
                                justifyContent: 'center',
                                background: '#0f172a',
                                color: 'white'
                            }}
                        >
                            <Zap size={20} color="#f59e0b" fill="#f59e0b" /> Quick Inbox
                        </button>
                        {showQuickInbox && <QuickInboxModal onClose={() => setShowQuickInbox(false)} onCaptureSelect={handleCaptureSelect} excludeIds={convertedCaptureIds} />}
                    </div>

                    {/* New Task */}
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            setTimeout(() => setShowForm(true), 250);
                        }}
                        style={{
                            padding: '0.6rem 1.25rem 0.6rem 1.25rem',
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                            border: '1px solid transparent',
                            lineHeight: '1.5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            minWidth: '150px',
                            justifyContent: 'flex-start',
                            background: '#0f172a',
                            color: 'white'
                        }}
                    >
                        <Plus size={22} color="#6366f1" strokeWidth={5} /> New Task
                    </button>
                </div>
            </div>

            {/* Matrix Grid - Always 2x2 for Matrix Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                paddingRight: '0.5rem'
            }}>
                <Quadrant id="q1" title="Urgent & Important" tasks={q1} color="var(--color-danger)" viewMode={viewMode} onTaskClick={handleTaskSelection} />
                <Quadrant id="q2" title="Important & Not Urgent" tasks={q2} color="var(--color-primary)" viewMode={viewMode} onTaskClick={handleTaskSelection} />
                <Quadrant id="q3" title="Urgent & Not Important" tasks={q3} color="var(--color-warning)" viewMode={viewMode} onTaskClick={handleTaskSelection} />
                <Quadrant id="q4" title="Not Urgent & Not Important" tasks={q4} color="var(--color-text-muted)" viewMode={viewMode} onTaskClick={handleTaskSelection} />
            </div>

            {showForm && (
                <TaskModal
                    onClose={() => {
                        setShowForm(false);
                        setPrefilledTitle(''); // Clear prefilled title
                        setSelectedCaptureId(null); // Clear selected capture ID
                    }}
                    onSave={handleTaskSave}
                    contexts={contexts}
                    initialTitle={prefilledTitle}
                />
            )}

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}

            {showContextManager && (
                <ContextManagerModal onClose={() => setShowContextManager(false)} />
            )}
        </div>
    );
}

function DraggableMatrixItem({ task, viewMode, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 999 : 'auto',
        height: 'auto'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} compact={viewMode === 'list'} onClick={onClick} />
        </div>
    );
}

function Quadrant({ id, title, tasks, color, viewMode, onTaskClick }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                background: isOver ? `rgba(255, 255, 255, 0.08)` : 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: isOver ? `0 0 20px ${color}20` : 'none',
                height: '280px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Color Strip Header */}
            <div style={{
                borderTop: `6px solid ${color}`,
                background: `linear-gradient(to bottom, ${color}15, transparent)`,
                padding: '0.75rem 1rem 0.5rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
            }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {title}
                </h4>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, background: 'rgba(0,0,0,0.2)', padding: '0.1rem 0.5rem', borderRadius: '12px', color: '#fff' }}>
                    {tasks.length}
                </span>
            </div>

            {/* Task Area - Dynamic Grid/List Layout */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.5rem 1rem 1rem 1rem',
                // DYNAMIC LAYOUT HERE
                display: viewMode === 'grid' ? 'grid' : 'flex',
                flexDirection: viewMode === 'list' ? 'column' : undefined,
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : undefined,
                gap: '0.5rem', // Reduced Gap
                alignItems: viewMode === 'list' ? 'stretch' : 'start',
                alignContent: 'start'
            }}>
                {tasks.map(t => (
                    <DraggableMatrixItem
                        key={t.id}
                        task={t}
                        viewMode={viewMode}
                        onClick={() => onTaskClick(t)}
                    />
                ))}

                {tasks.length === 0 && (
                    <div style={{
                        gridColumn: viewMode === 'grid' ? '1 / -1' : undefined,
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.1,
                        fontStyle: 'italic',
                        minHeight: '100px'
                    }}>
                        Empty
                    </div>
                )}
            </div>
        </div>
    );
}


function TaskModal({ onClose, onSave, contexts, initialTitle = '' }) {
    const { missions = [], getRootMissions, getSubMissions } = useMission();
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [form, setForm] = useState({
        title: initialTitle,
        urge: false,
        imp: false,
        dueDate: '',
        context: '@home',
        missionId: ''
    });


    const inputRef = useRef(null);
    const dateRef = useRef(null);


    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Update title if initialTitle changes (e.g., from Quick Inbox)
    useEffect(() => {
        if (initialTitle) {
            setForm(prev => ({ ...prev, title: initialTitle }));
        }
    }, [initialTitle]);

    const [showContextSelector, setShowContextSelector] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate all required fields
        if (!form.title || !form.missionId || !form.dueDate || !form.context) return;

        // Explicitly set isInbox: false and isArchived: false to ensure task is visible
        onSave({
            ...form,
            isInbox: false,
            isArchived: false
        });
        onClose();
    };

    // Check if form is valid (all required fields filled)
    const isFormValid = Boolean(form.title && form.missionId && form.dueDate && form.context);

    // Get selected role/submission text for display
    const getSelectedRoleText = () => {
        if (!form.missionId) return "No specific Link";
        const selected = missions.find(m => m.id === form.missionId);
        return selected ? selected.text : "Unknown Role";
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
            <style>
                {`
                    @keyframes slideUpFade {
                        from { opacity: 0; transform: translateY(20px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    input[type="date"]::-webkit-calendar-picker-indicator {
                        transform: scale(1.2);
                        cursor: pointer;
                    }
                `}
            </style>
            <div className="glass-panel" style={{
                width: '450px',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                background: '#1e293b',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                overflow: 'visible'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3>Add New Task</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Task Title</label>
                        <input
                            ref={inputRef}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white'
                            }}
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ flex: 1, padding: '0.6rem', border: `1px solid ${form.urge ? 'var(--color-danger)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center', background: form.urge ? 'rgba(239, 68, 68, 0.1)' : 'transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" checked={form.urge} onChange={e => setForm({ ...form, urge: e.target.checked })} style={{ display: 'none' }} />
                            Urgent <Flame size={16} fill={form.urge ? "currentColor" : "none"} />
                        </label>
                        <label style={{ flex: 1, padding: '0.6rem', border: `1px solid ${form.imp ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center', background: form.imp ? 'rgba(99, 102, 241, 0.1)' : 'transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" checked={form.imp} onChange={e => setForm({ ...form, imp: e.target.checked })} style={{ display: 'none' }} />
                            Important <Star size={16} fill={form.imp ? "currentColor" : "none"} />
                        </label>
                    </div>

                    {/* Submission Selector Button */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Link to Submission</label>
                        <button
                            type="button"
                            onClick={() => setShowRoleSelector(true)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                textAlign: 'left',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {getSelectedRoleText()}
                            </span>
                            <Link2 size={16} style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                        </button>
                    </div>

                    {/* Submission Selector Overlay */}
                    {showRoleSelector && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: '#1e293b',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.5rem',
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <button onClick={() => setShowRoleSelector(false)} className="btn btn-ghost" style={{ padding: '0.5rem' }}><X size={20} /></button>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Select a Submission</h3>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                                <button
                                    onClick={() => { setForm({ ...form, missionId: '' }); setShowRoleSelector(false); }}
                                    className="btn btn-ghost"
                                    style={{ justifyContent: 'flex-start', padding: '0.75rem', border: '1px dashed rgba(255,255,255,0.1)' }}
                                >
                                    No Specific Submission
                                </button>

                                {getRootMissions && getRootMissions().map(root => {
                                    const subs = getSubMissions ? getSubMissions(root.id) : [];
                                    return (
                                        <div key={root.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '1rem' }}>
                                            <div style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {root.text}
                                            </div>
                                            {subs.length > 0 ? subs.map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => { setForm({ ...form, missionId: sub.id }); setShowRoleSelector(false); }}
                                                    className="btn btn-ghost"
                                                    style={{
                                                        justifyContent: 'flex-start',
                                                        padding: '0.6rem 0.6rem 0.6rem 1.5rem',
                                                        fontSize: '0.9rem',
                                                        background: form.missionId === sub.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                        borderLeft: form.missionId === sub.id ? '2px solid var(--color-primary)' : '2px solid transparent'
                                                    }}
                                                >
                                                    🎯 {sub.text}
                                                </button>
                                            )) : (
                                                <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                                    No submissions defined yet
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Due Date</label>
                            <input
                                ref={dateRef}
                                type="date"
                                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer' }}
                                value={form.dueDate}
                                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                onClick={() => dateRef.current?.showPicker()}
                            />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Context</label>
                            <button
                                type="button"
                                onClick={() => setShowContextSelector(!showContextSelector)}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 2rem 0.6rem 0.6rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    minHeight: '42px'
                                }}
                            >
                                {contexts.find(c => c.name === form.context) ? (
                                    <>
                                        <span style={{ marginRight: '0.5rem' }}>{contexts.find(c => c.name === form.context).icon}</span>
                                        {form.context}
                                    </>
                                ) : (
                                    form.context
                                )}
                                <ChevronDown size={18} style={{ position: 'absolute', right: '10px', top: '50%', pointerEvents: 'none', transform: showContextSelector ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)', transition: 'transform 0.2s' }} />
                            </button>

                            {/* Dropdown Menu */}
                            {showContextSelector && (
                                <>
                                    {/* Invisible backdrop to close on click outside */}
                                    <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                        onClick={() => setShowContextSelector(false)}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '100%',
                                        marginTop: '0.5rem',
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 'var(--radius-md)',
                                        zIndex: 50,
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                        maxHeight: '160px',
                                        overflowY: 'auto',
                                        animation: 'fadeIn 0.1s ease-out'
                                    }}>
                                        {contexts.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => { setForm({ ...form, context: c.name }); setShowContextSelector(false); }}
                                                className="btn btn-ghost"
                                                style={{
                                                    width: '100%',
                                                    justifyContent: 'flex-start',
                                                    padding: '0.4rem 0.6rem',
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.6rem',
                                                    background: form.context === c.name ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                    color: form.context === c.name ? 'white' : 'var(--color-text-muted)',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                                                {c.name}
                                            </button>
                                        ))}
                                        {contexts.length === 0 && (
                                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                                No contexts found.
                                            </div>
                                        )}
                                    </div>

                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!isFormValid}
                        style={{
                            marginTop: '1rem',
                            opacity: isFormValid ? 1 : 0.5,
                            cursor: isFormValid ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Create Task
                    </button>
                </form >
            </div >
        </div >
    );
}
