import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useMission } from '../context/MissionContext';
import { DEMO_DATA } from '../utils/demoData';

export function useDemoLoader() {
    const { addTask } = useTasks();
    const { addVision, addValue, addMission } = useMission();
    const [isLoading, setIsLoading] = useState(false);

    const loadDemoData = async () => {
        console.log('🚀 Starting demo data load...');
        setIsLoading(true);
        try {
            // 1. Add Values (Independent)
            console.log('📌 Loading values...');
            if (DEMO_DATA.values) {
                for (const v of DEMO_DATA.values) {
                    await addValue(v.text);
                }
            }
            console.log('✅ Values loaded');

            // 2. Add Missions, Submissions & Linked Tasks
            console.log('📌 Loading missions tree...');
            if (DEMO_DATA.missions) {
                for (const m of DEMO_DATA.missions) {
                    console.log('  Adding root mission:', m.text);
                    const rootMission = await addMission(m.text);

                    if (rootMission && m.submissions) {
                        for (const sub of m.submissions) {
                            console.log('    Adding submission:', sub.title);
                            const subMission = await addMission(sub.title, rootMission.id);

                            if (subMission && sub.tasks) {
                                console.log(`      Adding ${sub.tasks.length} tasks for submission:`, sub.title);
                                for (const t of sub.tasks) {
                                    await addTask({
                                        title: t.title,
                                        urge: t.urge,
                                        imp: t.imp,
                                        context: t.context,
                                        missionId: subMission.id,
                                        dueDate: new Date(new Date().setDate(new Date().getDate() + (t.dueDate || 0))).toISOString().split('T')[0],
                                        description: t.checklist ? JSON.stringify(t.checklist) : "", // Store checklist in description for now or extended field if supported
                                        checklist: t.checklist,
                                        isInbox: false
                                    });
                                }
                            }
                        }
                    }
                }
            }
            console.log('✅ Missions & Linked Tasks loaded');

            // 3. Add Loose Tasks
            console.log('📌 Loading loose tasks...');
            if (DEMO_DATA.tasks) {
                for (const t of DEMO_DATA.tasks) {
                    await addTask({
                        title: t.title,
                        urge: t.urge,
                        imp: t.imp,
                        context: t.context,
                        missionId: null,
                        dueDate: new Date(new Date().setDate(new Date().getDate() + (t.dueDate || 0))).toISOString().split('T')[0],
                        checklist: t.checklist,
                        description: t.checklist ? "Has Checklist" : "",
                        isInbox: false
                    });
                }
            }
            console.log('✅ Loose Tasks loaded');

            // Mark as done
            localStorage.setItem("sptm_has_loaded_demo", "true");
            console.log('✅ Demo data load complete!');

        } catch (error) {
            console.error("❌ Error loading demo data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { loadDemoData, isLoading };
}
