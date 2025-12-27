import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../services/api';
import { GoogleCalendarContext } from './GoogleCalendarContext';

const TaskContext = createContext();

const DEFAULT_CONTEXTS = [
    { id: 'c1', name: '@home' },
    { id: 'c2', name: '@work' },
    { id: 'c3', name: '@computer' },
    { id: 'c4', name: '@phone' },
    { id: 'c5', name: '@errands' },
    { id: 'c6', name: '@waiting' },
    { id: 'c7', name: '@anywhere' }
];

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [contexts, setContexts] = useState([]); // Removed useLocalStorage
    const [loading, setLoading] = useState(false);

    // Access auth state from GoogleCalendarContext
    const { isAuthenticated } = useContext(GoogleCalendarContext);

    const mapBackendStatusToFrontend = (status) => {
        if (status === 'COMPLETED') return 'done';
        return 'todo';
    };

    const mapFrontendStatusToBackend = (status) => {
        if (status === 'done') return 'COMPLETED';
        return 'NOT_STARTED';
    };

    // Helper to separate Description and Checklist
    const parseTaskDescription = (rawDescription) => {
        if (!rawDescription) return { description: "", checklist: [] };
        if (rawDescription.includes('|||CHECKLIST|||')) {
            const parts = rawDescription.split('|||CHECKLIST|||');
            try {
                return {
                    description: parts[0],
                    checklist: JSON.parse(parts[1])
                };
            } catch (e) {
                return { description: parts[0], checklist: [] };
            }
        }
        return { description: rawDescription, checklist: [] };
    };

    const serializeTaskDescription = (description, checklist) => {
        const cleanDesc = description || "";
        const cleanChecklist = checklist && Array.isArray(checklist) ? JSON.stringify(checklist) : "[]";
        return `${cleanDesc}|||CHECKLIST|||${cleanChecklist}`;
    };

    // Fetch Tasks and Contexts on Load and when Authentication changes
    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem("sptm_userId");
            if (!userId) {
                setTasks([]);
                setContexts([]);
                return;
            }

            try {
                setLoading(true);
                // Fetch Tasks
                const tasksData = await api.get(`/tasks/user/${userId}`);
                const adaptedTasks = tasksData.map(t => {
                    const { description, checklist } = parseTaskDescription(t.description);
                    return {
                        ...t,
                        status: mapBackendStatusToFrontend(t.status),
                        urge: (t.priority === 'URGENT_IMPORTANT' || t.priority === 'URGENT_NOT_IMPORTANT'),
                        imp: (t.priority === 'URGENT_IMPORTANT' || t.priority === 'NOT_URGENT_IMPORTANT'),
                        missionId: t.subMissionId || null,
                        context: t.context || '@home',
                        isInbox: t.isInbox,
                        isArchived: t.isArchived,
                        completedAt: t.completedAt,
                        description: description,
                        checklist: checklist
                    };
                });
                setTasks(adaptedTasks);

                // Fetch Contexts
                const contextsData = await api.get(`/contexts/user/${userId}`);
                if (contextsData && contextsData.length > 0) {
                    setContexts(contextsData);
                } else {
                    const newContexts = [];
                    for (const ctx of DEFAULT_CONTEXTS) {
                        try {
                            const newContext = await api.post(`/contexts?userId=${userId}`, { name: ctx.name });
                            newContexts.push(newContext);
                        } catch (e) {
                            console.error("Error seeding context", e);
                        }
                    }
                    setContexts(newContexts);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    const addTask = async (taskData) => {
        const userId = localStorage.getItem("sptm_userId");
        if (!userId) {
            console.error("No user ID found, cannot create task");
            return;
        }

        let formattedDate = taskData.dueDate;
        if (formattedDate && !formattedDate.includes('T')) {
            formattedDate = `${formattedDate}T00:00:00`;
        }

        const serializedDescription = serializeTaskDescription(taskData.description, taskData.checklist);

        // Handle composite IDs for subMissionId
        let finalSubMissionId = null;
        if (taskData.missionId) {
            const mIdStr = String(taskData.missionId);
            if (mIdStr.startsWith('submission-')) {
                finalSubMissionId = parseInt(mIdStr.replace('submission-', ''));
            } else if (!mIdStr.startsWith('mission-') && !isNaN(mIdStr)) {
                // Determine if it was legacy number
                finalSubMissionId = parseInt(mIdStr);
            }
            // If it starts with 'mission-', it's a root mission. The backend Task model currently
            // only supports linking to SubMissions. So we send null to prevent 400 Error.
        }

        const newTaskPayload = {
            ...taskData,
            userId: parseInt(userId),
            status: 'NOT_STARTED',
            createdAt: new Date().toISOString(),
            timeSpent: 0,
            title: taskData.title,
            urgent: taskData.urge,
            important: taskData.imp,
            subMissionId: finalSubMissionId,
            description: serializedDescription,
            dueDate: formattedDate,
            context: taskData.context || '@home',
            isInbox: taskData.isInbox || false,
            isArchived: taskData.isArchived || false
        };

        try {
            const createdTask = await api.post('/tasks', newTaskPayload);
            const { description, checklist } = parseTaskDescription(createdTask.description);
            const adaptedTask = {
                ...createdTask,
                status: mapBackendStatusToFrontend(createdTask.status),
                urge: (createdTask.priority === 'URGENT_IMPORTANT' || createdTask.priority === 'URGENT_NOT_IMPORTANT'),
                imp: (createdTask.priority === 'URGENT_IMPORTANT' || createdTask.priority === 'NOT_URGENT_IMPORTANT'),
                missionId: createdTask.subMissionId, // Keep backend ID for now, or could map to composite
                context: createdTask.context,
                isInbox: createdTask.isInbox,
                isArchived: createdTask.isArchived,
                completedAt: createdTask.completedAt,
                description: description,
                checklist: checklist
            };
            setTasks(prev => [...prev, adaptedTask]);
            return adaptedTask;
        } catch (error) {
            console.error("Failed to create task:", error);
        }
    };

    const updateTask = async (id, updates) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        try {
            const currentTask = tasks.find(t => t.id === id);
            if (!currentTask) return;

            const merged = { ...currentTask, ...updates };

            let formattedDate = merged.dueDate;
            if (formattedDate && !formattedDate.includes('T')) {
                formattedDate = `${formattedDate}T00:00:00`;
            }

            const serializedDescription = serializeTaskDescription(merged.description, merged.checklist);

            // Handle composite IDs for subMissionId
            let finalSubMissionId = null;
            if (merged.missionId) {
                const mIdStr = String(merged.missionId);
                if (mIdStr.startsWith('submission-')) {
                    finalSubMissionId = parseInt(mIdStr.replace('submission-', ''));
                } else if (!mIdStr.startsWith('mission-') && !isNaN(mIdStr)) {
                    finalSubMissionId = parseInt(mIdStr);
                }
            }

            const payload = {
                ...merged,
                status: mapFrontendStatusToBackend(merged.status),
                subMissionId: finalSubMissionId,
                dueDate: formattedDate,
                context: merged.context,
                isInbox: merged.isInbox,
                isArchived: merged.isArchived,
                completedAt: merged.completedAt,
                description: serializedDescription
            };

            await api.put(`/tasks/${id}`, payload);
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };

    const deleteTask = async (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        try {
            await api.delete(`/tasks/${id}`);
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    const toggleTaskStatus = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const isNowDone = task.status !== 'done';
        const updates = {
            status: isNowDone ? 'done' : 'todo',
            completedAt: isNowDone ? new Date().toISOString() : null
        };

        await updateTask(id, updates);
    };

    const archiveTask = async (id) => {
        const updates = {
            isArchived: true,
            completedAt: new Date().toISOString()
        };
        await updateTask(id, updates);
    };

    const unarchiveTask = async (id) => {
        await updateTask(id, { isArchived: false, status: 'todo', completedAt: null });
    };

    const deletePermanently = deleteTask;

    // Cascade operations for Mission/Submission archive/delete
    const cascadeArchiveTasksBySubmissionIds = async (submissionRealIds) => {
        const tasksToArchive = tasks.filter(t => submissionRealIds.includes(t.missionId));
        const now = new Date().toISOString();

        // Optimistic update
        setTasks(prev => prev.map(t =>
            submissionRealIds.includes(t.missionId)
                ? { ...t, isArchived: true, completedAt: t.completedAt || now }
                : t
        ));

        // API calls
        for (const task of tasksToArchive) {
            try {
                await api.put(`/tasks/${task.id}`, {
                    ...task,
                    status: mapFrontendStatusToBackend(task.status),
                    isArchived: true,
                    completedAt: task.completedAt || now
                });
            } catch (error) {
                console.error(`Failed to archive task ${task.id}:`, error);
            }
        }
    };

    const cascadeUnarchiveTasksBySubmissionIds = async (submissionRealIds) => {
        const tasksToUnarchive = tasks.filter(t => submissionRealIds.includes(t.missionId) && t.isArchived);

        // Optimistic update
        setTasks(prev => prev.map(t =>
            submissionRealIds.includes(t.missionId)
                ? { ...t, isArchived: false }
                : t
        ));

        // API calls
        for (const task of tasksToUnarchive) {
            try {
                await api.put(`/tasks/${task.id}`, {
                    ...task,
                    status: mapFrontendStatusToBackend(task.status),
                    isArchived: false
                });
            } catch (error) {
                console.error(`Failed to unarchive task ${task.id}:`, error);
            }
        }
    };

    const cascadeDeleteTasksBySubmissionIds = async (submissionRealIds) => {
        const tasksToDelete = tasks.filter(t => submissionRealIds.includes(t.missionId));

        // Optimistic update
        setTasks(prev => prev.filter(t => !submissionRealIds.includes(t.missionId)));

        // API calls
        for (const task of tasksToDelete) {
            try {
                await api.delete(`/tasks/${task.id}`);
            } catch (error) {
                console.error(`Failed to delete task ${task.id}:`, error);
            }
        }
    };

    const addContext = async (name) => {
        const userId = localStorage.getItem("sptm_userId");
        if (!userId) return;

        try {
            const newContext = await api.post(`/contexts?userId=${userId}`, { name });
            setContexts(prev => [...prev, newContext]);
        } catch (error) {
            console.error("Failed to add context:", error);
        }
    };

    const deleteContext = async (id) => {
        setContexts(prev => prev.filter(c => c.id !== id));
        try {
            await api.delete(`/contexts/${id}`);
        } catch (error) {
            console.error("Failed to delete context:", error);
        }
    };

    const restoreContexts = async () => {
        const userId = localStorage.getItem("sptm_userId");
        if (!userId) return;

        // First, delete all existing contexts
        for (const ctx of contexts) {
            try {
                await api.delete(`/contexts/${ctx.id}`);
            } catch (e) {
                console.error("Error deleting context during restore", e);
            }
        }

        // Clear local state
        setContexts([]);

        // Add all defaults to DB
        const newContexts = [];
        for (const ctx of DEFAULT_CONTEXTS) {
            try {
                const newContext = await api.post(`/contexts?userId=${userId}`, { name: ctx.name });
                newContexts.push(newContext);
            } catch (e) {
                console.error("Error restoring context", e);
            }
        }
        setContexts(newContexts);
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            contexts,
            loading,
            addTask,
            updateTask,
            deleteTask: archiveTask, // Keep alias behavior: 'delete' in UI means archive usually
            archiveTask,
            unarchiveTask,
            deletePermanently, // Actual API delete
            toggleTaskStatus,
            addContext,
            deleteContext,
            restoreContexts,
            toggleTimer: (id) => { /* Timer logic local only for now unless we add endpoint */ },
            // Cascade functions for Mission/Submission operations
            cascadeArchiveTasksBySubmissionIds,
            cascadeUnarchiveTasksBySubmissionIds,
            cascadeDeleteTasksBySubmissionIds
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
