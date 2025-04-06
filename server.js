const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

app.get("/scrape", async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto("https://x.feedspot.com/artificial_intelligence_twitter_influencers/", {
        waitUntil: "networkidle2", // Wait for network requests to finish
        });
        await page.waitForSelector("h3.feed_heading.mega",{ timeout: 60000 });

        // Extract influencer names
        const influencerNames = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("h3.feed_heading"))
                .map(el => el.innerText.trim()) 
                .slice(0,100);
                //.map(el => el.textContent.trim().replace(/^\d+\.\s*/, "")); // Remove ranking numbers
        });
        

        await browser.close();

        // Save to local file
        fs.writeFileSync("influencers.json", JSON.stringify(influencerNames, null, 2));

        res.json({ success: true, influencers: influencerNames });

    } catch (error) {
        console.error("Error scraping:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
