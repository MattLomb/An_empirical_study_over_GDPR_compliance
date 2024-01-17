# An empirical study over GDPR compliance on website

## Introduction
This repository contains the scripts developed to perform an empirical study on Italian website compliance to GDPR.

The goals of the research conducted in this study are:
  1. Perform a large-scale measurements over most spread cookie banner on Italian domains.
  2. Develop an automatic GDPR violation detector tool.

The scripts developed to reach the defined goals have been implemented combining different existing  projects: Consent-O-Matic, CookieBlock, Cookiepedia and the IAB Transparency & Consent Framework. In particular, different Web Crawlers based on Node.js, Puppeteer and its Stealth Plugin have been developed to implement the **CMP Detector** and the **Automatic Violation Detector tool**. 

The CMP Detector is able to recognize 283 different cookie banners thanks to the co-operation of Consent-O-Matic and the IAB Transparency & Consent Framework.

The Automatic Violation Detector tool can recognize two different GDPR violations, **Cookies set at startup** and **User choices not respected**: this tool, using the crawler developed, automatically connects to the target website, interact with the cookie banner installed (if necessary) through Consent-O-Matic, downloads the cookies set and performs a classification with two different models: the first model is based on the CookieBlock XGB model, while the second one is based on Cookiepedia. In the end, a violation report is produced by comparing the user consents given at the beginning with the cookies purposes found after the classification process.

It is an open project developed in the University of Rome La Sapienza, so regular people can contribute to the research by adding code, documentation and support to other violations spread in the online scenario. 

> Note: this project uses on Consent-O-Matic: if some cookie banners are not supported, you need to add them to the Consent-O-Matic rules set!


## CMP DETECTOR

## AUTOMATIC GDPR VIOLATION DETECTION TOOL

## INSTALLATION

## REPOSITORY CONTENTS

## CREDITS
