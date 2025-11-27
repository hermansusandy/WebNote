const fs = require('fs');
const path = require('path');
const { vertex } = require('@ai-sdk/google-vertex');
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
    console.log("Testing Vertex AI API...");
    console.log("Project:", process.env.GOOGLE_VERTEX_PROJECT);
    console.log("Location:", process.env.GOOGLE_VERTEX_LOCATION);

    try {
        const { text } = await generateText({
            model: vertex('gemini-1.5-flash'),
            prompt: 'Hello, are you working?',
        });
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error calling Vertex AI:", error);
    }
}

main();
