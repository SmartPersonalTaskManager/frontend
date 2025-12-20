import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Still using for values/visions for now or fully remove if we want full strictness
import { api } from '../services/api';

const MissionContext = createContext();

const DEMO_MISSIONS = [
    { id: 'm1', text: "To lead a life centered on integrity and empathy, inspiring others to grow.", parentId: null, createdAt: new Date().toISOString(), versions: [] },
    { id: 'm2', text: "To innovate relentlessly and solve complex problems with elegant simplicity.", parentId: null, createdAt: new Date().toISOString(), versions: [] },
    { id: 'm3', text: "To cultivate deep connections and maintain a harmonious work-life balance.", parentId: null, createdAt: new Date().toISOString(), versions: [] }
];

const DEMO_VALUES = [
    { id: 'v1', text: "Integrity & Honesty" },
    { id: 'v2', text: "Continuous Growth" },
    { id: 'v3', text: "Empathy & Respect" }
];

export function MissionProvider({ children }) {
    const [missions, setMissions] = useState([]);
    const cleanString = (str) => {
        if (!str) return "";
        // Remove surrounding quotes if they exist
        let cleaned = str.replace(/^"|"$/g, '');
        // Unescape newlines
        cleaned = cleaned.replace(/\\n/g, '\n');
        return cleaned.trim();
    };

    const [visions, setVisions] = useLocalStorage('sptm_visions_v2', []); // Keeping local for now as no Controller seen for Vision
    const [values, setValues] = useLocalStorage('sptm_core_values_v2', DEMO_VALUES); // Keeping local for now as no Controller seen for Values

    const processMissionsData = (data) => {
        const flatMissions = [];
        data.forEach(m => {
            // Add Root
            flatMissions.push({
                ...m,
                text: cleanString(m.content),
                parentId: null, // Root
            });

            // Add Children
            if (m.subMissions && Array.isArray(m.subMissions)) {
                m.subMissions.forEach(sub => {
                    flatMissions.push({
                        ...sub,
                        text: cleanString(sub.title),
                        parentId: m.id // Link to parent
                    });
                });
            }
        });
        return flatMissions;
    };

    // Fetch Missions
    useEffect(() => {
        const fetchMissions = async () => {
            const userId = localStorage.getItem("sptm_userId");
            if (!userId) return;

            try {
                const data = await api.get(`/missions/user/${userId}`);
                const flatMissions = processMissionsData(data);
                setMissions(flatMissions);
            } catch (error) {
                console.error("Failed to fetch missions:", error);
            }
        };

        fetchMissions();
    }, []);

    // --- Missions ---
    const addMission = async (text, parentId = null) => {
        const userId = localStorage.getItem("sptm_userId");
        if (!userId) return;

        try {
            if (parentId) {
                const payload = {
                    title: text,
                    description: "",
                    parentId: parentId
                };
                const newSub = await api.post(`/missions/${parentId}/submissions`, payload);

                // Re-fetch and process correctly
                const data = await api.get(`/missions/user/${userId}`);
                const flatMissions = processMissionsData(data);
                setMissions(flatMissions);
                return newSub;
            } else {
                const newMission = await api.post(`/missions?userId=${userId}`, text);

                // Re-fetch to ensure consistency and clean formatting
                const data = await api.get(`/missions/user/${userId}`);
                const flatMissions = processMissionsData(data);
                setMissions(flatMissions);
                return newMission;
            }
        } catch (error) {
            console.error("Failed to add mission:", error);
        }
    };

    const updateMission = async (id, newText) => {
        // Optimistic Update
        setMissions(prev => prev.map(m => {
            if (m.id === id) {
                return { ...m, text: newText };
            }
            return m;
        }));

        try {
            // API Call
            await api.put(`/missions/${id}`, newText);
        } catch (error) {
            console.error("Failed to update mission:", error);
            // Revert todo?
        }
    };

    const deleteMission = async (id) => {
        // Find mission to determine type (Root or Sub)
        const missionToDelete = missions.find(m => m.id === id);
        if (!missionToDelete) return;

        // Optimistic Delete
        setMissions(prev => prev.filter(m => m.id !== id));

        try {
            if (missionToDelete.parentId) {
                // Is a SubMission
                await api.delete(`/missions/submissions/${id}`);
            } else {
                // Is a Root Mission
                await api.delete(`/missions/${id}`);
            }
        } catch (error) {
            console.error("Failed to delete mission:", error);
            // Revert todo?
        }
    };

    const getRootMissions = () => missions.filter(m => !m.parentId);
    const getSubMissions = (parentId) => missions.filter(m => m.parentId === parentId);

    // --- Visions ---
    const addVision = (text) => {
        const newVision = { id: crypto.randomUUID(), text };
        setVisions(prev => [...prev, newVision]);
    };
    const updateVision = (id, text) => {
        setVisions(prev => prev.map(v => v.id === id ? { ...v, text } : v));
    };
    const deleteVision = (id) => {
        setVisions(prev => prev.filter(v => v.id !== id));
    };

    // --- Values ---
    const addValue = (text) => {
        const newValue = { id: crypto.randomUUID(), text };
        setValues(prev => [...prev, newValue]);
    };
    const updateValue = (id, text) => {
        setValues(prev => prev.map(v => v.id === id ? { ...v, text } : v));
    };
    const deleteValue = (id) => {
        setValues(prev => prev.filter(v => v.id !== id));
    };

    return (
        <MissionContext.Provider value={{
            missions, addMission, updateMission, deleteMission, getRootMissions, getSubMissions,
            visions, addVision, updateVision, deleteVision,
            values, addValue, updateValue, deleteValue
        }}>
            {children}
        </MissionContext.Provider>
    );
}

export function useMission() {
    const context = useContext(MissionContext);
    if (!context) {
        throw new Error('useMission must be used within a MissionProvider');
    }
    return context;
}
