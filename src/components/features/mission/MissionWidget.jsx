import React, { useState } from 'react';
import { useMission } from '../../../context/MissionContext';
import { ChevronLeft, ChevronRight, Target, Heart } from 'lucide-react';

export default function MissionWidget({ collapsed }) {
    const { getRootMissions, values = [] } = useMission();
    const missions = getRootMissions();

    const [missionIndex, setMissionIndex] = useState(0);
    const [valueIndex, setValueIndex] = useState(0);

    const nextMission = () => {
        if (missions.length === 0) return;
        setMissionIndex((prev) => (prev + 1) % missions.length);
    };
    const prevMission = () => {
        if (missions.length === 0) return;
        setMissionIndex((prev) => (prev - 1 + missions.length) % missions.length);
    };

    const nextValue = () => {
        if (values.length === 0) return;
        setValueIndex((prev) => (prev + 1) % values.length);
    };
    const prevValue = () => {
        if (values.length === 0) return;
        setValueIndex((prev) => (prev - 1 + values.length) % values.length);
    };

    if (collapsed) {
        return (
            <div className="glass-panel" style={{
                padding: '0.75rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '2rem',
                borderRadius: 'var(--radius-lg)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: 0 }}>
                    <Target size={18} color="#a5b4fc" />
                    <span style={{ fontSize: '0.85rem', color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.05em' }}>MISSION</span>
                    <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: '0.5rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {missions.length > 0
                            ? (missions[missionIndex]?.text.length > 100 ? missions[missionIndex]?.text.substring(0, 100) + '...' : missions[missionIndex]?.text)
                            : "Define your mission"}
                    </span>
                </div>

                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: 0 }}>
                    <Heart size={18} color="#f472b6" />
                    <span style={{ fontSize: '0.85rem', color: '#f472b6', fontWeight: 700, letterSpacing: '0.05em' }}>VALUE</span>
                    <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: '0.5rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {values.length > 0
                            ? (values[valueIndex]?.text.length > 100 ? values[valueIndex]?.text.substring(0, 100) + '...' : values[valueIndex]?.text)
                            : "Define your core values"}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0' }}>
            <CarouselCard
                title="MISSION"
                content={missions.length > 0 ? missions[missionIndex]?.text : "Define your mission"}
                onNext={nextMission}
                onPrev={prevMission}
                hasData={missions.length > 0}
                icon={<Target size={14} />}
                count={missions.length}
                currentIndex={missionIndex}
                accentColor="#818cf8" // Soft Indigo
            />
            <CarouselCard
                title="VALUE"
                content={values.length > 0 ? values[valueIndex]?.text : "Define your core values"}
                onNext={nextValue}
                onPrev={prevValue}
                hasData={values.length > 0}
                icon={<Heart size={14} />}
                count={values.length}
                currentIndex={valueIndex}
                accentColor="#f472b6" // Soft Rose
            />
        </div>
    );
}

function CarouselCard({ title, content, onNext, onPrev, hasData, icon, count, currentIndex, accentColor }) {
    return (
        <div className="glass-panel" style={{
            padding: '1.25rem 1rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            minHeight: '130px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            {/* Header with Accent Color */}
            <div style={{
                position: 'absolute',
                top: '0.75rem',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                color: accentColor, // Applied Accent Color
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                opacity: 0.9,
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' // Slight glow for elegance
            }}>
                {React.cloneElement(icon, { color: accentColor })} {title}
            </div>

            {/* Content */}
            <div style={{
                padding: '0 3rem',
                fontSize: content.length > 60 ? '1.1rem' : '1.35rem',
                fontWeight: 600,
                color: '#fff',
                lineHeight: 1.5,
                marginTop: '0.5rem',
                fontFamily: 'var(--font-heading, inherit)',
                opacity: hasData ? 1 : 0.5,
                fontStyle: hasData ? 'normal' : 'italic',
                maxWidth: '100%',
                wordWrap: 'break-word',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)' // Subtle depth
            }}>
                {content}
            </div>

            {/* Controls */}
            {hasData && count > 1 && (
                <>
                    <button
                        onClick={onPrev}
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '0.75rem',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                            opacity: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.opacity = 0.5; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <ChevronLeft size={24} strokeWidth={1.5} />
                    </button>

                    <button
                        onClick={onNext}
                        style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '0.75rem',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                            opacity: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.opacity = 0.5; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <ChevronRight size={24} strokeWidth={1.5} />
                    </button>

                    {/* Pagination Indicators with Accent */}
                    <div style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.4rem'
                    }}>
                        {Array.from({ length: count }).map((_, i) => (
                            <div key={i} style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: i === currentIndex ? accentColor : 'rgba(255,255,255,0.2)', // Active dot uses accent
                                boxShadow: i === currentIndex ? `0 0 5px ${accentColor}` : 'none',
                                transition: 'all 0.3s'
                            }} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
