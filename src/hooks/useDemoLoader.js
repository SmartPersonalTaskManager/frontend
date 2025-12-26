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
            // 1. Add Visions
            console.log('📌 Loading visions...');
            for (const v of DEMO_DATA.visions) {
                console.log('  Adding vision:', v.text);
                await addVision(v.text);
            }
            console.log('✅ Visions loaded');

            // 2. Add Values
            console.log('📌 Loading values...');
            for (const v of DEMO_DATA.values) {
                console.log('  Adding value:', v.text);
                await addValue(v.text);
            }
            console.log('✅ Values loaded');

            // 3. Add Missions & Submissions (and keep track of IDs)
            const missionMap = new Map(); // Title -> ID

            console.log('📌 Loading missions...');
            for (const m of DEMO_DATA.missions) {
                console.log('  Adding root mission:', m.text);
                const rootMission = await addMission(m.text);
                console.log('  Root mission created with ID:', rootMission?.id);
                if (rootMission) {
                    missionMap.set(m.text, rootMission.id);

                    if (m.submissions) {
                        console.log('  Adding submissions for:', m.text);
                        for (const sub of m.submissions) {
                            console.log('    Adding submission:', sub.title);
                            const subMission = await addMission(sub.title, rootMission.id);
                            console.log('    Submission created with ID:', subMission?.id);
                            if (subMission) {
                                missionMap.set(sub.title, subMission.id);
                            }
                        }
                    }
                }
            }
            console.log('✅ Missions loaded');

            // 4. Add Tasks
            console.log('📌 Loading tasks...');
            for (const t of DEMO_DATA.tasks) {
                let missionId = null;
                if (t.missionReference && missionMap.has(t.missionReference)) {
                    missionId = missionMap.get(t.missionReference);
                    console.log(`  Task "${t.title}" linked to mission ID:`, missionId);
                }

                console.log('  Adding task:', t.title);
                await addTask({
                    title: t.title,
                    urge: t.urge,
                    imp: t.imp,
                    context: t.context,
                    missionId: missionId,
                    dueDate: t.dueDate,
                    description: "Demo task generated for testing purposes.",
                    isInbox: false
                });
            }
            console.log('✅ Tasks loaded');

            // Mark as done in local storage to avoid re-prompting if we were auto-loading
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
