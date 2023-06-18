import * as browser from './browser';
import * as scraperController from './pageController';
import * as mongoose from 'mongoose';

//Start the browser and create a browser instance
const browserInstance = browser.startBrowser();

// Pass the browser instance to the scraper controller
scraperController.scrapeAll(browserInstance);
