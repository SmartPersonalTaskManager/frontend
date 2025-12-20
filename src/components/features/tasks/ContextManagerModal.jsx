import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../../../context/TaskContext';
import { X, Plus, Trash2, RotateCcw } from 'lucide-react';

const ICON_OPTIONS = [
    '🏷️', '🏠', '💼', '💻', '📱', '🚗', '⏳', '🌍',
    '⚡', '🔥', '⭐', '📅', '🛒', '🎨', '🔧', '🧸',
    '💊', '🎓', '✈️', '🎵', '🏋️', '🍎', '💡', '📚',
    '🏃', '🍽️', '🐶', '🎥', '🎮', '⚓'
];

export default function ContextManagerModal({ onClose }) {
    const { contexts, addContext, deleteContext, restoreContexts } = useTasks();
    const [newContextName, setNewContextName] = useState('');
    const [newContextIcon, setNewContextIcon] = useState('🏷️');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'restore' } or { type: 'delete', id: '...' }
    const pickerRef = useRef(null);

    // Close picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowIconPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newContextName.trim()) return;
        let name = newContextName.trim();
        if (!name.startsWith('@')) name = '@' + name;

        addContext(name, newContextIcon);
        setNewContextName('');
        setShowIconPicker(false);
    };

    const handleConfirm = () => {
        if (!confirmAction) return;

        if (confirmAction.type === 'restore') {
            restoreContexts();
        } else if (confirmAction.type === 'delete') {
            deleteContext(confirmAction.id);
        }
        setConfirmAction(null);
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
        }}>
            <div className="glass-panel" style={{ width: '400px', padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: '#1e293b', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '85vh', position: 'relative' }}>

                {/* Confirmation Overlay */}
                {confirmAction && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        zIndex: 10,
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '50px', height: '50px', borderRadius: '50%',
                            background: confirmAction.type === 'restore' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                            color: confirmAction.type === 'restore' ? '#ef4444' : '#eab308',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
                        }}>
                            {confirmAction.type === 'restore' ? <RotateCcw size={24} /> : <Trash2 size={24} />}
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                            {confirmAction.type === 'restore' ? 'Restore Defaults?' : 'Delete Context?'}
                        </h4>
                        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                            {confirmAction.type === 'restore'
                                ? 'This will replace your current context list with the default set.'
                                : 'Are you sure you want to delete this context?'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="btn btn-ghost"
                                style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    background: confirmAction.type === 'restore' ? '#ef4444' : '#eab308',
                                    border: 'none',
                                    color: confirmAction.type === 'restore' ? 'white' : 'black'
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Manage Contexts</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7 }}><X size={20} /></button>
                </div>

                {/* Add Form */}
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '50px' }} ref={pickerRef}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Icon</span>
                        <button
                            type="button"
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            style={{
                                width: '100%',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                lineHeight: 1,
                                padding: 0
                            }}
                        >
                            {newContextIcon}
                        </button>

                        {/* Icon Picker Dropdown */}
                        {showIconPicker && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                width: '340px',
                                background: '#1e293b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(6, 1fr)',
                                gap: '0.5rem',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                zIndex: 10
                            }}>
                                {ICON_OPTIONS.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => { setNewContextIcon(icon); setShowIconPicker(false); }}
                                        style={{
                                            background: newContextIcon === icon ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                            border: newContextIcon === icon ? '1px solid rgba(99, 102, 241, 0.5)' : 'none',
                                            borderRadius: '4px',
                                            padding: '0.4rem',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = newContextIcon === icon ? 'rgba(99, 102, 241, 0.2)' : 'transparent'}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Name</span>
                        <input
                            style={{ width: '100%', height: '40px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                            value={newContextName}
                            onChange={e => setNewContextName(e.target.value)}
                            placeholder="@newcontext"
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 0.75rem', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={!newContextName.trim()}><Plus size={18} /></button>
                    </div>
                </form>

                {/* List */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem', minHeight: '200px' }}>
                    {contexts.length === 0 ? <span className="text-muted text-center text-sm">No custom contexts yet.</span> : null}
                    {contexts.map(ctx => (
                        <div key={ctx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>{ctx.icon}</span>
                                <span>{ctx.name}</span>
                            </span>
                            <button
                                onClick={() => setConfirmAction({ type: 'delete', id: ctx.id })}
                                style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer', display: 'flex', padding: '0.25rem' }}
                                title="Delete"
                                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Restore Defaults */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={() => setConfirmAction({ type: 'restore' })}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--color-text-muted)',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                    >
                        <RotateCcw size={12} />
                        Restore Defaults
                    </button>
                </div>
            </div>
        </div>
    );
}
