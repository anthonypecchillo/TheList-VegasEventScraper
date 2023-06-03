const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');
const RobotsParser = require('robots-parser');
const axios = require('axios');
const winston = require('winston');

// Create a logger with Winston.
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'GenericScraper' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

class GenericScraper {
  constructor() {
    this.browser = null;
    this.pages = {};
    this.robotsTxtCache = {};
  }

  // Initialize Puppeteer browser.
  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      userAgent: new UserAgent().toString()
    });
  }

  // Close Puppeteer browser.
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // Delay function for pausing between requests.
  async delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  // Fetch and parse robots.txt from a website.
  async fetchRobotsTxt(url) {
    if (!this.robotsTxtCache[url]) {
      const robotsTxtUrl = new URL('/robots.txt', url).toString();
      const response = await axios.get(robotsTxtUrl);
      const robotsTxt = RobotsParser(robotsTxtUrl, response.data);
      this.robotsTxtCache[url] = robotsTxt;
    }
    return this.robotsTxtCache[url];
  }

  // Handle CAPTCHAs by waiting for a fixed amount of time.
  async handleCaptcha(page) {
    logger.warn(`Encountered a CAPTCHA at ${page.url()}`);
    await this.delay(10000); // Simulate CAPTCHA solving time.
  }

  // Wait for a certain selector to appear on the page.
  async waitForSelectorOrTimeout(page, selector, timeout = 30000) {
    try {
      await page.waitForSelector(selector, { timeout });
    } catch (error) {
      logger.warn(`Timeout after waiting ${timeout} ms for selector "${selector}".`);
    }
  }

  // Scrape a website using a specific website module.
  async scrapeWebsite(websiteModule, url, delayTime = 1000, retries = 3) {
    let page = this.pages[url];

    while (retries) {
      try {
        const robotsTxt = await this.fetchRobotsTxt(url);
        if (!robotsTxt.isAllowed(url, new UserAgent().toString())) {
          logger.error(`Scraping disallowed by robots.txt at ${url}`);
          return null;
        }
        if (!page) {
          page = await this.browser.newPage();
          await page.setUserAgent(new UserAgent().toString());
          this.pages[url] = page;
          await page.goto(url, { waitUntil: 'networkidle2' });
          if (await websiteModule.hasCaptcha(page)) {
            await this.handleCaptcha(page);
          }
          await this.delay(delayTime);
        }
        logger.info(`Successfully scraped ${url}`);
        return await websiteModule.scrape(page);
      } catch (err) {
        logger.error(`Error scraping ${url}: ${err}`);
        retries--;
        delayTime *= 2;
        logger.info(`Retrying ${url}. Retries left: ${retries}`);
      }
    }
    logger.error(`Failed to scrape ${url} after multiple attempts.`);
    return null;
  }
}

module.exports = GenericScraper;
