import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api } from '../services/api';

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
    const [contexts, setContexts] = useLocalStorage('sptm_contexts_v1', DEFAULT_CONTEXTS); // Contexts still local for now, or can be moved to backend if Entity exists
    const [loading, setLoading] = useState(false);

    const mapBackendStatusToFrontend = (status) => {
        if (status === 'COMPLETED') return 'done';
        return 'todo';
    };

    const mapFrontendStatusToBackend = (status) => {
        if (status === 'done') return 'COMPLETED';
        return 'NOT_STARTED';
    };

    // Fetch Tasks on Load
    useEffect(() => {
        const fetchTasks = async () => {
            const userId = localStorage.getItem("sptm_userId");
            if (!userId) return;

            try {
                setLoading(true);
                const data = await api.get(`/tasks/user/${userId}`);
                // Adapter: Backend DTO -> Frontend
                const adaptedTasks = data.map(t => ({
                    ...t,
                    status: mapBackendStatusToFrontend(t.status),
                    urge: (t.priority === 'URGENT_IMPORTANT' || t.priority === 'URGENT_NOT_IMPORTANT'),
                    imp: (t.priority === 'URGENT_IMPORTANT' || t.priority === 'NOT_URGENT_IMPORTANT'),
                    missionId: t.subMissionId || null,
                    // Persist backend fields
                    context: t.context || '@home', // Default if missing
                    isInbox: t.isInbox,
                    isArchived: t.isArchived,
                    completedAt: t.completedAt
                }));
                setTasks(adaptedTasks);
            } catch (error) {
                console.error("Failed to fetch tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const addTask = async (taskData) => {
        const userId = localStorage.getItem("sptm_userId");
        if (!userId) {
            console.error("No user ID found, cannot create task");
            return;
        }

        // Format date to ISO-like string compatible with LocalDateTime (YYYY-MM-DDTHH:mm:ss)
        // input[type="date"] returns YYYY-MM-DD. We append T00:00:00 to imply start of day local time.
        let formattedDate = taskData.dueDate;
        if (formattedDate && !formattedDate.includes('T')) {
            formattedDate = `${formattedDate}T00:00:00`;
        }

        const newTaskPayload = {
            ...taskData,
            userId: parseInt(userId),
            status: 'NOT_STARTED', // Backend enum compatible
            createdAt: new Date().toISOString(),
            timeSpent: 0,
            title: taskData.title,
            urgent: taskData.urge,
            important: taskData.imp,
            subMissionId: taskData.missionId,
            description: taskData.description || "",
            dueDate: formattedDate,
            // New fields
            context: taskData.context || '@home',
            isInbox: taskData.isInbox || false,
            isArchived: taskData.isArchived || false
        };

        try {
            const createdTask = await api.post('/tasks', newTaskPayload);
            // Adapt response back for state
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
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        try {
            const currentTask = tasks.find(t => t.id === id);
            if (!currentTask) return;

            console.log('updateTask - currentTask:', currentTask);
            console.log('updateTask - updates:', updates);

            // Merge and adapt for backend
            const merged = { ...currentTask, ...updates };
            console.log('updateTask - merged:', merged);

            // Format date if it was updated
            let formattedDate = merged.dueDate;
            if (formattedDate && !formattedDate.includes('T')) {
                formattedDate = `${formattedDate}T00:00:00`;
            }

            const payload = {
                ...merged,
                status: mapFrontendStatusToBackend(merged.status),
                subMissionId: merged.missionId,
                dueDate: formattedDate,
                // Ensure extended fields are sent
                context: merged.context,
                isInbox: merged.isInbox,
                isArchived: merged.isArchived,
                completedAt: merged.completedAt
                // Priority is updated by backend if urge/imp changed, or we can send priority enum if we wanted.
                // But DTO has urgent/important fields which service uses.
                // If we only updated status, urge/imp might be missing from 'updates'.
                // 'merged' has them.
                // We need to ensure 'urgent' and 'important' are sent as booleans if we want to support editing them seamlessly.
            };

            console.log('Updating task with payload:', payload);
            console.log('isArchived:', payload.isArchived, 'completedAt:', payload.completedAt);
            const response = await api.put(`/tasks/${id}`, payload);
            console.log('Update response:', response);
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };

    const deleteTask = async (id) => {
        // Optimistic delete
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

    // Alias for backward compatibility
    const archiveTask = async (id) => {
        console.log('archiveTask called for id:', id);
        const updates = {
            isArchived: true,
            completedAt: new Date().toISOString()
        };
        console.log('archiveTask updates:', updates);
        await updateTask(id, updates);
    };

    const unarchiveTask = async (id) => {
        await updateTask(id, { isArchived: false, status: 'todo', completedAt: null });
    };

    const deletePermanently = deleteTask;

    const addContext = (name, icon = '🏷️') => {
        const newContext = { id: crypto.randomUUID(), name, icon };
        setContexts(prev => [...prev, newContext]);
    };

    const deleteContext = (id) => {
        setContexts(prev => prev.filter(c => c.id !== id));
    };

    const restoreContexts = () => {
        setContexts(DEFAULT_CONTEXTS);
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
