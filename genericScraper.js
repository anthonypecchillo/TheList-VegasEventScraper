const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');
const RobotsParser = require('robots-parser');
const axios = require('axios');

class GenericScraper {
  constructor() {
    // Initialize the browser and pages variables
    this.browser = null;
    this.pages = {};
    this.robotsTxtCache = {};
  }

  async init() {
    // Launch a new browser instance with a random user agent
    this.browser = await puppeteer.launch({
      headless: true,
      userAgent: new UserAgent().toString(),
    });
  }

  async close() {
    // Close the browser when done
    if (this.browser) {
      await this.browser.close();
    }
  }

  async delay(time) {
    // Wait for a specified amount of time
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async fetchRobotsTxt(url) {
    // Check if we've already fetched the robots.txt for this URL
    if (!this.robotsTxtCache[url]) {
      // Fetch the robots.txt
      const robotsTxtUrl = new URL('/robots.txt', url).toString();
      const response = await axios.get(robotsTxtUrl);

      // Parse and cache the robots.txt
      const robotsTxt = RobotsParser(robotsTxtUrl, response.data);
      this.robotsTxtCache[url] = robotsTxt;
    }

    return this.robotsTxtCache[url];
  }

  async handleCaptcha(page) {
    // Placeholder function to simulate CAPTCHA solving
    console.log(`Encountered a CAPTCHA at ${page.url()}`);
    await this.delay(10000); // Wait for 10 seconds
  }

  async scrapeWebsite(websiteModule, url, delayTime = 1000, retries = 3) {
    let page = this.pages[url];

    while (retries) {
      try {
        // Check robots.txt
        const robotsTxt = await this.fetchRobotsTxt(url);
        if (!robotsTxt.isAllowed(url, new UserAgent().toString())) {
          console.error(`Scraping disallowed by robots.txt at ${url}`);
          return null;
        }

        // Open the page and scrape data
        if (!page) {
          page = await this.browser.newPage();
          await page.setUserAgent(new UserAgent().toString());
          this.pages[url] = page;
          await page.goto(url, { waitUntil: 'networkidle2' });

          // Check if there's a CAPTCHA on the page
          if (await websiteModule.hasCaptcha(page)) {
            await this.handleCaptcha(page);
          }

          await this.delay(delayTime);
        }

        return await websiteModule.scrape(page);
      } catch (err) {
        console.error(`Error scraping ${url}: ${err}`);
        retries--;
        delayTime *= 2;
        console.log(`Retrying ${url}. Retries left: ${retries}`);
      }
    }

    console.error(`Failed to scrape ${url} after multiple attempts.`);
    return null;
  }
}

module.exports = GenericScraper;
