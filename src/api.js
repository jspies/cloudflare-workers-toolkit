const HttpsProxyAgent = require('https-proxy-agent');
const fetch = require('node-fetch');

/**
 * General Wrapper for making API calls to Cloudflare
 * 
 * @param {*} options
 */
const cfApiCall = async ({ url, method, contentType = null, body = null }) => {
  if (url.substring(0, 8) !== "https://") {
    url = `https://api.cloudflare.com/client/v4${url}`;
  }
  
  let options = {
    headers: {
      "X-Auth-Email": process.env.CLOUDFLARE_AUTH_EMAIL,
      "X-Auth-Key": process.env.CLOUDFLARE_AUTH_KEY
    },
    method: method
  };

  if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY){
    options.agent = new HttpsProxyAgent(process.env.HTTPS_PROXY || process.env.HTTP_PROXY);
  }

  if (contentType) {
    options["headers"]["Content-Type"] = contentType;
  }
  if (body) {
    options["body"] = body;
  }
  return await fetch(url, options).then(responseBody => responseBody.json());
};

module.exports = {
  cfApiCall
}