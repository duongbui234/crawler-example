const scraperController = require("./pageController");
const browser = require("./browser");

//Start the browser and create a browser instance
let browserInstance = browser.startBrowser();

// Pass the browser instance to the scraper controller
scraperController(browserInstance);
