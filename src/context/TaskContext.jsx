import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../services/api';
import { GoogleCalendarContext } from './GoogleCalendarContext';

const TaskContext = createContext();

const DEFAULT_CONTEXTS = [
    { id: 'c1', name: '@home', icon: '🏠' },
    { id: 'c2', name: '@work', icon: '💼' },
    { id: 'c3', name: '@computer', icon: '💻' },
    { id: 'c4', name: '@phone', icon: '📱' },
    { id: 'c5', name: '@errands', icon: '🚗' },
    { id: 'c6', name: '@waiting', icon: '⏳' },
    { id: 'c7', name: '@anywhere', icon: '🌍' }
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
                const adaptedTasks = tasksData.map(t => ({
                    ...t,
                    status: mapBackendStatusToFrontend(t.status),
                    urge: (t.priority === 'URGENT_IMPORTANT' || t.priority === 'URGENT_NOT_IMPORTANT'),
                    imp: (t.priority === 'URGENT_IMPORTANT' || t.priority === 'NOT_URGENT_IMPORTANT'),
                    missionId: t.subMissionId || null,
                    context: t.context || '@home',
                    isInbox: t.isInbox,
                    isArchived: t.isArchived,
                    completedAt: t.completedAt
                }));
                setTasks(adaptedTasks);

                // Fetch Contexts
                const contextsData = await api.get(`/contexts/user/${userId}`);
                if (contextsData && contextsData.length > 0) {
                    setContexts(contextsData);
                } else {
                    // EmptyDB -> Auto-seed defaults for better UX
                    console.log("No contexts found, seeding defaults...");
                    // We can re-use restoreContexts logic but we need access to it or duplicated logic.
                    // Since restoreContexts is defined below, we can't call it easily inside useEffect unless we move it or use a separate function.
                    // Let's just do it inline or define a helper outside.
                    // Actually, let's just use the restore logic here.

                    const newContexts = [];
                    for (const ctx of DEFAULT_CONTEXTS) {
                        try {
                            const newContext = await api.post(`/contexts?userId=${userId}`, { name: ctx.name, icon: ctx.icon });
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

        const newTaskPayload = {
            ...taskData,
            userId: parseInt(userId),
            status: 'NOT_STARTED',
            createdAt: new Date().toISOString(),
            timeSpent: 0,
            title: taskData.title,
            urgent: taskData.urge,
            important: taskData.imp,
            subMissionId: taskData.missionId,
            description: taskData.description || "",
            dueDate: formattedDate,
            context: taskData.context || '@home',
            isInbox: taskData.isInbox || false,
            isArchived: taskData.isArchived || false
        };

        try {
            const createdTask = await api.post('/tasks', newTaskPayload);
            const adaptedTask = {
                ...createdTask,
                status: mapBackendStatusToFrontend(createdTask.status),
                urge: (createdTask.priority === 'URGENT_IMPORTANT' || createdTask.priority === 'URGENT_NOT_IMPORTANT'),
                imp: (createdTask.priority === 'URGENT_IMPORTANT' || createdTask.priority === 'NOT_URGENT_IMPORTANT'),
                missionId: createdTask.subMissionId,
                context: createdTask.context,
                isInbox: createdTask.isInbox,
                isArchived: createdTask.isArchived,
                completedAt: createdTask.completedAt
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

            const payload = {
                ...merged,
                status: mapFrontendStatusToBackend(merged.status),
                subMissionId: merged.missionId,
                dueDate: formattedDate,
                context: merged.context,
                isInbox: merged.isInbox,
                isArchived: merged.isArchived,
                completedAt: merged.completedAt
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

    const addContext = async (name, icon = '🏷️') => {
        const userId = localStorage.getItem("sptm_userId");
        if (!userId) return;

        try {
            const newContext = await api.post(`/contexts?userId=${userId}`, { name, icon });
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

        // Add all defaults to DB
        for (const ctx of DEFAULT_CONTEXTS) {
            try {
                // Check if already exists? Too expensive. Just simplified:
                const newContext = await api.post(`/contexts?userId=${userId}`, { name: ctx.name, icon: ctx.icon });
                setContexts(prev => [...prev, newContext]);
            } catch (e) {
                console.error("Error restoring context", e);
            }
        }
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
            toggleTimer: (id) => { /* Timer logic local only for now unless we add endpoint */ }
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
