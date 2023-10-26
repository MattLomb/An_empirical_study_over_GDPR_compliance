const fs = require('fs');
const path = require('path');

const names = [];
const formatted_cookies = [];

// Funzione per leggere un file riga per riga e cookietituire le righe come un array
async function formatCookies( url, cookies ) {
  return new Promise((cookieolve, reject) => {
    //const fileName = url.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
    const fileName = url + '.json';
    const filePath = path.join(__dirname, fileName);

    var i = 0;

    for ( i; i < cookies.length; i++ ) {
      compileCookie( cookies[i] );
    }

    // Scrivi i cookies nel file
    fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2), 'utf-8');
  });
}

async function compileCookie( cookie ) {
  console.log( cookie );
  cookie_name = cookie['name']
  cookie_domain = cookie['domain']
  cookie_path = cookie['path']
  cookie_value = cookie['value']
  cookie_expiry = cookie['expiry']
  cookie_session = cookie['session']
  cookie_http_only = cookie['httpOnly']
  cookie_secure = cookie['secure']
  cookie_same_site = cookie['sameSite']

  input_format = {
      "visit_id": 1,
      "name": str(cookie_name),
      "domain": str(cookie_domain),
      "path": str(cookie_path),
      "first_party_domain": "",
      "label": 0,
      "cmp_origin": 0,
      "variable_data": [
          {
          "value": str(cookie_value),
          "expiry": int(cookie_expiry),
          "session": cookie_session,
          "http_only": cookie_http_only,
          "host_only": True,
          "secure": cookie_secure,
          "same_site": cookie_same_site.lower()
          }
      ]
  }
  return input_format
}

module.exports = formatCookies;