const { syncMatches } = require('./src/actions/match-actions');

// Simple script to run syncMatches
async function main() {
    console.log("Seeding leagues and syncing matches...");
    const date = new Date().toISOString().split('T')[0];
    try {
        // We need to use ts-node or similar to run this, or just rely on the app.
        // Since we are in a Next.js env, running a standalone script with 'require' might fail due to "use server" and imports.
        // Better approach: Create a temporary API route to trigger it.
    } catch (e) {
        console.error(e);
    }
}
