/*
This module is the one that formats the cookies as the CookieBlock model requires.
INPUT:
  - cookies: list of cookies downloaded by the 'cookies_downloader.js' script
OUTPUT:
  - it writes in a JSON file the cookies in the CookieBlock format
*/

const fs = require('fs');
const path = require('path');

const names = [];
const formatted_cookies = [];

async function compileCookie( cookie ) {
  return new Promise((cookieolve, reject) => {
    //console.log( cookie['name'] );
    //console.log(cookie['sameSite']);
    cookie_name = cookie['name'];
    cookie_domain = cookie['domain'];
    cookie_path = cookie['path'];
    cookie_value = cookie['value'];
    cookie_expiry = cookie['expires'];
    cookie_session = cookie['session'];
    cookie_http_only = cookie['httpOnly'];
    cookie_secure = cookie['secure'];

    if ( cookie['sameSite'] ) {
      cookie_same_site = cookie['sameSite'];
    } else {
      cookie_same_site = 'None';
    }

    input_format = {
        "visit_id": 1,
        "name": cookie_name.toString(),
        "domain": cookie_domain.toString(),
        "path": cookie_path.toString(),
        "first_party_domain": "",
        "label": 0,
        "cmp_origin": 0,
        "variable_data": [
            {
            "value": cookie_value.toString(),
            "expiry": parseInt( cookie_expiry ),
            "session": cookie_session,
            "http_only": cookie_http_only,
            "host_only": true,
            "secure": cookie_secure,
            "same_site": cookie_same_site.toLowerCase()
            }
        ]
    };

    //console.log(input_format);
    resolve(input_format);
  });
}


async function formatCookies( url, cookies ) {
  return new Promise((cookieolve, reject) => {
    console.log( url );
    //const fileName = url.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
    const fileName = 'cookies_formatted/' + url + '.json';
    const filePath = path.join(__dirname, fileName);

    var i = 0;

    for ( i; i < cookies.length; i++ ) {
      //let compiledCookie = await compileCookie( cookies[i] );
      let cookie_name = cookies[i]['name'];
      let cookie_domain = cookies[i]['domain'];
      let cookie_path = cookies[i]['path'];
      let cookie_value = cookies[i]['value'];
      let cookie_expiry = cookies[i]['expires'];
      let cookie_session = cookies[i]['session'];
      let cookie_http_only = cookies[i]['httpOnly'];
      let cookie_secure = cookies[i]['secure'];

      if ( cookies[i]['sameSite'] ) {
        if ( cookies[i]['sameSite'] == 'None' ) {
          cookie_same_site = 'no_restriction';
        } else {
          cookie_same_site = cookies[i]['sameSite'];
        }
      } else {
        cookie_same_site = 'no_restriction';
      }

      let input_format = {
          "visit_id": 1,
          "name": cookie_name.toString(),
          "domain": cookie_domain.toString(),
          "path": cookie_path.toString(),
          "first_party_domain": "",
          "label": 0,
          "cmp_origin": 0,
          "variable_data": [
              {
              "value": cookie_value.toString(),
              "expiry": parseInt( cookie_expiry ),
              "session": cookie_session,
              "http_only": cookie_http_only,
              "host_only": true,
              "secure": cookie_secure,
              "same_site": cookie_same_site.toLowerCase()
              }
          ]
      };
        formatted_cookies.push( input_format );
        names.push( cookies[i]['name'] );
      }

      // Scrivi i cookies nel file
      writeCookiesInOutput( filePath, names, formatted_cookies );

      //console.log(formatted_cookies);
      //console.log(names);
    });
}



async function writeCookiesInOutput( filePath, names, formatted_cookies ) {
  const jsonOutput = {};
  //console.log(formatted_cookies);

  for (let i = 0; i < names.length; i++) {
    const key = `${names[i]}`;
    jsonOutput[key] = formatted_cookies[i];
  }

  //console.log(jsonOutput);

  const jsonString = JSON.stringify(jsonOutput, null, 2);

  fs.writeFileSync(filePath, jsonString, 'utf-8');
}

module.exports = formatCookies;