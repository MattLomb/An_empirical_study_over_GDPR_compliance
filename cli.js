import fs from 'fs/promises';
import { WebExtractor } from './src/model/web-extractor.js';
import path from 'path';
import * as urlUtil from './src/util/url-util.js';
import * as ruleUtil from './src/util/rule-util.js';
import cli from 'commander';
import config from './src/config.js';
import _ from 'lodash';
import * as slg from 'single-line-log';

const singleLineLog = slg.stdout;

const optDesc = {
    urls: `A path to a file with a list of urls for extraction. Each url should be on it's own line`,
    destination: `A path to the dir where data should be saved. If the dir already contains previous collected data the new data will be appended to the existing files`,
    rules: `A path to the dir where extraction rules are located. If not set the "rules" folder in project will be used as default`,
    concurrency: `The maximum simultaneous loaded web pages`,
    noScreenshot: `Disable screenshots`,
    pageTimeout: `Milliseconds to wait for the initial loading of a page`,
    headless: `run the browser in headless mode`,
    useIdForScreenshotName: `Use an universal unique id for screenshot names instead of the url`,
    debug: 'Print more detailed error information'

};

async function run() {

    try {
        cli.requiredOption('-u, --urls <file>', optDesc.urls);
        cli.requiredOption('-d, --destination <directory>', optDesc.destination);
        cli.option('-r, --rules <directory>', optDesc.rules);
        cli.option('-c, --concurrency <integer>', optDesc.concurrency, WebExtractor.DEFAULT_OPTIONS.maxConcurrency);
        cli.option('-n, --no-screenshot', optDesc.noScreenshot);
        cli.option('-t, --page-timeout <integer>', optDesc.pageTimeout, WebExtractor.DEFAULT_OPTIONS.pageTimeoutMs);
        cli.option('-h, --headless <boolean', optDesc.headless, WebExtractor.DEFAULT_OPTIONS.headless);
        cli.option('-i, --use-id-for-screenshot-name', optDesc.useIdForScreenshotName, WebExtractor.DEFAULT_OPTIONS.useIdForScreenshotName);
        cli.option('-x, --debug', optDesc.debug, false);

        cli.parse(process.argv);

        let urlsPath = cli.urls;
        let destDir = cli.destination;
        let rulesDir = cli.rules;
        let concurrency = Math.max(1, parseIntOrThrow(cli.concurrency));
        let takeScreenshot = cli.screenshot;
        let pageTimeout = Math.max(1, parseIntOrThrow(cli.pageTimeout));
        let headless = cli.headless;
        let useIdForScreenshotName = cli.useIdForScreenshotName;
        let debug = cli.debug;

        config.debug = debug;

        if (!rulesDir) {
            rulesDir = path.join(__dirname, 'rules');
        }

        let rules = await ruleUtil.loadRules(rulesDir);
        let urls = await urlUtil.getUrls(urlsPath);

        if (concurrency > 10) {
            process.setMaxListeners(concurrency + 10); // prevent warning caused by puppeteer registering listeners for each instance
        }

        let options = {
            output: {
                screenshot: takeScreenshot
            },
            maxConcurrency: concurrency,
            pageTimeoutMs: pageTimeout,
            useIdForScreenshotName: useIdForScreenshotName,
            ruleInitOptions: { destDir }
        };

        let start = Date.now();

        let webExtractor = new WebExtractor(urls, rules, destDir, options);
        webExtractor.addProgressionListener((progress) => {
            let line = `pending: ${progress.pending}, completed: ${progress.completed}, failed: ${progress.failed}, total: ${progress.total}\n`;
            singleLineLog(line);
        });
        await webExtractor.execute();

        console.log(`done... (elapsed: ${elapsedTime(start)})`);
    } catch(e) {
        if (config.debug) {
            console.log(e);
        } else {
            console.error(e.message);
        }
    }

}

function parseIntOrThrow(str) {
    let res = parseInt(str);
    if (!_.isSafeInteger(res)) {
        throw new Error(`Could not parse: ${str}`);
    }
    return res;
}

function elapsedTime(startTime) {
    let elapsed = Date.now() - startTime;
    let secMs = 1000;
    let minMs = 60 * secMs;
    let hoursMs = 60 * minMs;

    let hours = Math.floor(elapsed / hoursMs);
    let minutes = Math.floor((elapsed - hours * hoursMs) / minMs);
    let secs = Math.floor((elapsed - (hoursMs * hours + minutes * minMs)) / secMs);
    return `${hours}h, ${minutes}m, ${secs}s`;
}

run();
