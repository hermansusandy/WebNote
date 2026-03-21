const { google } = require('@ai-sdk/google');
const fs = require('fs');
const path = require('path');

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
    }
} catch (e) {
    console.error("Failed to load .env.local", e);
}

async function main() {
    console.log("Listing models...");
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error("No API key found");
        return;
    }

    // We can't use the SDK to list models easily, so we'll use fetch directly
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("Error listing models:", data.error);
        } else {
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(m => {
                    console.log(`- ${m.name} (${m.displayName})`);
                    console.log(`  Supported methods: ${m.supportedGenerationMethods.join(', ')}`);
                });
            } else {
                console.log("No models found in response.");
            }
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

main();
