// const pageScraper = require("./pageScraper");
// import fs from 'fs';
import * as fs from 'fs';
import { pageScraper } from './pageScraper';

export async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    let scrapedData = [];

    scrapedData = await pageScraper.scraper(browser);
    await browser.close();
    fs.writeFile(
      'maps.json',
      JSON.stringify(scrapedData),
      'utf8',
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(
          "The data has been scraped and saved successfully! View it at './data.json'",
        );
      },
    );
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err);
  }
}
