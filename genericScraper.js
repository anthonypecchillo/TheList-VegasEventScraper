const puppeteer = require('puppeteer');

class GenericScraper {
  constructor() {
    this.browser = null;
    this.pages = {};
  }

  async init() {
    this.browser = await puppeteer.launch({ headless: true });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async scrapeWebsite(websiteModule, url, delayTime) {
    let page = this.pages[url];

    if (!page) {
      page = await this.browser.newPage();
      this.pages[url] = page;
      await page.goto(url, { waitUntil: 'networkidle2' });
      await this.delay(delayTime); // delay after each page load
    }

    return await websiteModule.scrape(page);
  }
}

module.exports = GenericScraper;
