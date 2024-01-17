# An empirical study over GDPR compliance on website

  * [Introduction](#introduction)
  * [CMP detector](#cmp-detector)
  * [Automatic GDPR violation detector tool](#automatic-gdpr-violation-detector-tool)
  * [Installation](#installation)
  * [Repository contents](#repository-contents)
  * [Credits](#credits)

## Introduction
This repository contains the scripts developed to perform an empirical study on Italian website compliance to GDPR.

The goals of the research conducted in this study are:
  1. Perform a large-scale measurements over most spread cookie banner on Italian domains.
  2. Develop an automatic GDPR violation detector tool.

The scripts developed to reach the defined goals have been implemented combining different existing  projects: Consent-O-Matic, CookieBlock, Cookiepedia and the IAB Transparency & Consent Framework. In particular, different Web Crawlers based on Node.js, Puppeteer and its Stealth Plugin have been developed to implement the **CMP Detector** and the **Automatic Violation Detector tool**. 

The CMP Detector is able to recognize 283 different cookie banners thanks to the co-operation of Consent-O-Matic and the IAB Transparency & Consent Framework.

The Automatic Violation Detector tool can recognize two different GDPR violations, **Cookies set at startup** and **User choices not respected**: this tool, using the crawler developed, automatically connects to the target website, interact with the cookie banner installed (if necessary) through Consent-O-Matic, downloads the cookies set and performs a classification with two different models: the first model is based on the CookieBlock XGB model, while the second one is based on Cookiepedia. In the end, a violation report is produced by comparing the user consents given at the beginning with the cookies purposes found after the classification process.

It is an open project developed in the University of Rome La Sapienza, so regular people can contribute to the research by adding code, documentation and support to other violations spread in the online scenario. 

> Note: this project uses Consent-O-Matic: if some cookie banners are not supported, you need to add them to the Consent-O-Matic rules set!


## CMP detector
Two possible cmp detection methods have been implemented: the first (cmp_detector.js) uses Consent-O-Matic, the second (IAB_cmp_detector.js) exploits the Transparency & Consent Framework.

The **cmp_detector.js** script takes the content of the file **input_urls.txt** and then, using Puppeteer and loading Consent-O-Matic extension, takes each website contained in the input_urls file and starts the detection of the cookie banners installed it using the Consent-O-Matic rules. 
The input_urls.txt must contain one website per line in the following format: "websitename.it" (it can be used not only on .it domains!).
After the execution of Consent-O-Matic scripts, the cmp_detector script writes the result of the detection inside a folder named **results**: inside this folder it will create a txt file for each CMP (named as the CMP) and inside each file will write the websites installing the cookie banner. 

The **IAB_cmp_deetector.js** takes as input, as the previous one, the **input_urls.txt** containing websites on which perform the cmp detection. This script is also based on Puppeteer but, instead of using Consent-O-Matic, it detects the presence of the cookie banner exploiting the Transparency & Consent Framework, so exploiting the presence of the **__tcfapi** function: the execution of this function with the Ping command, returns a PingReturn object containing the id of the CMP installed. Like before, the output of the cmp detection is then written inside the **results/IAB** folder, creating a txt file per cookie banner detected and writing inside them the websites installing it. 

## Automatic GDPR violation detector tool
The violation detector tool is able to recognize two different GDPR violations:
  1. Cookies set at startup
  2. User choices not respected
The violation detector tool can be run or on a single website, executing the bash script **violation_detector.sh**, or on bunch of websites, executing the **violation_detector_loop.sh**.
The bash scripts are designed to make Consent-O-Matic, CookieBlock and Cookiepedia work together.
The first script executed, in fact, is a Web Crawler that automatically connects to the website under analysis and, after interacting with the cookie banner (if it needs to give choices), downloads all the cookies that have been set over the browser instance. Then, it formats the cookies as CookieBlock requires using the **formatCookies.js** module and finally executes the cookies' purposes prediction first with the **predict_class.py** script of CookieBlock and then with the **cookiepedia_classifier.js** module.

The predict_class.py script uses the XGB model developed by the authors of CookieBlock.

The Cookiepedia classifier, instead, takes the name of each cookie retrieved and then, using Axios, performs a GET request to Cookiepedia to retrieve the cookie purpose.

At the end, a violation report is produced for each classifier: inside the report are put all the cookies retrieved, divided for categories. The GDPR violation is detected by comparing the user's consent with the cookies' purposes found during the classification process.

The violation reports are then saved inside the **violations/<classification_model>** folder.
## Installation
To correctly execute all the scripts present in this folder and to reproduce the results obtained, follow these steps. 
  1. Create a parent folder where to put all the following code
  2. Clone this project inside the parent folder
  3. Clone the CookieBlock-Consent-Classifier code inside the parent folder (https://github.com/dibollinger/CookieBlock-Consent-Classifier)
  4. Inside the folder of this project, clone the Consent-O-Matic browser extension folder (https://github.com/cavi-au/Consent-O-Matic/tree/ScrapeAutoTesting)
  5. Give all the permission to the bash scripts: they need to write, execute and cross folder to be executed correctly.

IMPORTANT: The bash script must be executed in a correct Python environment supporting CookieBlock. 

## Repository contents
  - ```cookiepedia_json``` and ```cookies_formatted```: these folder store the json files containing the cookies to be classified by Cookiepedia and CookieBlock respectively. In particular, the cookies_formatted folder contains the output of the **formatCookies.js** script.
  - ```node_modules```: contains all the Node.js modules used to execute the scripts.
  - ```./statistical_analysis_results```, ```./no_consents```, ```./no_interaction```, ```./necessary&functional```: these folder contains the results of the CMP detector and of the violations detector tool. In particular they are related to the ```./violation_detection_target``` folder.
  - ```./violations```: this folder is used to write in output the result of the **violation_detector.sh** script.
  - ```./results```: this folder contains the results of the **cmp_detector** scripts.

## Credits
This repository was created as part of the Master Thesis "An empirical study on website compliance to GDPR" conducted by Matteo Lombardi. 

**Thesis author:** Matteo Lombardi.

See also following repositories/projects for other components that were developed as part of the thesis:
  - https://github.com/dibollinger/CookieBlock-Consent-Classifier
  - https://github.com/cavi-au/Consent-O-Matic/tree/ScrapeAutoTesting
  - https://github.com/dmlc/xgboost/
  - https://cookiepedia.co.uk/