import React from 'react';
import { History, X, Clock } from 'lucide-react';

export default function MissionHistoryModal({ mission, onClose }) {
    if (!mission) return null;

    const versions = mission.versions || [];

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
            <div className="glass-panel" style={{
                width: '500px',
                maxHeight: '70vh',
                padding: '0',
                borderRadius: 'var(--radius-lg)',
                background: '#1e293b',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <History size={18} style={{ color: '#6366f1' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Version History</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {versions.length} previous version{versions.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {/* Current Version */}
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        borderLeft: '3px solid #6366f1'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                CURRENT VERSION
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                {new Date(mission.updatedAt || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{mission.text}</p>
                    </div>

                    {/* Previous Versions */}
                    {versions.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'var(--color-text-muted)'
                        }}>
                            <Clock size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>No previous versions</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>
                                Edit your mission to create history
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{
                                fontSize: '0.8rem',
                                color: 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                                marginBottom: '0.25rem'
                            }}>
                                Previous Versions
                            </h4>
                            {versions.slice().reverse().map((version, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: '3px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            Version {versions.length - idx}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                            {new Date(version.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.85rem',
                                        lineHeight: 1.5,
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {version.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
