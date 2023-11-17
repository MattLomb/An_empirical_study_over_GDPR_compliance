const fs = require("fs");
const { Cluster } = require("puppeteer-cluster");
const path = require("path");
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();
const puppeteer = require('puppeteer-extra');

// Urls to visit and check
const urls = [
    "https://www.hdblog.it",
    "https://youmath.it",
    "https://corriere.it",
    "https://hsr.it"
  ];

// Consent-O-Matic extension to load into the Puppeteer instance of Chrome
const pathToExtension = path.join(process.cwd(), './Consent-O-Matic-ScrapeAutoTesting/Extension');

// Array to store results
const res = [];

// Setup of the concurrency cluster
(async () => {
  puppeteer.use( StealthPlugin );
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 5,
    monitor: true,
    skipDuplicateUrls: true,
    puppeteer,
    puppeteerOptions: {
      headless: 'new',
      defaultViewport: false,
      userDataDir: "./tmp",
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ]
    }
  });

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  // Task executed for each website in input
  await cluster.task(async ({ page, data: url }) => {
    await page.goto( url, {
      timeout: 20000,
      waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2']
    });

    let promise = new Promise((resolve)=>{
      page.exposeFunction("publishCoMResult", (result)=>{
          res.push(result);
          resolve(result);
      });
    });

    await page.evaluate(()=>{
      window.dispatchEvent(new CustomEvent("startCOM"));
    });

    await page.screenshot({ path: `./screenshots/${url.replace(/[:\/.]/g, '_')}.png` }); // Salva lo screenshot

    let result = await promise;

    return result;
  });

  for (const url of urls) {
    await cluster.queue(url);
  }

  await cluster.idle();
  await cluster.close();

  console.log("Final handling of CMPs:");
  console.log( res );

})();