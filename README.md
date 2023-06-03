# TheList-VegasEventScraper
Web-Scraping Tool for TheList.vegas

Sure! Here is an example of what the documentation might look like:

---

# GenericScraper Documentation

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [API](#api)
- [Example Usage](#example-usage)
- [Contribute](#contribute)
- [License](#license)

## Introduction

`GenericScraper` is a flexible, extensible web scraper built in Node.js. It's designed to make it easy to scrape different websites while respecting their `robots.txt` files and handling potential CAPTCHAs.

## Installation

To install `GenericScraper`, you'll need to have Node.js installed on your system. You can then install the package using `npm`:

```
npm install generic-scraper
```

## API

The `GenericScraper` class provides several methods for performing web scraping tasks.

### `init()`

This method initializes the Puppeteer browser. It should be called before any scraping operations.

### `close()`

This method closes the Puppeteer browser. It should be called after all scraping operations are complete.

### `scrapeWebsite(websiteModule, url, delayTime = 1000, retries = 3)`

This method scrapes a website using a specific website module.

- `websiteModule`: An object with the following two methods:

    - `hasCaptcha(page)`: Takes a Puppeteer page as an argument and returns a boolean indicating whether the page has a CAPTCHA.

    - `scrape(page)`: Takes a Puppeteer page as an argument and returns the scraped data.

- `url`: The URL of the website to be scraped.

- `delayTime`: The delay between requests in milliseconds. Defaults to 1000 ms.

- `retries`: The number of times to retry a request if it fails. Defaults to 3.

### `delay(time)`

A utility method for pausing the execution of the program for a specified amount of time.

- `time`: The delay in milliseconds.

### `fetchRobotsTxt(url)`

A utility method for fetching the `robots.txt` file from a website.

- `url`: The URL of the website.

### `handleCaptcha(page)`

A method for handling CAPTCHAs. By default, it simply waits for a fixed amount of time, simulating the time it would take for a human to solve a CAPTCHA.

- `page`: The Puppeteer page where the CAPTCHA was encountered.

### `waitForSelectorOrTimeout(page, selector, timeout = 30000)`

A utility method for waiting for a certain selector to appear on the page, or timing out after a specified amount of time.

- `page`: The Puppeteer page to wait on.

- `selector`: The CSS selector to wait for.

- `timeout`: The timeout in milliseconds. Defaults to 30000 ms.

## Example Usage

Here's an example of how you can use `GenericScraper` to scrape a website:

```javascript
const GenericScraper = require('generic-scraper');
const websiteModule = require('./websiteModule');

const scraper = new GenericScraper();
scraper.init().then(async () => {
  const data = await scraper.scrapeWebsite(websiteModule, 'https://example.com');
  console.log(data);
  await scraper.close();
});
```

In this example, `websiteModule` is a site-specific module that defines how to scrape `https://example.com`.

## Contribute

Contributions to `GenericScraper` are welcome! Please submit a pull request or open an issue on our GitHub repository.

## License

`GenericScraper` is released under the MIT License.
