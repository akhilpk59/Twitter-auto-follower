const puppeteer = require("puppeteer");
const fs = require("fs");

// Load influencer names
const influencers = JSON.parse(fs.readFileSync("influencers.json"));

const TWITTER_URL = "https://x.com";
const USERNAME = "username"; // Replace with your Twitter handle
const PASSWORD = "password"; // Replace with your Twitter password

// Function to wait for a random time
const randomDelay = (min = 5000, max = 10000) => 
    new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

async function loginTwitter(page) {
    await page.goto(`${TWITTER_URL}`, { waitUntil: "networkidle2" });

    // Enter username
    await page.type("input[name='text']", USERNAME, { delay: Math.random() * 200 + 50 });
    await page.keyboard.press("Enter");
    await randomDelay(3000, 6000); // Wait for next input

    // Enter password
    await page.waitForSelector("input[name='password']", { visible: true });
    await page.type("input[name='password']", PASSWORD, { delay: Math.random() * 200 + 50 });
    await page.keyboard.press("Enter");

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("✅ Logged into Twitter!");
}

async function followInfluencer(page, name) {
    try {
        // Search influencer
        await page.goto(`${TWITTER_URL}/search?q=${encodeURIComponent(name)}&f=user`, { waitUntil: "networkidle2" });
        await randomDelay(3000, 7000); // Random wait time

        // Wait for search results
        await page.waitForSelector("a[href*='/']", { timeout: 7000 });

        // Find first profile link
        const profileLink = await page.evaluate(() => {
            const linkElement = document.querySelector("a[href*='/']");
            return linkElement ? linkElement.href : null;
        });

        if (!profileLink) {
            console.log(`❌ Could not find profile for: ${name}`);
            return;
        }

        // Visit influencer profile
        await page.goto(profileLink, { waitUntil: "networkidle2" });
        await randomDelay(4000, 9000); // Random wait time

        // Check if already following
        const isFollowing = await page.evaluate(() => {
            const followButton = document.querySelector("div[aria-label='Following']");
            return followButton !== null;
        });

        if (isFollowing) {
            console.log(`✅ Already following: ${name}`);
            return;
        }

        // Click follow button
        const followButton = await page.$("div[aria-label='Follow']");
        if (followButton) {
            await followButton.click();
            console.log(`➕ Followed: ${name}`);
            await randomDelay(5000, 12000); // Random wait before next action
        } else {
            console.log(`⚠️ Follow button not found for: ${name}`);
        }
    } catch (error) {
        console.log(`❌ Error following ${name}:`, error.message);
    }
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await loginTwitter(page);

    for (const name of influencers) {
        await followInfluencer(page, name);
    }

    console.log("🎉 Finished following influencers!");
    await browser.close();
})();
