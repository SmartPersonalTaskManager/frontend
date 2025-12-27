export const DEMO_DATA = {
    // 1. Core Values (3 items - Display Only)
    values: [
        { text: "Continuous Learning" },
        { text: "Discipline & Consistency" },
        { text: "Health & Well-being" }
    ],

    // 2. Personal Missions (5 items) -> Submissions (2-3 each) -> Tasks (4-5 per submission)
    // status: 'done' = completed, isArchived: true = archived
    // 2 submissions will have ALL tasks completed for Insights demo
    missions: [
        {
            text: "Career Growth & Mastery",
            submissions: [
                {
                    title: "Master System Design Patterns",
                    // ALL COMPLETED - For Insights demo ✓
                    allCompleted: true,
                    tasks: [
                        { title: "Read 'Clean Architecture' Chapter 5", urge: false, imp: true, context: "@home", dueDate: -3, status: 'done' },
                        { title: "Refactor Legacy Module X", urge: true, imp: true, context: "@work", dueDate: -5, status: 'done' },
                        { title: "Complete design patterns course", urge: false, imp: true, context: "@computer", dueDate: -2, status: 'done' },
                        { title: "Practice with coding katas", urge: false, imp: false, context: "@computer", dueDate: -1, status: 'done' }
                    ]
                },
                {
                    title: "Contribute to Open Source",
                    tasks: [
                        { title: "Review PR #42 for Team Alpha", urge: true, imp: true, context: "@work", dueDate: 0, status: 'done' },
                        { title: "Fix documentation issues", urge: false, imp: false, context: "@computer", dueDate: 7 },
                        { title: "Submit feature proposal", urge: false, imp: true, context: "@computer", dueDate: 4 },
                        { title: "Write unit tests for utils", urge: true, imp: false, context: "@work", dueDate: 1, status: 'done' },
                        { title: "Update README badges", urge: false, imp: false, context: "@computer", dueDate: 6 }
                    ]
                }
            ]
        },
        {
            text: "Health & Vitality",
            submissions: [
                {
                    title: "Complete a Marathon",
                    tasks: [
                        { title: "Go for a 5km run", urge: true, imp: true, context: "@anywhere", dueDate: 0, status: 'done' },
                        { title: "Buy new running shoes", urge: false, imp: false, context: "@errands", dueDate: 5 },
                        { title: "Research marathon training plans", urge: false, imp: true, context: "@computer", dueDate: 3, status: 'done' },
                        { title: "Sign up for local 10K race", urge: true, imp: true, context: "@phone", dueDate: 2 }
                    ]
                },
                {
                    title: "Clean Diet Implementation",
                    // ALL COMPLETED - For Insights demo ✓
                    allCompleted: true,
                    tasks: [
                        { title: "Buy groceries for meal prep", urge: true, imp: false, context: "@errands", dueDate: -4, status: 'done', isArchived: true },
                        { title: "Prepare weekly meal plan", urge: false, imp: true, context: "@home", dueDate: -3, status: 'done' },
                        { title: "Research protein sources", urge: false, imp: false, context: "@computer", dueDate: -2, status: 'done' },
                        { title: "Clean out pantry", urge: false, imp: false, context: "@home", dueDate: -5, status: 'done', isArchived: true },
                        { title: "Schedule nutritionist call", urge: true, imp: true, context: "@phone", dueDate: -1, status: 'done' }
                    ]
                },
                {
                    title: "Improve Sleep Quality",
                    tasks: [
                        { title: "Set consistent bedtime alarm", urge: true, imp: true, context: "@phone", dueDate: 0, status: 'done' },
                        { title: "Buy blackout curtains", urge: false, imp: true, context: "@errands", dueDate: 5 },
                        { title: "No screens 1hr before bed", urge: true, imp: true, context: "@home", dueDate: 0 },
                        { title: "Track sleep patterns for a week", urge: false, imp: false, context: "@phone", dueDate: 7 }
                    ]
                }
            ]
        },
        {
            text: "Personal Finance",
            submissions: [
                {
                    title: "Build Emergency Fund",
                    tasks: [
                        { title: "Transfer $500 to savings", urge: true, imp: true, context: "@phone", dueDate: -2, status: 'done' },
                        { title: "Set up automatic transfer", urge: false, imp: true, context: "@computer", dueDate: 3 },
                        { title: "Review bank account fees", urge: false, imp: false, context: "@computer", dueDate: 5 },
                        { title: "Compare high-yield savings accounts", urge: false, imp: true, context: "@computer", dueDate: 4, status: 'done' }
                    ]
                },
                {
                    title: "Investment Portfolio",
                    tasks: [
                        { title: "Research Vanguard ETFs", urge: false, imp: true, context: "@computer", dueDate: 5 },
                        { title: "Read 'The Intelligent Investor'", urge: false, imp: true, context: "@home", dueDate: 14 },
                        { title: "Open brokerage account", urge: true, imp: true, context: "@computer", dueDate: -1, status: 'done', isArchived: true },
                        { title: "Set monthly investment goal", urge: false, imp: true, context: "@computer", dueDate: 3 },
                        { title: "Review current 401k allocation", urge: true, imp: false, context: "@work", dueDate: 1 }
                    ]
                }
            ]
        },
        {
            text: "Meaningful Relationships",
            submissions: [
                {
                    title: "Strengthen Family Bonds",
                    tasks: [
                        { title: "Call Mom", urge: false, imp: true, context: "@phone", dueDate: 0 },
                        { title: "Plan family dinner this weekend", urge: true, imp: true, context: "@home", dueDate: 3, status: 'done' },
                        { title: "Send birthday card to cousin", urge: true, imp: false, context: "@errands", dueDate: 2 },
                        { title: "Create shared photo album", urge: false, imp: false, context: "@computer", dueDate: 7 }
                    ]
                },
                {
                    title: "Nurture Friendships",
                    tasks: [
                        { title: "Schedule coffee with Alex", urge: false, imp: true, context: "@phone", dueDate: 4 },
                        { title: "Reply to group chat", urge: true, imp: false, context: "@phone", dueDate: 0, status: 'done' },
                        { title: "Plan game night", urge: false, imp: true, context: "@home", dueDate: 6 },
                        { title: "Send congratulations gift", urge: true, imp: true, context: "@errands", dueDate: 1 },
                        { title: "Catch up call with old friend", urge: false, imp: true, context: "@phone", dueDate: 5 }
                    ]
                },
                {
                    title: "Professional Network",
                    tasks: [
                        { title: "Update LinkedIn Profile", urge: false, imp: false, context: "@computer", dueDate: 7 },
                        { title: "Attend industry meetup", urge: true, imp: true, context: "@anywhere", dueDate: 5 },
                        { title: "Follow up with conference contact", urge: true, imp: true, context: "@computer", dueDate: 2 },
                        { title: "Write recommendation for colleague", urge: false, imp: true, context: "@computer", dueDate: 4 }
                    ]
                }
            ]
        },
        {
            text: "Personal Development",
            submissions: [
                {
                    title: "Learn New Language",
                    tasks: [
                        { title: "Complete Duolingo lesson", urge: true, imp: false, context: "@phone", dueDate: 0, status: 'done' },
                        { title: "Watch foreign film with subtitles", urge: false, imp: false, context: "@home", dueDate: 3 },
                        { title: "Practice speaking for 15 mins", urge: true, imp: true, context: "@home", dueDate: 0 },
                        { title: "Find language exchange partner", urge: false, imp: true, context: "@computer", dueDate: 7 },
                        { title: "Order grammar workbook", urge: false, imp: false, context: "@computer", dueDate: 4 }
                    ]
                },
                {
                    title: "Mindfulness Practice",
                    tasks: [
                        { title: "10 min morning meditation", urge: true, imp: true, context: "@home", dueDate: 0 },
                        { title: "Download meditation app", urge: false, imp: false, context: "@phone", dueDate: -3, status: 'done' },
                        { title: "Read chapter on mindfulness", urge: false, imp: true, context: "@home", dueDate: 5 },
                        { title: "Try yoga class", urge: false, imp: false, context: "@anywhere", dueDate: 7 }
                    ]
                }
            ]
        }
    ],

    // 3. Loose Tasks (Not linked to any mission) - keep minimal
    tasks: [
        { title: "Pay electricity bill", urge: true, imp: true, context: "@computer", dueDate: -1, status: 'done' },
        { title: "Schedule dentist appointment", urge: true, imp: false, context: "@phone", dueDate: 1 }
    ]
};

// TEST DEMO DATA - Systematic naming for easy testing and debugging
export const TEST_DEMO_DATA = {
    // 1. Core Values (3 items - same count as regular demo)
    values: [
        { text: "VALUE-1" },
        { text: "VALUE-2" },
        { text: "VALUE-3" }
    ],

    // 2. Personal Missions (5 items) -> Submissions (2-3 each) -> Tasks (4-5 per submission)
    // Naming: MISSION-X, SUBMISSION-X.Y, TASK-X.Y.Z
    // STRICT RULE: Tasks must belong to Submissions, never directly to Missions.
    missions: [
        {
            text: "MISSION-1",
            submissions: [
                {
                    title: "SUBMISSION-1.1",
                    // ALL COMPLETED - For Insights demo ✓
                    allCompleted: true,
                    tasks: [
                        { title: "TASK-1.1.1", urge: false, imp: true, context: "@home", dueDate: -3, status: 'done' },
                        { title: "TASK-1.1.2", urge: true, imp: true, context: "@work", dueDate: -5, status: 'done' },
                        { title: "TASK-1.1.3", urge: false, imp: true, context: "@computer", dueDate: -2, status: 'done' },
                        { title: "TASK-1.1.4", urge: false, imp: false, context: "@computer", dueDate: -1, status: 'done' }
                    ]
                },
                {
                    title: "SUBMISSION-1.2",
                    tasks: [
                        { title: "TASK-1.2.1", urge: true, imp: true, context: "@work", dueDate: 0, status: 'done' },
                        { title: "TASK-1.2.2", urge: false, imp: false, context: "@computer", dueDate: 7 },
                        { title: "TASK-1.2.3", urge: false, imp: true, context: "@computer", dueDate: 4 },
                        { title: "TASK-1.2.4", urge: true, imp: false, context: "@work", dueDate: 1, status: 'done' },
                        { title: "TASK-1.2.5", urge: false, imp: false, context: "@computer", dueDate: 6 }
                    ]
                }
            ]
        },
        {
            text: "MISSION-2",
            submissions: [
                {
                    title: "SUBMISSION-2.1",
                    tasks: [
                        { title: "TASK-2.1.1", urge: true, imp: true, context: "@anywhere", dueDate: 0, status: 'done' },
                        { title: "TASK-2.1.2", urge: false, imp: false, context: "@errands", dueDate: 5 },
                        { title: "TASK-2.1.3", urge: false, imp: true, context: "@computer", dueDate: 3, status: 'done' },
                        { title: "TASK-2.1.4", urge: true, imp: true, context: "@phone", dueDate: 2 }
                    ]
                },
                {
                    title: "SUBMISSION-2.2",
                    // ALL COMPLETED - For Insights demo ✓
                    allCompleted: true,
                    tasks: [
                        { title: "TASK-2.2.1", urge: true, imp: false, context: "@errands", dueDate: -4, status: 'done', isArchived: true },
                        { title: "TASK-2.2.2", urge: false, imp: true, context: "@home", dueDate: -3, status: 'done' },
                        { title: "TASK-2.2.3", urge: false, imp: false, context: "@computer", dueDate: -2, status: 'done' },
                        { title: "TASK-2.2.4", urge: false, imp: false, context: "@home", dueDate: -5, status: 'done', isArchived: true },
                        { title: "TASK-2.2.5", urge: true, imp: true, context: "@phone", dueDate: -1, status: 'done' }
                    ]
                },
                {
                    title: "SUBMISSION-2.3",
                    // ALL COMPLETED - For Insights demo ✓
                    allCompleted: true,
                    tasks: [
                        { title: "TASK-2.3.1", urge: true, imp: true, context: "@phone", dueDate: 0, status: 'done' },
                        { title: "TASK-2.3.2", urge: false, imp: true, context: "@errands", dueDate: -2, status: 'done' },
                        { title: "TASK-2.3.3", urge: true, imp: true, context: "@home", dueDate: -1, status: 'done' },
                        { title: "TASK-2.3.4", urge: false, imp: false, context: "@phone", dueDate: -3, status: 'done' }
                    ]
                }
            ]
        },
        {
            text: "MISSION-3",
            submissions: [
                {
                    title: "SUBMISSION-3.1",
                    tasks: [
                        { title: "TASK-3.1.1", urge: true, imp: true, context: "@phone", dueDate: -2, status: 'done' },
                        { title: "TASK-3.1.2", urge: false, imp: true, context: "@computer", dueDate: 3 },
                        { title: "TASK-3.1.3", urge: false, imp: false, context: "@computer", dueDate: 5 },
                        { title: "TASK-3.1.4", urge: false, imp: true, context: "@computer", dueDate: 4, status: 'done' }
                    ]
                },
                {
                    title: "SUBMISSION-3.2",
                    tasks: [
                        { title: "TASK-3.2.1", urge: false, imp: true, context: "@computer", dueDate: 5 },
                        { title: "TASK-3.2.2", urge: false, imp: true, context: "@home", dueDate: 14 },
                        { title: "TASK-3.2.3", urge: true, imp: true, context: "@computer", dueDate: -1, status: 'done', isArchived: true },
                        { title: "TASK-3.2.4", urge: false, imp: true, context: "@computer", dueDate: 3 },
                        { title: "TASK-3.2.5", urge: true, imp: false, context: "@work", dueDate: 1 }
                    ]
                }
            ]
        },
        {
            text: "MISSION-4",
            submissions: [
                {
                    title: "SUBMISSION-4.1",
                    tasks: [
                        { title: "TASK-4.1.1", urge: false, imp: true, context: "@phone", dueDate: 0 },
                        { title: "TASK-4.1.2", urge: true, imp: true, context: "@home", dueDate: 3, status: 'done' },
                        { title: "TASK-4.1.3", urge: true, imp: false, context: "@errands", dueDate: 2 },
                        { title: "TASK-4.1.4", urge: false, imp: false, context: "@computer", dueDate: 7 }
                    ]
                },
                {
                    title: "SUBMISSION-4.2",
                    tasks: [
                        { title: "TASK-4.2.1", urge: false, imp: true, context: "@phone", dueDate: 4 },
                        { title: "TASK-4.2.2", urge: true, imp: false, context: "@phone", dueDate: 0, status: 'done' },
                        { title: "TASK-4.2.3", urge: false, imp: true, context: "@home", dueDate: 6 },
                        { title: "TASK-4.2.4", urge: true, imp: true, context: "@errands", dueDate: 1 },
                        { title: "TASK-4.2.5", urge: false, imp: true, context: "@phone", dueDate: 5 }
                    ]
                },
                {
                    title: "SUBMISSION-4.3",
                    tasks: [
                        { title: "TASK-4.3.1", urge: false, imp: false, context: "@computer", dueDate: 7 },
                        { title: "TASK-4.3.2", urge: true, imp: true, context: "@anywhere", dueDate: 5 },
                        { title: "TASK-4.3.3", urge: true, imp: true, context: "@computer", dueDate: 2 },
                        { title: "TASK-4.3.4", urge: false, imp: true, context: "@computer", dueDate: 4 }
                    ]
                }
            ]
        },
        {
            text: "MISSION-5",
            submissions: [
                {
                    title: "SUBMISSION-5.1",
                    tasks: [
                        { title: "TASK-5.1.1", urge: true, imp: false, context: "@phone", dueDate: 0, status: 'done' },
                        { title: "TASK-5.1.2", urge: false, imp: false, context: "@home", dueDate: 3 },
                        { title: "TASK-5.1.3", urge: true, imp: true, context: "@home", dueDate: 0 },
                        { title: "TASK-5.1.4", urge: false, imp: true, context: "@computer", dueDate: 7 },
                        { title: "TASK-5.1.5", urge: false, imp: false, context: "@computer", dueDate: 4 }
                    ]
                },
                {
                    title: "SUBMISSION-5.2",
                    tasks: [
                        { title: "TASK-5.2.1", urge: true, imp: true, context: "@home", dueDate: 0 },
                        { title: "TASK-5.2.2", urge: false, imp: false, context: "@phone", dueDate: -3, status: 'done' },
                        { title: "TASK-5.2.3", urge: false, imp: true, context: "@home", dueDate: 5 },
                        { title: "TASK-5.2.4", urge: false, imp: false, context: "@anywhere", dueDate: 7 }
                    ]
                }
            ]
        }
    ],

    // 3. Loose Tasks (Not linked to any mission)
    tasks: [
        { title: "LOOSE-TASK-1", urge: true, imp: true, context: "@computer", dueDate: -1, status: 'done' },
        { title: "LOOSE-TASK-2", urge: true, imp: false, context: "@phone", dueDate: 1 }
    ]
};
