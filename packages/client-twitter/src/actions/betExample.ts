import { ActionExample } from "@elizaos/core";

export const betExample: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "I bet 100 coins that the Lakers will win tonight",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll create a bet for 100 coins on the Lakers winning tonight.",
                action: "CREATE_BET",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Let's bet 50 coins on the weather being sunny tomorrow",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll set up a bet for 50 coins on tomorrow's weather being sunny.",
                action: "CREATE_BET", 
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "I want to bet 25 coins that Bitcoin hits 50k this week",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll create a bet for 25 coins on Bitcoin reaching 50k this week.",
                action: "CREATE_BET",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Make a bet for 200 coins that Taylor Swift wins Album of the Year",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "I'll set up a bet for 200 coins on Taylor Swift winning Album of the Year.",
                action: "CREATE_BET",
            },
        },
    ],
];
