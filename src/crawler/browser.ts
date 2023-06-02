import puppeteer from 'puppeteer';

export async function startBrowser() {
  let browser;
  try {
    console.log('Opening the browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true,
      defaultViewport: { width: 1280, height: 800 },
    });
  } catch (error) {
    console.log('Could not create a browser instance => ', error);
  }
  return browser;
}
