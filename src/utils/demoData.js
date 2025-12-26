export const DEMO_DATA = {
    // 1. Independent Values (Display Only)
    values: [
        { text: "Continuous Learning" },
        { text: "Discipline & Consistency" },
        { text: "Innovation" },
        { text: "Empathy" },
        { text: "Transparency" },
        { text: "Health & Well-being" },
        { text: "Financial Freedom" }
    ],

    // 2. Missions (Long-term Goals) -> Submissions (Roles/Milestones) -> Tasks
    missions: [
        {
            text: "Career Growth & Mastery",
            submissions: [
                {
                    title: "Master System Design Patterns",
                    tasks: [
                        {
                            title: "Read 'Clean Architecture' Chapter 5",
                            urge: false,
                            imp: true,
                            context: "@home",
                            dueDate: 2, // days from now
                            checklist: [
                                "Read pages 100-120",
                                "Take notes on dependency inversion",
                                "Create a diagram of the clean architecture onion"
                            ]
                        },
                        {
                            title: "Refactor Legacy Module X",
                            urge: true,
                            imp: true,
                            context: "@work",
                            dueDate: 0,
                            checklist: [
                                "Identify tight coupling",
                                "Extract interface",
                                "Write unit tests"
                            ]
                        }
                    ]
                },
                {
                    title: "Contribute to Open Source Projects",
                    tasks: [
                        {
                            title: "Review PR #42 for Team Alpha",
                            urge: true,
                            imp: true,
                            context: "@work",
                            dueDate: 0,
                            checklist: [
                                "Check for linting errors",
                                "Verify test coverage",
                                "Leave constructive feedback"
                            ]
                        }
                    ]
                },
                {
                    title: "Mentor Junior Developers",
                    tasks: [
                        {
                            title: "Prepare presentation on SOLID principles",
                            urge: false,
                            imp: true,
                            context: "@work",
                            dueDate: 3
                        }
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
                        {
                            title: "Go for a 5km run",
                            urge: true,
                            imp: true,
                            context: "@anywhere",
                            dueDate: 0,
                            checklist: [
                                "Warm up for 5 mins",
                                "Run 5km",
                                "Cool down and stretch"
                            ]
                        },
                        {
                            title: "Buy new running shoes",
                            urge: false,
                            imp: false,
                            context: "@errands",
                            dueDate: 5
                        }
                    ]
                },
                {
                    title: "Clean Diet Implementation",
                    tasks: [
                        {
                            title: "Buy groceries for meal prep",
                            urge: true,
                            imp: false,
                            context: "@errands",
                            dueDate: 0,
                            checklist: [
                                "Chicken breast",
                                "Broccoli",
                                "Brown rice",
                                "Olive oil"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            text: "Personal Finance",
            submissions: [
                {
                    title: "Research Investment Opportunities",
                    tasks: [
                        {
                            title: "Research Vanguard ETFs",
                            urge: false,
                            imp: true,
                            context: "@computer",
                            dueDate: 5,
                            checklist: [
                                "Compare VOO vs VTI",
                                "Check expense ratios",
                                "Read Q3 performance report"
                            ]
                        }
                    ]
                },
                {
                    title: "Build Emergency Fund",
                    tasks: [
                        {
                            title: "Transfer $500 to savings",
                            urge: true,
                            imp: true,
                            context: "@phone",
                            dueDate: 1
                        }
                    ]
                }
            ]
        }
    ],

    // 3. Loose Tasks (Not linked to any mission, e.g. Inbox/Maintenance)
    tasks: [
        {
            title: "Update LinkedIn Profile",
            urge: false,
            imp: false,
            context: "@computer",
            dueDate: 7,
            checklist: ["Update headshot", "Add recent certs"]
        },
        {
            title: "Schedule dentist appointment",
            urge: true,
            imp: false,
            context: "@phone",
            dueDate: 1
        },
        {
            title: "Pay electricity bill",
            urge: true,
            imp: true,
            context: "@computer",
            dueDate: 0
        },
        {
            title: "Call Mom",
            urge: false,
            imp: true,
            context: "@phone",
            dueDate: 0
        }
    ]
};
