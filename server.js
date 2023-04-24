const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

const crawlData = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // args: ["--disable-setuid-sanbox"],
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  await page.goto("https://phongtro123.com/", {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector("#webpage");

  await page.$$eval("#navbar > ui > li", (els) => {
    console.log(els);
  });

  await browser.close();

  return [];
};

app.get("/", async (req, res) => {
  const data = await crawlData();
  console.log(data);
  res.send(data);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
