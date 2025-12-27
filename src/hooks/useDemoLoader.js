import { useState, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import { useMission } from '../context/MissionContext';
import { DEMO_DATA, TEST_DEMO_DATA } from '../utils/demoData';

export function useDemoLoader() {
    const { addTask, tasks, deletePermanently, updateTask } = useTasks();
    const {
        addValue, addMission,
        missions, deleteMission,
        values, deleteValue,
        visions, deleteVision
    } = useMission();
    const [isLoading, setIsLoading] = useState(false);

    // Helper to create a task with proper status
    const createTaskWithStatus = async (taskData, missionId) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (taskData.dueDate || 0));

        const newTask = await addTask({
            title: taskData.title,
            urge: taskData.urge,
            imp: taskData.imp,
            context: taskData.context,
            missionId: missionId,
            dueDate: dueDate.toISOString().split('T')[0],
            isInbox: false
        });

        // If task should be completed or archived, update it
        if (newTask && (taskData.status === 'done' || taskData.isArchived)) {
            const updates = {};

            if (taskData.status === 'done') {
                updates.status = 'done';
                // Set completedAt to a past date for completed tasks
                const completedDate = new Date();
                completedDate.setDate(completedDate.getDate() + (taskData.dueDate || 0));
                updates.completedAt = completedDate.toISOString();
            }

            if (taskData.isArchived) {
                updates.isArchived = true;
            }

            await updateTask(newTask.id, updates);
        }

        return newTask;
    };

    // Clear ALL existing data - EVERYTHING
    const clearAllData = useCallback(async () => {
        console.log('🗑️ Clearing ALL data...');
        setIsLoading(true);

        const userId = localStorage.getItem("sptm_userId");
        if (!userId) {
            console.warn('No userId found, skipping clear');
            setIsLoading(false);
            return;
        }

        try {
            // Import api for fresh fetches
            const { api } = await import('../services/api');

            // 1. Fetch and delete ALL tasks from backend - use direct API call
            console.log('  Fetching fresh task list from backend...');
            const freshTasks = await api.get(`/tasks/user/${userId}`).catch(() => []);
            if (freshTasks && freshTasks.length > 0) {
                console.log(`  Deleting ${freshTasks.length} tasks...`);
                const taskDeletePromises = freshTasks.map(task =>
                    api.delete(`/tasks/${task.id}`).catch(e => console.warn('Task delete failed:', task.id, e))
                );
                await Promise.all(taskDeletePromises);
            }

            // 2. Fetch and delete all Core Values from backend - use direct API call
            console.log('  Fetching fresh values list from backend...');
            const freshValues = await api.get(`/core-values/user/${userId}`).catch(() => []);
            if (freshValues && freshValues.length > 0) {
                console.log(`  Deleting ${freshValues.length} core values...`);
                const valueDeletePromises = freshValues.map(value =>
                    api.delete(`/core-values/${value.id}`).catch(e => console.warn('Value delete failed:', value.id, e))
                );
                await Promise.all(valueDeletePromises);
            }

            // 3. Fetch and delete all Visions from backend - use direct API call
            console.log('  Fetching fresh visions list from backend...');
            const freshVisions = await api.get(`/visions/user/${userId}`).catch(() => []);
            if (freshVisions && freshVisions.length > 0) {
                console.log(`  Deleting ${freshVisions.length} visions...`);
                const visionDeletePromises = freshVisions.map(vision =>
                    api.delete(`/visions/${vision.id}`).catch(e => console.warn('Vision delete failed:', vision.id, e))
                );
                await Promise.all(visionDeletePromises);
            }

            // 4. Fetch and delete all Missions from backend
            console.log('  Fetching fresh missions list from backend...');
            const freshMissions = await api.get(`/missions/user/${userId}`).catch(() => []);
            if (freshMissions && freshMissions.length > 0) {
                // Process missions to get flat list with parentId info
                const flatMissions = [];
                freshMissions.forEach(m => {
                    flatMissions.push({ ...m, parentId: null });
                    if (m.subMissions && Array.isArray(m.subMissions)) {
                        m.subMissions.forEach(sub => {
                            flatMissions.push({ ...sub, parentId: m.id });
                        });
                    }
                });

                // First delete submissions (children) - use direct API call
                const submissions = flatMissions.filter(m => m.parentId);
                if (submissions.length > 0) {
                    console.log(`  Deleting ${submissions.length} submissions...`);
                    const subDeletePromises = submissions.map(sub =>
                        api.delete(`/missions/submissions/${sub.id}`).catch(e => console.warn('Submission delete failed:', sub.id, e))
                    );
                    await Promise.all(subDeletePromises);
                }

                // Small delay to ensure submissions are deleted
                await new Promise(resolve => setTimeout(resolve, 200));

                // Then delete root missions - use direct API call
                const rootMissions = flatMissions.filter(m => !m.parentId);
                if (rootMissions.length > 0) {
                    console.log(`  Deleting ${rootMissions.length} root missions...`);
                    const rootDeletePromises = rootMissions.map(mission =>
                        api.delete(`/missions/${mission.id}`).catch(e => console.warn('Mission delete failed:', mission.id, e))
                    );
                    await Promise.all(rootDeletePromises);
                }
            }

            // 5. Clear localStorage mock database (important for mock mode)
            console.log('  Clearing localStorage mock database...');
            localStorage.removeItem('sptm_mock_db');

            console.log('✅ ALL data cleared!');
        } catch (error) {
            console.error('❌ Error clearing data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadDemoData = useCallback(async (dataType = 'realistic') => {
        const dataSource = dataType === 'test' ? TEST_DEMO_DATA : DEMO_DATA;
        const dataLabel = dataType === 'test' ? 'TEST Demo Data' : 'Realistic Demo Data';

        console.log(`🚀 Starting ${dataLabel} load...`);
        setIsLoading(true);

        try {
            // First, clear all existing data
            await clearAllData();

            // Small delay to ensure backend processes deletes
            await new Promise(resolve => setTimeout(resolve, 300));

            // 1. Add Values in parallel
            console.log('📌 Loading values...');
            if (dataSource.values) {
                const valuePromises = dataSource.values.map(v => addValue(v.text));
                await Promise.all(valuePromises);
            }
            console.log('✅ Values loaded');

            // 2. Add Missions, Submissions & Linked Tasks
            console.log('📌 Loading missions tree...');
            if (dataSource.missions) {
                for (const m of dataSource.missions) {
                    console.log('  Adding mission:', m.text);
                    const rootMission = await addMission(m.text);

                    if (rootMission && m.submissions) {
                        // Add submissions sequentially to maintain order
                        for (const sub of m.submissions) {
                            const subMission = await addMission(sub.title, rootMission.id);

                            if (subMission && sub.tasks) {
                                // Add tasks with status handling
                                for (const t of sub.tasks) {
                                    await createTaskWithStatus(t, subMission.id);
                                }
                                console.log(`    ✓ ${sub.title}: ${sub.tasks.length} tasks`);
                            }
                        }
                    }
                }
            }
            console.log('✅ Missions & Linked Tasks loaded');

            // 3. Add Loose Tasks
            console.log('📌 Loading loose tasks...');
            if (dataSource.tasks) {
                for (const t of dataSource.tasks) {
                    await createTaskWithStatus(t, null);
                }
            }
            console.log('✅ Loose Tasks loaded');

            // Mark as done
            localStorage.setItem("sptm_has_loaded_demo", "true");
            console.log(`✅ ${dataLabel} load complete!`);
            console.log('📊 Summary:');
            console.log('   - 3 Core Values');
            console.log('   - 5 Personal Missions');
            console.log('   - 12 Submissions (~2-3 per mission)');
            console.log('   - ~55 Tasks (~4-5 per submission)');
            console.log('   - ~14 Completed tasks (~25%)');
            console.log('   - 3 Archived tasks');
            console.log('   - 2 Submissions fully completed (for Insights)');

        } catch (error) {
            console.error("❌ Error loading demo data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [addTask, addValue, addMission, updateTask, clearAllData]);

    return { loadDemoData, clearAllData, isLoading };
}
