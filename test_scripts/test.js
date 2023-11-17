import { WebExtractor } from '@chcaa/web-extractor';

async function run() {
    let urls = ['https://www.dr.dk', 'tv2.dk'];

    let rule = {
        extractor: {
            extract: function() {
                return document.querySelector('h1');
            }
        }
    };

    let destDir = '/temp/data/web-extractor';

    let extractor = new WebExtractor(urls, rule, destDir);

    await extractor.execute();
}

run();