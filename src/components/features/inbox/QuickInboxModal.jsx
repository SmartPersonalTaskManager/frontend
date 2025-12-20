import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../../../context/TaskContext';
import useVoiceInput from '../../../hooks/useVoiceInput';
import { Plus, Zap, Mic, Trash2, X } from 'lucide-react';

export default function QuickInboxModal({ onClose, onCaptureSelect, excludeIds = [] }) {
    const { tasks, addTask, deletePermanently } = useTasks();
    const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
    const [quickInput, setQuickInput] = useState('');
    const inputRef = useRef(null);

    // Get all inbox tasks (don't filter out converted ones, we'll style them differently)
    const inboxTasks = tasks.filter(t =>
        !t.isArchived &&
        t.status !== 'done' &&
        t.urge === undefined &&
        t.imp === undefined &&
        t.isInbox === true
    );

    // Reverse to show newest first
    const sortedInboxTasks = [...inboxTasks].reverse();

    // Check if a capture has been processed (converted to task)
    const isProcessed = (taskId) => excludeIds.includes(taskId);

    const handleQuickAdd = (e) => {
        e.preventDefault();
        if (!quickInput.trim()) return;

        addTask({
            title: quickInput,
            isInbox: true,
            urge: undefined,
            imp: undefined,
            context: '@inbox',
            dueDate: ''
        });
        setQuickInput('');
        resetTranscript();
    };

    const handleCaptureClick = (task) => {
        // Pass the task title and ID to parent and close
        if (onCaptureSelect) {
            onCaptureSelect(task.title, task.id);
        }
        onClose();
    };

    // Auto-fill transcript
    useEffect(() => {
        if (transcript && isListening) {
            setQuickInput(transcript);
        }
    }, [transcript, isListening]);

    // Auto-focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div className="glass-panel" style={{
                width: '500px',
                maxHeight: '70vh',
                background: '#1e293b',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                        <Zap size={20} />
                        <span>Quick Inbox</span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                        className="hover-text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Input */}
                <div style={{ padding: '1.5rem' }}>
                    <form onSubmit={handleQuickAdd} style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={isListening ? transcript : quickInput}
                                onChange={(e) => setQuickInput(e.target.value)}
                                placeholder={isListening ? "Listening..." : "Capture..."}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    paddingRight: '2.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${isListening ? 'var(--color-danger)' : 'rgba(255,255,255,0.1)'}`,
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={isListening ? stopListening : startListening}
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: isListening ? 'var(--color-danger)' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex'
                                }}
                            >
                                <Mic size={16} className={isListening ? 'pulse' : ''} />
                            </button>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1rem' }} disabled={!quickInput.trim() && !isListening}>
                            <Plus size={18} />
                        </button>
                    </form>
                </div>

                {/* List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {sortedInboxTasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.6 }}>
                            Inbox empty
                        </div>
                    ) : (
                        sortedInboxTasks.map(task => {
                            const processed = isProcessed(task.id);
                            return (
                                <div
                                    key={task.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        background: processed ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: processed ? '2px solid rgba(34, 197, 94, 0.6)' : '2px solid rgba(168, 85, 247, 0.4)',
                                        cursor: processed ? 'default' : 'pointer',
                                        opacity: processed ? 0.6 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                    className={processed ? '' : 'hover-bg-highlight'}
                                    onClick={() => !processed && handleCaptureClick(task)}
                                >
                                    <span style={{
                                        fontSize: '0.95rem',
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        marginRight: '0.75rem',
                                        textDecoration: processed ? 'line-through' : 'none',
                                        color: processed ? 'var(--color-text-muted)' : 'inherit'
                                    }}>
                                        {task.title}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deletePermanently(task.id);
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', opacity: processed ? 1 : 0.4, cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = processed ? 1 : 0.4}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
