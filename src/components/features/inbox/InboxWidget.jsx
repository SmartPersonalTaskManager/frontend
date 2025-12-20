import React, { useState } from 'react';
import { useTasks } from '../../../context/TaskContext';
import { Inbox, Plus, ArrowRight, Zap, Mic, Trash2 } from 'lucide-react';
import useVoiceInput from '../../../hooks/useVoiceInput';
import { useEffect } from 'react';

export default function InboxWidget() {
    const { tasks, addTask, updateTask, deletePermanently } = useTasks();
    const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
    const [quickInput, setQuickInput] = useState('');
    const [showProcess, setShowProcess] = useState(null);

    // Inbox tasks are those without urgency/importance set yet
    const inboxTasks = tasks.filter(t =>
        !t.isArchived &&
        t.status !== 'done' &&
        t.urge === undefined &&
        t.imp === undefined &&
        t.isInbox === true
    );

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

    const processTask = (taskId, urge, imp) => {
        updateTask(taskId, {
            urge,
            imp,
            isInbox: false,
            context: '@home' // Default context after processing
        });
        setShowProcess(null);
    };

    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.1)'
                }}>
                    <Inbox size={24} style={{ color: '#d8b4fe' }} />
                </div>
                <div>
                    <h3 className="text-gradient-primary" style={{ fontSize: '1.5rem', margin: 0, lineHeight: 1 }}>GTD Inbox</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
                        {inboxTasks.length} item{inboxTasks.length !== 1 ? 's' : ''} to process
                    </p>
                </div>
            </div>

            {/* Quick Capture Input */}
            <form onSubmit={handleQuickAdd} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            value={isListening ? transcript : quickInput}
                            onChange={(e) => setQuickInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Quick capture... press Enter (or Mic)"}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                paddingRight: '2.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: `1px solid ${isListening ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
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
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            title="Voice Input"
                        >
                            <Mic size={18} className={isListening ? 'pulse' : ''} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '0.75rem' }}
                    >
                        <Plus size={18} />
                    </button>
                </div>
                {useEffect(() => {
                    if (transcript && isListening) {
                        setQuickInput(transcript);
                    }
                }, [transcript, isListening])}
            </form>

            {/* Inbox Items */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {inboxTasks.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        color: 'var(--color-text-muted)',
                        textAlign: 'center'
                    }}>
                        <Zap size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '0.85rem' }}>Inbox is empty! 🎉</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Capture ideas above</span>
                    </div>
                ) : (
                    inboxTasks.map(task => (
                        <DraggableInboxItem 
                            key={task.id} 
                            task={task} 
                            deletePermanently={deletePermanently} 
                        />
                    ))
                )}
            </div>
        </div>
    );
}

// Draggable Item Component
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function DraggableInboxItem({ task, deletePermanently }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });
    const [isHovered, setIsHovered] = useState(false);

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1, // Completely hide original when dragging
        touchAction: 'none', // Required for PointerSensor
        cursor: isDragging ? 'grabbing' : 'grab' // Indicate draggable
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                padding: '0.75rem 1rem',
                background: isDragging ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                borderLeft: '3px solid rgba(168, 85, 247, 0.5)',
                transition: 'background 0.2s',
                marginBottom: '0.5rem',
                position: 'relative'
            }}
             {...attributes} 
             {...listeners}
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
        >
             <span style={{ fontSize: '0.9rem', flex: 1, pointerEvents: 'none' }}>{task.title}</span>

            <div 
                style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    alignItems: 'center',
                    opacity: isHovered || isDragging ? 1 : 0, // Show on hover or drag
                    transition: 'opacity 0.2s ease-in-out',
                    pointerEvents: isHovered ? 'auto' : 'none'
                }} 
                onPointerDown={e => e.stopPropagation()}
            >
                <button
                    onClick={() => deletePermanently(task.id)}
                    className="btn btn-ghost"
                    style={{ padding: '0.3rem', color: 'var(--color-text-muted)', opacity: 0.7 }}
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
