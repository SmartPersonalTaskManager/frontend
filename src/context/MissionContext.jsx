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
                isArchived: m.archived || false,
                completedAt: m.completedAt || null,
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
                        parentId: rootId, // Link to parent
                        isArchived: sub.archived || false,
                        completedAt: sub.completedAt || null,
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

    // Get all submissions for a mission
    const getSubmissionsForMission = (missionId) => {
        return missions.filter(m => m.parentId === missionId);
    };

    // Get realIds for a mission and all its submissions (for task cascade)
    const getSubmissionRealIdsForMission = (missionId) => {
        const subs = getSubmissionsForMission(missionId);
        return subs.map(s => s.realId);
    };

    const deleteMission = async (id, cascadeDeleteTasks = null) => {
        console.log('🗑️ Attempting to delete mission:', id);

        // Store original state for rollback
        const originalMissions = [...missions];

        // If it's a root mission, cascade to submissions and their tasks
        if (!id.toString().startsWith('submission-')) {
            const submissionRealIds = getSubmissionRealIdsForMission(id);
            const submissions = getSubmissionsForMission(id);

            // Cascade delete tasks if callback provided
            if (cascadeDeleteTasks && submissionRealIds.length > 0) {
                await cascadeDeleteTasks(submissionRealIds);
            }

            // Remove all submissions from state
            setMissions(prev => prev.filter(m => m.id !== id && m.parentId !== id));
        } else {
            // It's a submission - cascade delete its tasks
            const realId = parseInt(id.replace('submission-', ''));
            if (cascadeDeleteTasks) {
                await cascadeDeleteTasks([realId]);
            }
            setMissions(prev => prev.filter(m => m.id !== id));
        }

        try {
            if (id.toString().startsWith('submission-')) {
                const realId = id.replace('submission-', '');
                console.log('📡 Deleting submission from backend:', realId);
                await api.delete(`/missions/submissions/${realId}`);
                console.log('✅ Submission deleted successfully from backend');
            } else {
                const realId = id.toString().replace('mission-', '');
                console.log('📡 Deleting mission from backend:', realId);
                await api.delete(`/missions/${realId}`);
                console.log('✅ Mission deleted successfully from backend');
            }
        } catch (error) {
            console.error("❌ Failed to delete mission from backend:", error);
            // Rollback state on failure
            console.log('🔄 Rolling back state...');
            setMissions(originalMissions);
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

    // --- Archive Operations for Missions/SubMissions ---
    const archiveMission = async (id, cascadeArchiveTasks = null) => {
        const now = new Date().toISOString();

        // If it's a root mission, cascade to submissions and their tasks
        if (!id.toString().startsWith('submission-')) {
            const submissionRealIds = getSubmissionRealIdsForMission(id);
            const submissions = getSubmissionsForMission(id);

            // Cascade archive tasks if callback provided
            if (cascadeArchiveTasks && submissionRealIds.length > 0) {
                await cascadeArchiveTasks(submissionRealIds);
            }

            // Archive the mission and all its submissions
            setMissions(prev => prev.map(m => {
                if (m.id === id || m.parentId === id) {
                    return { ...m, isArchived: true, completedAt: now };
                }
                return m;
            }));

            // API calls for mission and submissions
            try {
                const realId = id.toString().replace('mission-', '');
                await api.put(`/missions/${realId}/archive`);
                // Archive all submissions on backend
                for (const sub of submissions) {
                    await api.put(`/missions/submissions/${sub.realId}/archive`);
                }
            } catch (error) {
                console.error("Failed to archive mission:", error);
            }
        } else {
            // It's a submission - cascade archive its tasks
            const realId = parseInt(id.replace('submission-', ''));
            if (cascadeArchiveTasks) {
                await cascadeArchiveTasks([realId]);
            }

            setMissions(prev => prev.map(m =>
                m.id === id ? { ...m, isArchived: true, completedAt: now } : m
            ));

            try {
                await api.put(`/missions/submissions/${realId}/archive`);
            } catch (error) {
                console.error("Failed to archive submission:", error);
            }
        }
    };

    const unarchiveMission = async (id, cascadeUnarchiveTasks = null) => {
        // If it's a root mission, cascade to submissions and their tasks
        if (!id.toString().startsWith('submission-')) {
            const submissionRealIds = getSubmissionRealIdsForMission(id);
            const submissions = getSubmissionsForMission(id);

            // Cascade unarchive tasks if callback provided
            if (cascadeUnarchiveTasks && submissionRealIds.length > 0) {
                await cascadeUnarchiveTasks(submissionRealIds);
            }

            // Unarchive the mission and all its submissions
            setMissions(prev => prev.map(m => {
                if (m.id === id || m.parentId === id) {
                    return { ...m, isArchived: false, completedAt: null };
                }
                return m;
            }));

            // API calls
            try {
                const realId = id.toString().replace('mission-', '');
                await api.put(`/missions/${realId}/unarchive`);
                for (const sub of submissions) {
                    await api.put(`/missions/submissions/${sub.realId}/unarchive`);
                }
            } catch (error) {
                console.error("Failed to unarchive mission:", error);
            }
        } else {
            // It's a submission - cascade unarchive its tasks
            const realId = parseInt(id.replace('submission-', ''));
            if (cascadeUnarchiveTasks) {
                await cascadeUnarchiveTasks([realId]);
            }

            setMissions(prev => prev.map(m =>
                m.id === id ? { ...m, isArchived: false, completedAt: null } : m
            ));

            try {
                await api.put(`/missions/submissions/${realId}/unarchive`);
            } catch (error) {
                console.error("Failed to unarchive submission:", error);
            }
        }
    };

    const deleteMissionPermanently = async (id, cascadeDeleteTasks = null) => {
        // If it's a root mission, cascade to submissions and their tasks
        if (!id.toString().startsWith('submission-')) {
            const submissionRealIds = getSubmissionRealIdsForMission(id);
            const submissions = getSubmissionsForMission(id);

            // Cascade delete tasks if callback provided
            if (cascadeDeleteTasks && submissionRealIds.length > 0) {
                await cascadeDeleteTasks(submissionRealIds);
            }

            // Remove mission and all its submissions from state
            setMissions(prev => prev.filter(m => m.id !== id && m.parentId !== id));

            // API calls - delete mission (backend should cascade delete submissions)
            try {
                const realId = id.toString().replace('mission-', '');
                await api.delete(`/missions/${realId}`);
            } catch (error) {
                console.error("Failed to delete mission permanently:", error);
            }
        } else {
            // It's a submission - cascade delete its tasks
            const realId = parseInt(id.replace('submission-', ''));
            if (cascadeDeleteTasks) {
                await cascadeDeleteTasks([realId]);
            }

            setMissions(prev => prev.filter(m => m.id !== id));

            try {
                await api.delete(`/missions/submissions/${realId}`);
            } catch (error) {
                console.error("Failed to delete submission permanently:", error);
            }
        }
    };

    return (
        <MissionContext.Provider value={{
            missions, addMission, updateMission, deleteMission, getRootMissions, getSubMissions,
            archiveMission, unarchiveMission, deleteMissionPermanently,
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
