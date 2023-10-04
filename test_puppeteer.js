const puppeteer = require('puppeteer-extra');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const readFileLines = require( './fileReader' );

(async () => {

  //Testing purpose
  var url = 'https://hdblog.it'

  const pathToExtension = path.join(process.cwd(), './Consent-O-Matic-ScrapeAutoTesting/Extension');
  const browser = await puppeteer
  .use(StealthPlugin())
  .launch({
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });

  const page = await browser.newPage();
  const navigation = await page.goto(url, {
    waitUntil: 'networkidle2'
  });

  console.log( 'URL VISITATO ' + url );

  console.log( navigation.status().toString() );

  if ( navigation.status().toString() != '200' ) {
    console.log("ERROR " + navigation.status().toString() );
  }



  let promise = new Promise((resolve)=>{
    page.exposeFunction("publishCoMResult", (result)=>{
        console.log(result);
        resolve(result);
    });
    //page.screenshot({ path: url + '.png', fullPage: true });
  });

  await page.evaluate(()=>{
      window.dispatchEvent(new CustomEvent("startCOM"));
  });

  let result = await promise;

  await browser.close();

  return result;
})();
