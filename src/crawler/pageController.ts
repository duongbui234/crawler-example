// const pageScraper = require("./pageScraper");
// import fs from 'fs';
import * as fs from 'fs';
import { pageScraper } from './pageScraper';

export async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    let scrapedData = [];
    const urls = [
      'https://phongtro123.com/cho-thue-phong-tro',
      'https://phongtro123.com/nha-cho-thue',
      'https://phongtro123.com/cho-thue-mat-bang',
      'https://phongtro123.com/cho-thue-can-ho',
    ];

    for (let i = 0; i < urls.length; i++) {
      scrapedData = await pageScraper.scraper(browser, urls[i]);
      let path = new URL(urls[i]).pathname;

      if (path.charAt(0) === '/') {
        path = path.slice(1);
      }
      if (path.charAt(path.length - 1) === '/') {
        path = path.slice(0, -1);
      }

      fs.writeFile(
        `data-${i}.json`,
        JSON.stringify(scrapedData),
        'utf8',
        function (err) {
          if (err) {
            return console.log(err);
          }
          console.log(
            `The data has been scraped and saved successfully! View it at './${path}.json`,
          );
        },
      );
    }
    await browser.close();
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err);
  }
}
