import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { GoogleCalendarContext } from './GoogleCalendarContext';

const MissionContext = createContext();



export function MissionProvider({ children }) {
    const [missions, setMissions] = useState([]);
    const { isAuthenticated } = useContext(GoogleCalendarContext);

    const cleanString = (str) => {
        if (!str) return "";
        // Remove surrounding quotes if they exist
        let cleaned = str.replace(/^"|"$/g, '');
        // Unescape newlines
        cleaned = cleaned.replace(/\\n/g, '\n');
        return cleaned.trim();
    };

    const [visions, setVisions] = useState([]);
    const [values, setValues] = useState([]);

    const processMissionsData = (data) => {
        const flatMissions = [];
        data.forEach(m => {
            const rootId = `mission-${m.id}`;
            // Add Root
            flatMissions.push({
                ...m,
                id: rootId,
                realId: m.id,
                type: 'mission',
                text: cleanString(m.content),
                parentId: null, // Root
            });

            // Add Children
            if (m.subMissions && Array.isArray(m.subMissions)) {
                m.subMissions.forEach(sub => {
                    flatMissions.push({
                        ...sub,
                        id: `submission-${sub.id}`,
                        realId: sub.id,
                        type: 'submission',
                        text: cleanString(sub.title),
                        parentId: rootId // Link to parent
                    });
                });
            }
        });
        return flatMissions;
    };

    // Fetch All Data
    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem("sptm_userId");
            if (!userId) {
                // Clear state on logout
                setMissions([]);
                setVisions([]);
                setValues([]);
                return;
            }

            try {
                // Fetch Missions
                const missionsData = await api.get(`/missions/user/${userId}`);
                const flatMissions = processMissionsData(missionsData);
                setMissions(flatMissions);

                // Fetch Visions
                const visionsData = await api.get(`/visions/user/${userId}`);
                setVisions(visionsData);

                // Fetch Core Values
                const valuesData = await api.get(`/core-values/user/${userId}`);
                setValues(valuesData);

            } catch (error) {
                console.error("Failed to fetch mission data:", error);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    // --- Missions ---
    const addMission = async (text, parentId = null) => {
        const userId = localStorage.getItem("sptm_userId");
        if (!userId) return;

        try {
            if (parentId) {
                // Ensure we have the real ID
                const realParentId = parentId.toString().startsWith('mission-')
                    ? parentId.replace('mission-', '')
                    : parentId;

                const payload = {
                    title: text,
                    description: "",
                    parentId: parseInt(realParentId)
                };
                const newSub = await api.post(`/missions/${realParentId}/submissions`, payload);

                // Optimistic update - add to state without re-fetch
                // CRITICAL: Must include id, realId, and type for proper task linking
                const formattedSub = {
                    ...newSub,
                    id: `submission-${newSub.id}`,
                    realId: newSub.id,
                    type: 'submission',
                    text: newSub.title || text,
                    parentId: parentId
                };
                setMissions(prev => [...prev, formattedSub]);
                return formattedSub;
            } else {
                const newMission = await api.post(`/missions?userId=${userId}`, text);

                // Optimistic update - add to state without re-fetch
                // CRITICAL: Must include id, realId, and type for consistency
                const formattedMission = {
                    ...newMission,
                    id: `mission-${newMission.id}`,
                    realId: newMission.id,
                    type: 'mission',
                    text: cleanString(newMission.content || text),
                    parentId: null
                };
                setMissions(prev => [...prev, formattedMission]);
                return formattedMission;
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
            if (id.toString().startsWith('submission-')) {
                // Is a SubMission
                const realId = id.replace('submission-', '');
                await api.put(`/missions/submissions/${realId}`, newText);
            } else {
                // Is a Root Mission
                const realId = id.toString().replace('mission-', '');
                await api.put(`/missions/${realId}`, newText);
            }
        } catch (error) {
            console.error("Failed to update mission:", error);
            // Revert todo?
        }
    };

    const deleteMission = async (id) => {
        // Optimistic Delete
        setMissions(prev => prev.filter(m => m.id !== id));

        try {
            if (id.toString().startsWith('submission-')) {
                // Is a SubMission
                const realId = id.replace('submission-', '');
                await api.delete(`/missions/submissions/${realId}`);
            } else {
                // Is a Root Mission
                const realId = id.toString().replace('mission-', '');
                await api.delete(`/missions/${realId}`);
            }
        } catch (error) {
            console.error("Failed to delete mission:", error);
            // Revert todo?
        }
    };

    const getRootMissions = () => missions.filter(m => !m.parentId);
    const getSubMissions = (parentId) => missions.filter(m => m.parentId === parentId);

    // --- Visions ---
    const addVision = async (text) => {
        const userId = localStorage.getItem("sptm_userId");
        if (!userId) return;
        try {
            const newVision = await api.post(`/visions?userId=${userId}`, { text });
            setVisions(prev => [...prev, newVision]);
        } catch (error) {
            console.error("Failed to add vision:", error);
        }
    };
    const updateVision = async (id, text) => {
        setVisions(prev => prev.map(v => v.id === id ? { ...v, text } : v));
        try {
            await api.put(`/visions/${id}`, { text });
        } catch (error) {
            console.error("Failed to update vision:", error);
        }
    };
    const deleteVision = async (id) => {
        setVisions(prev => prev.filter(v => v.id !== id));
        try {
            await api.delete(`/visions/${id}`);
        } catch (error) {
            console.error("Failed to delete vision:", error);
        }
    };

    // --- Values ---
    const addValue = async (text) => {
        const userId = localStorage.getItem("sptm_userId");
        if (!userId) {
            console.warn("addValue: No userId found");
            return null;
        }
        try {
            console.log(`Adding value: "${text}" for user ${userId}`);
            const newValue = await api.post(`/core-values?userId=${userId}`, { text });
            console.log("Value added:", newValue);
            setValues(prev => [...prev, newValue]);
            return newValue;
        } catch (error) {
            console.error("Failed to add value:", error);
            return null;
        }
    };
    const updateValue = async (id, text) => {
        setValues(prev => prev.map(v => v.id === id ? { ...v, text } : v));
        try {
            await api.put(`/core-values/${id}`, { text });
        } catch (error) {
            console.error("Failed to update value:", error);
        }
    };
    const deleteValue = async (id) => {
        setValues(prev => prev.filter(v => v.id !== id));
        try {
            await api.delete(`/core-values/${id}`);
        } catch (error) {
            console.error("Failed to delete value:", error);
        }
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
