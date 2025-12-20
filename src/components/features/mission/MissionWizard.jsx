import React, { useState } from 'react';
import { useMission } from '../../../context/MissionContext';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

export default function MissionWizard({ onComplete }) {
    const { addMission, addVision, addValue } = useMission();
    const [step, setStep] = useState(1);
    const [data, setData] = useState({ values: '', vision: '', statement: '' });

    const handleNext = () => setStep(s => s + 1);

    const handleFinish = () => {
        // Save specific components as single items for now
        if (data.vision) addVision(data.vision);
        if (data.values) addValue(data.values);

        // Combine inputs if statement is empty, otherwise use the drafted statement
        const finalStatement = data.statement || `My mission is to live by my values of ${data.values} and achieve ${data.vision}.`;
        addMission(finalStatement);
        onComplete();
    };

    return (
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    <Sparkles size={32} />
                </div>
                <h2>Discover Your Mission</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Step {step} of 3</p>
            </div>

            {step === 1 && (
                <div className="animate-in">
                    <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 500 }}>
                        What are your core values?
                    </label>
                    <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                        Examples: Integrity, Innovation, Family, Freedom, Growth.
                    </p>
                    <textarea
                        className="input-area"
                        style={{ width: '100%', minHeight: '120px', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
                        placeholder="I value..."
                        value={data.values}
                        onChange={e => setData({ ...data, values: e.target.value })}
                        autoFocus
                    />
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleNext} disabled={!data.values}>
                            Next <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in">
                    <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 500 }}>
                        What is your long-term vision?
                    </label>
                    <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                        Where do you see yourself in 5 or 10 years? What impact do you want to make?
                    </p>
                    <textarea
                        className="input-area"
                        style={{ width: '100%', minHeight: '120px', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
                        placeholder="I aspire to..."
                        value={data.vision}
                        onChange={e => setData({ ...data, vision: e.target.value })}
                        autoFocus
                    />
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                        <button className="btn btn-primary" onClick={handleNext} disabled={!data.vision}>
                            Next <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-in">
                    <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 500 }}>
                        Craft your Mission Statement
                    </label>
                    <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                        Synthesize your values and vision into a clear, concise statement.
                    </p>
                    <textarea
                        className="input-area"
                        style={{ width: '100%', minHeight: '150px', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical', fontSize: '1.1rem' }}
                        value={data.statement}
                        onChange={e => setData({ ...data, statement: e.target.value })}
                        placeholder={`My mission is to... (Draft: Based on ${data.values} to achieve ${data.vision})`}
                        autoFocus
                    />
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                        <button className="btn btn-primary" style={{ background: 'var(--color-success)' }} onClick={handleFinish} disabled={!data.statement && (!data.values || !data.vision)}>
                            Create Mission <Check size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
