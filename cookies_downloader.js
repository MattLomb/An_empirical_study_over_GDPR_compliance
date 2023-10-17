const puppeteer = require('puppeteer-extra');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

/****** PARSE INPUT  ******/

const arguments = process.argv.slice(2);
arguments.forEach((value, index) => {
  console.log(index, value);
});

const url = 'https://' + arguments[0];

const consents_array = [];
let i = 0;
for ( i; i < arguments.length; i++ ){
  if ( i > 0 ) {
    consents_array.push( arguments[i] );
  }
}

var gdpr_consents = {
  "A": consents_array.includes('a')? true:false,
  "B": consents_array.includes('b')? true:false,
  "D": consents_array.includes('d')? true:false,
  "E": consents_array.includes('e')? true:false,
  "F": consents_array.includes('f')? true:false,
  "X": consents_array.includes('x')? true:false
};



(async () => {

  //Testing purpose
  var url = 'https://hdblog.it';

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

  try {
    const page = await browser.newPage();
    const navigation = await page.goto(url, {
        waitUntil: 'networkidle2'
    });

    console.log( 'URL VISITATO ' + url );

    console.log( navigation.status().toString() );

    if ( navigation.status().toString() != '200' ) {
        console.log( "ERROR DURING NAVIGATION ON  " + url + "\nERROR CODE/RESPONSE STATUS: " + navigation.status().toString() );
    } else {
        let promise = new Promise((resolve)=>{
            page.exposeFunction("publishCoMResult", (result)=>{
                console.log(result);
                resolve(result);
            });
            //page.screenshot({ path: url + '.png', fullPage: true });
        });
    
        // Start executing the script for the interaction with the CMP
        await page.evaluate(()=>{
            window.dispatchEvent(new CustomEvent("startCOM", { detail: 0 }));
        });
    
        let result = await promise;

        // Retrieve the cookies from the website
        const cookies = await page.cookies();
        
        console.log( "--- COOKIES RETRIEVED AFTER COM INTERACTION ---" );
        console.log( cookies );
    
        //await browser.close();
    
        return cookies;
    }
    
  } catch ( err ) {
    console.log( "Error: " + err );
  }

  
})();

