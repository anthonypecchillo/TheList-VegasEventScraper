const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');

class GenericScraper {
  constructor() {
    this.browser = null;
    this.pages = {};
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      userAgent: new UserAgent().toString(),
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async scrapeWebsite(websiteModule, url, delayTime, retries = 3) {
    let page = this.pages[url];

    while (retries) {
      try {
        if (!page) {
          page = await this.browser.newPage();
          await page.setUserAgent(new UserAgent().toString());
          this.pages[url] = page;
          await page.goto(url, { waitUntil: 'networkidle2' });
          await this.delay(delayTime);
        }

        return await websiteModule.scrape(page);
      } catch (err) {
        console.error(`Error scraping ${url}: ${err}`);
        retries--;
        delayTime *= 2; // double the delay time
        console.log(`Retrying ${url}. Retries left: ${retries}`);
      }
    }

    console.error(`Failed to scrape ${url} after multiple attempts.`);
    return null;
  }
}

module.exports = GenericScraper;
