const fs = require('fs');
const path = require('path');
const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');

// Load .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
        console.log("Loaded .env.local");
    }
} catch (e) {
    console.error("Failed to load .env.local", e);
}

async function main() {
    console.log("Testing Google AI API (API Key)...");

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local");
        return;
    }

    console.log("API Key found (starts with):", process.env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 5) + "...");

    try {
        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: 'Hello, are you working?',
        });
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error calling Google AI:", error);
    }
}

main();
