export const getBetContentTemplate = `Respond with a JSON object containing bet information.
Extract the bet details from the most recent message. If no bet details are provided, respond with an error.

The response must include:
- prediction: What is being bet on
Example response:
\`\`\`json
{
    "description": "Lakers winning tonight's game",
}
\`\`\`
{{recentMessages}}
Extract the bet information from the most recent message.
Respond with a JSON markdown block containing amount and description`;
