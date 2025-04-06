const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeInfluencers() {
    const url = "https://x.feedspot.com/artificial_intelligence_twitter_influencers/"; // Update with correct Feedspot URL

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Adjust selector based on the webpage's structure
    const influencers = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("h3.fs-16.f-alt"))
            .map(el => el.textContent.trim()) // Get text content
            .slice(0, 100); // Limit to 100 names
    });

    await browser.close();

    // Save data locally
    fs.writeFileSync("ai_influencers.json", JSON.stringify(influencers, null, 2));
    console.log("✅ AI Influencers list saved!");

    return influencers;
}

// Run scraper
scrapeInfluencers();
