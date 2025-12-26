export const DEMO_DATA = {
    visions: [
        { text: "Become a thought leader in software architecture and design." },
        { text: "Achieve financial independence through diversified income streams." },
        { text: "Cultivate a balanced life with strong health and meaningful relationships." }
    ],
    values: [
        { text: "Continuous Learning" },
        { text: "Discipline & Consistency" },
        { text: "Innovation" },
        { text: "Empathy" },
        { text: "Transparency" }
    ],
    missions: [
        {
            text: "Career Growth & Mastery",
            submissions: [
                { title: "Master System Design Patterns" },
                { title: "Contribute to Open Source Projects" },
                { title: "Mentor Junior Developers" }
            ]
        },
        {
            text: "Health & Vitality",
            submissions: [
                { title: "Complete a Marathon" },
                { title: "Perfect Sleep Schedule" },
                { title: "Clean Diet Implementation" }
            ]
        },
        {
            text: "Personal Finance",
            submissions: [
                { title: "Build Emergency Fund" },
                { title: "Research Investment Opportunities" }
            ]
        }
    ],
    tasks: [
        {
            title: "Read 'Clean Architecture' Chapter 5",
            urge: false,
            imp: true,
            context: "@home",
            missionReference: "Master System Design Patterns", // We will try to link this dynamically
            dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0]
        },
        {
            title: "Review PR #42 for Team Alpha",
            urge: true,
            imp: true,
            context: "@work",
            dueDate: new Date().toISOString().split('T')[0]
        },
        {
            title: "Go for a 5km run",
            urge: true,
            imp: true,
            context: "@anywhere",
            missionReference: "Complete a Marathon",
            dueDate: new Date().toISOString().split('T')[0]
        },
        {
            title: "Buy groceries for meal prep",
            urge: true,
            imp: false,
            context: "@errands",
            missionReference: "Clean Diet Implementation",
            dueDate: new Date().toISOString().split('T')[0]
        },
        {
            title: "Research Vanguard ETFs",
            urge: false,
            imp: true,
            context: "@computer",
            missionReference: "Research Investment Opportunities",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0]
        },
        {
            title: "Update LinkedIn Profile",
            urge: false,
            imp: false,
            context: "@computer",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
        },
        {
            title: "Schedule dentist appointment",
            urge: true,
            imp: false,
            context: "@phone",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
        }
    ]
};
