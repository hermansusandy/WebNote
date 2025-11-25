const { vertex } = require('@ai-sdk/google-vertex');
const { generateText } = require('ai');

async function main() {
    console.log("Testing Vertex AI API...");

    try {
        const { text } = await generateText({
            model: vertex('gemini-1.5-pro', {
                project: 'n8ndemoherman',
                location: 'us-central1',
            }),
            prompt: 'Hello, are you working?',
        });
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error calling Vertex AI:", error);
    }
}

main();
