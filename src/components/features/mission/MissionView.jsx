import React, { useState, createContext, useContext, useEffect } from 'react';
import { useMission } from '../../../context/MissionContext';
import { useTasks } from '../../../context/TaskContext';
import MissionWizard from './MissionWizard';
import MissionHistoryModal from './MissionHistoryModal';
import { Plus, Edit2, Trash2, Check, X, Compass, Target, Heart, Clock, AlertCircle, MoreVertical } from 'lucide-react';
import { createPortal } from 'react-dom';

const ToastContext = createContext();

function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {toast && createPortal(
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    zIndex: 9999,
                    backdropFilter: 'blur(8px)',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxWidth: '90vw',
                    fontSize: '0.9rem',
                    fontWeight: 500
                }}>
                    <AlertCircle size={20} />
                    {toast.message}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}

function useToast() {
    return useContext(ToastContext);
}

export default function MissionView() {
    const {
        missions = [], addMission,
        visions = [], addVision, updateVision, deleteVision,
        values = [], addValue, updateValue, deleteValue,
        getRootMissions
    } = useMission();

    // Safety check for array methods
    const safeVisions = Array.isArray(visions) ? visions : [];
    const safeValues = Array.isArray(values) ? values : [];

    const rootMissions = getRootMissions();

    // If no data at all, show wizard
    const hasData = rootMissions.length > 0 || safeVisions.length > 0 || safeValues.length > 0;

    if (!hasData) {
        return <MissionWizard onComplete={() => { }} />;
    }

    return (
        <ToastProvider>
            <MissionViewContent
                rootMissions={rootMissions}
                safeVisions={safeVisions}
                safeValues={safeValues}
                addMission={addMission}
                addValue={addValue}
                updateValue={updateValue}
                deleteValue={deleteValue}
                addVision={addVision}
                updateVision={updateVision}
                deleteVision={deleteVision}
            />
        </ToastProvider>
    );
}

function MissionViewContent({
    rootMissions, safeVisions, safeValues,
    addMission, addValue, updateValue, deleteValue, addVision, updateVision, deleteVision
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0' }}>

            {/* 1. HERO: Personal Mission Statement */}
            {/* 1. HERO: Mission Statement Content */}
            {/* 1. HERO: Personal Mission Statement */}
            <section className="glass-panel" style={{
                padding: '0',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Mission Container Header */}
                <div style={{
                    padding: '1rem',
                    background: 'rgba(129, 140, 248, 0.2)', // Increased opacity for better visibility
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', margin: 0 }}>
                        <Target size={20} style={{ color: '#818cf8' }} />
                        <span>Personal Mission</span>
                    </h3>
                    <button
                        className="btn btn-ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            addMission('New Mission');
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                        title="Create New Mission"
                    >
                        <Plus size={20} color="white" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Mission Content */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {rootMissions.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>
                            <Target size={48} style={{ opacity: 0.2, marginBottom: '1rem', marginInline: 'auto' }} />
                            <h3 style={{ marginBottom: '1rem' }}>Define Your Mission</h3>
                            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>What is your ultimate objective?</p>
                            <button className="btn btn-primary" onClick={() => addMission('My Mission is...')}>Create Mission Statement</button>
                        </div>
                    ) : (
                        rootMissions.map(mission => (
                            <MissionCard key={mission.id} mission={mission} isRoot />
                        ))
                    )}
                </div>
            </section>

            {/* 2. COMPASS: Values & Vision */}
            <section>
                {/* Core Values */}
                <ListSection
                    title="Core Values"
                    icon={<Heart size={20} style={{ color: '#ef4444' }} />}
                    items={safeValues}
                    onAdd={addValue}
                    onUpdate={updateValue}
                    onDelete={deleteValue}
                    placeholder="Add a core value..."
                    emptyMessage="What principles guide you?"
                    accentColor="rgba(239, 68, 68, 0.1)"
                />
            </section>


        </div>
    );
}

function ListSection({ title, icon, items = [], onAdd, onUpdate, onDelete, placeholder, emptyMessage, accentColor = 'rgba(255,255,255,0.05)' }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newItemText, setNewItemText] = useState('');

    const showToast = useToast();

    const handleAdd = () => {
        if (newItemText.length > 100) {
            showToast("Character limit exceeded! Max 100 characters allowed.");
            return;
        }
        if (newItemText.trim()) {
            onAdd(newItemText);
            setNewItemText('');
            setIsAdding(false);
        }
    };

    return (
        <div className="glass-panel" style={{
            padding: '0',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '1rem',
                background: accentColor,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', margin: 0 }}>
                    {icon} {title}
                </h3>
                <button
                    className="btn btn-ghost"
                    onClick={() => setIsAdding(true)}
                    style={{ background: 'rgba(255,255,255,0.1)', width: '28px', height: '28px', padding: 0, borderRadius: '50%' }}
                    title="Add Item"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.length === 0 && !isAdding && (
                    <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        {emptyMessage}
                    </div>
                )}

                {items.map(item => (
                    <ListItem key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
                ))}

                {isAdding && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            autoFocus
                            type="text"
                            value={newItemText}
                            onChange={e => setNewItemText(e.target.value)}
                            placeholder={placeholder}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        />
                        <button className="btn btn-ghost success" onClick={handleAdd}><Check size={16} /></button>
                        <button className="btn btn-ghost danger" onClick={() => setIsAdding(false)}><X size={16} /></button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ListItem({ item, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [text, setText] = useState(item.text);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const showToast = useToast();

    const handleSave = () => {
        if (text.length > 100) {
            showToast("Character limit exceeded! Max 100 characters allowed.");
            return;
        }
        onUpdate(item.id, text);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                    autoFocus
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
                <button className="btn btn-ghost success" onClick={handleSave}><Check size={16} /></button>
                <button className="btn btn-ghost danger" onClick={() => setIsEditing(false)}><X size={16} /></button>
            </div>
        );
    }

    return (
        <>
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <span style={{ flex: 1, marginRight: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{item.text}</span>
                <div style={{ display: 'flex', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
                    <button className="btn btn-ghost" onClick={() => setIsEditing(true)} style={{ padding: '0.25rem' }}><Edit2 size={14} /></button>
                    <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(true)} style={{ padding: '0.25rem', color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
                </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && createPortal(
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowDeleteConfirm(false)}>
                    <div style={{
                        background: '#1e293b',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        maxWidth: '350px',
                        width: '90%',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: '#ef4444' }}>Delete Value?</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Delete "<strong style={{ color: '#fff' }}>{item.text}</strong>"?
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(item.id);
                                    setShowDeleteConfirm(false);
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#ef4444',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

function MissionCard({ mission, isRoot }) {
    const { updateMission, deleteMission, addMission, getSubMissions } = useMission();
    const { tasks } = useTasks();
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingChild, setIsAddingChild] = useState(false);
    const [newRoleText, setNewRoleText] = useState('');
    const [editText, setEditText] = useState(mission.text);
    const [isHovered, setIsHovered] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const subMissions = getSubMissions(mission.id);

    const showToast = useToast();

    const handleSave = () => {
        if (editText.length > 100) {
            showToast("Character limit exceeded! Max 100 characters allowed.");
            return;
        }
        updateMission(mission.id, editText);
        setIsEditing(false);
    };

    const handleAddChild = () => {
        if (newRoleText.length > 100) {
            showToast("Character limit exceeded! Max 100 characters allowed.");
            return;
        }
        if (newRoleText.trim()) {
            addMission(newRoleText, mission.id);
            setNewRoleText('');
            setIsAddingChild(false);
        }
    };

    // Progress for this specific mission node
    const linkedTasks = tasks.filter(t => t.missionId === mission.id);
    const total = linkedTasks.length;
    const completed = linkedTasks.filter(t => t.status === 'done').length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (!isRoot) {
        // Render as a Role Card
        return (
            <div
                className="glass-panel"
                style={{
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    position: 'relative', // For menu positioning
                    cursor: 'pointer',
                    transition: 'transform 0.2s, background 0.2s'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setShowDetailModal(true)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{mission.text}</div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                        <span>Progress</span>
                        <span>{completed}/{total}</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s' }} />
                    </div>
                </div>



                {/* Detail Modal */}
                {
                    showDetailModal && createPortal(
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999
                        }} onClick={() => setShowDetailModal(false)}>
                            <div onClick={e => e.stopPropagation()} style={{
                                background: '#1e293b',
                                padding: '2rem',
                                borderRadius: '16px',
                                maxWidth: '600px',
                                width: '90%',
                                maxHeight: '80vh',
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}>
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Submission Details</div>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white', lineHeight: 1.3 }}>{mission.text}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => setShowEditModal(true)}
                                            title="Edit Submission"
                                            style={{ color: '#94a3b8' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            title="Delete Submission"
                                            style={{ color: '#ef4444' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#94a3b8' }}>Progress</span>
                                        <span style={{ color: 'white', fontWeight: 600 }}>{Math.round(pct)}% ({completed}/{total} tasks)</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s' }} />
                                    </div>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', minHeight: '100px' }}>
                                    <h4 style={{ fontSize: '1rem', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        Linked Tasks <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>{linkedTasks.length}</span>
                                    </h4>

                                    {linkedTasks.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontStyle: 'italic', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                            No linked tasks yet.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {linkedTasks.map(task => (
                                                <div key={task.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        border: `2px solid ${task.status === 'done' ? '#22c55e' : '#64748b'}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        {task.status === 'done' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />}
                                                    </div>
                                                    <span style={{
                                                        color: task.status === 'done' ? '#94a3b8' : 'white',
                                                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                                        flex: 1
                                                    }}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="btn btn-primary"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )
                }

                {/* Edit Submission Modal - Duplicate for Child Card */}
                {
                    showEditModal && createPortal(
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999
                        }} onClick={() => setShowEditModal(false)}>
                            <div onClick={e => e.stopPropagation()} style={{
                                background: '#1e293b',
                                padding: '2rem',
                                borderRadius: '16px',
                                maxWidth: '500px',
                                width: '90%',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Edit Submission</h3>
                                </div>

                                <textarea
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        padding: '1rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        marginBottom: '1.5rem',
                                        resize: 'vertical'
                                    }}
                                />

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            background: 'transparent',
                                            color: '#94a3b8',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleSave();
                                            setShowEditModal(false);
                                        }}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )
                }

                {/* Delete Confirmation Modal - Duplicate for Child Card */}
                {
                    showDeleteConfirm && createPortal(
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999
                        }} onClick={() => setShowDeleteConfirm(false)}>
                            <div onClick={e => e.stopPropagation()} style={{
                                background: '#1e293b',
                                padding: '2rem',
                                borderRadius: '16px',
                                maxWidth: '400px',
                                width: '90%',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ef4444' }}>Delete {isRoot ? 'Mission' : 'Submission'}?</h3>
                                </div>
                                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                    Are you sure you want to delete <strong style={{ color: '#fff' }}>"{mission.text}"</strong>?
                                    {subMissions.length > 0 && <><br /><br /><strong style={{ color: '#ef4444' }}>Warning:</strong> This will also delete {subMissions.length} submission{subMissions.length > 1 ? 's' : ''}.</>}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            background: 'transparent',
                                            color: '#94a3b8',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            deleteMission(mission.id);
                                            setShowDeleteConfirm(false);
                                        }}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        Yes, Delete
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )
                }
            </div >
        );
    }

    // Root Mission Card
    return (
        <div
            className="glass-panel"
            style={{
                padding: '0.75rem 1rem 1rem 1rem',
                borderRadius: 'var(--radius-lg)',
                borderLeft: '4px solid var(--color-primary)',
                background: 'linear-gradient(to right, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.4))'
            }}
        >
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    {isEditing ? (
                        <div>
                            <textarea
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                style={{ width: '100%', minHeight: '100px', padding: '1rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', fontSize: '1.2rem', fontFamily: 'inherit' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button className="btn btn-primary" onClick={handleSave}>Save Mission</button>
                                <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>Ultimate Objective</div>
                            <div style={{
                                fontSize: '1.4rem',
                                lineHeight: 1.3,
                                fontWeight: 700,
                                letterSpacing: '-0.5px',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word'
                            }}>
                                {mission.text}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', flexShrink: 0 }}>
                    <button className="btn btn-ghost" onClick={() => setIsEditing(true)} title="Edit Mission">
                        <Edit2 size={18} />
                    </button>
                    <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(true)} title="Delete Mission" style={{ color: '#ef4444' }}>
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Submissions Grid */}
            <div style={{
                marginTop: '0.1rem',
                paddingTop: '0.25rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Submissions</h4>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setIsAddingChild(true)}
                        style={{
                            padding: '0.25rem',
                            height: '24px',
                            width: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)'
                        }}
                        title="Add Submission"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {isAddingChild && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                        <input
                            autoFocus
                            type="text"
                            value={newRoleText}
                            onChange={e => setNewRoleText(e.target.value)}
                            placeholder="Enter Submission (e.g. Complete project report)"
                            style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                            onKeyDown={e => e.key === 'Enter' && handleAddChild()}
                        />
                        <button className="btn btn-primary" onClick={handleAddChild} size="sm">Add</button>
                        <button className="btn btn-ghost" onClick={() => setIsAddingChild(false)} size="sm"><X size={14} /></button>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {subMissions.map(sub => (
                        <MissionCard key={sub.id} mission={sub} isRoot={false} />
                    ))}
                </div>

                {subMissions.length === 0 && !isAddingChild && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                        No submissions defined yet. Click + to add.
                    </div>
                )}
            </div>

            {/* Edit Submission Modal */}
            {showEditModal && createPortal(
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }} onClick={() => setShowEditModal(false)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#1e293b',
                        padding: '2rem',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '90%',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Edit Submission</h3>
                        </div>

                        <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                marginBottom: '1.5rem',
                                resize: 'vertical'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleSave();
                                    setShowEditModal(false);
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && createPortal(
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#1e293b',
                        padding: '2rem',
                        borderRadius: '16px',
                        maxWidth: '400px',
                        width: '90%',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ef4444' }}>Delete {isRoot ? 'Mission' : 'Submission'}?</h3>
                        </div>
                        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            Are you sure you want to delete <strong style={{ color: '#fff' }}>"{mission.text}"</strong>?
                            {subMissions.length > 0 && <><br /><br /><strong style={{ color: '#ef4444' }}>Warning:</strong> This will also delete {subMissions.length} submission{subMissions.length > 1 ? 's' : ''}.</>}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteMission(mission.id);
                                    setShowDeleteConfirm(false);
                                }}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    background: '#ef4444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

function MissionProgressSection({ values, visions }) {
    const { tasks } = useTasks();

    const renderProgress = (item) => {
        const linkedTasks = tasks.filter(t => t.missionId === item.id);
        const total = linkedTasks.length;
        const completed = linkedTasks.filter(t => t.status === 'done').length;
        const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

        if (total === 0) return null;

        return (
            <div key={item.id} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0, marginRight: '1rem' }}>{item.text}</span>
                    <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>{completed}/{total}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s' }} />
                </div>
            </div>
        );
    };

    const hasAnyProgress = [...values, ...visions].some(i => tasks.some(t => t.missionId === i.id));

    if (!hasAnyProgress) return null;

    return (
        <section className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                <Target size={18} className="text-primary" /> Active Pursuit
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Values in Action</h4>
                    {values.map(renderProgress)}
                    {values.every(v => !tasks.some(t => t.missionId === v.id)) && <div className="text-muted italic" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No tasks linked to values yet.</div>}
                </div>
                <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Vision Progress</h4>
                    {visions.map(renderProgress)}
                    {visions.every(v => !tasks.some(t => t.missionId === v.id)) && <div className="text-muted italic" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No tasks linked to vision yet.</div>}
                </div>
            </div>
        </section>
    );
}
