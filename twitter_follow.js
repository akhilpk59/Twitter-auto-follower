const puppeteer = require('puppeteer');
const fs = require('fs');

async function followInfluencers() {
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222' // Connect to your existing Chrome session
    });

    const page = await browser.newPage();

    // Close any popups (Keyboard Shortcuts, modals, etc.)
    await page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay to ensure it's closed

    // Load influencer names from influencers.json and remove numbering
    let influencers = JSON.parse(fs.readFileSync('influencers_remaining.json', 'utf-8'));
    influencers = influencers.map(name => name.replace(/^\d+\.\s*/, '')); // Removes numbers (e.g., "1. John Doe" -> "John Doe")

    for (const name of influencers) {
        console.log(`🔍 Searching for: ${name}`);

        // Open X (Twitter) search page
        await page.goto(`https://x.com/search?q=${encodeURIComponent(name)}&f=user`, { waitUntil: 'networkidle2' });

        // Wait for search results to load
        await new Promise(resolve => setTimeout(resolve, 5000)); // Small delay to ensure it's closed

        // Select the first "Follow" button in the search results
        const followClicked = await page.evaluate(() => {
            const followButtons = [...document.querySelectorAll('div[role="button"], button')]
                .filter(btn => btn.innerText.trim().toLowerCase() === "follow");

            if (followButtons.length > 0) {
                followButtons[0].click();
                return true;
            }
            return false;
        });

        if (followClicked) {
            console.log(`✅ Followed ${name}`);
        } else {
            console.log(`❌ Follow button not found for ${name}`);
        }

        // Small random delay to prevent bot detection
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 3000) + 2000));
    }

    console.log("🎉 Done following all influencers!");
    await browser.close();
}

followInfluencers();
