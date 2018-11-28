const api = require("../api");
const FormData = require('form-data');

module.exports = {
  
  /**
   * Deploys a worker
   * @param {*} options
   */
  async deploy({accountId, name, script, bindings}) {

    const formData = new FormData();
    formData.append('metadata', JSON.stringify({
      "body_part": "script",
      "bindings": bindings
    }));

    formData.append('script', script);

    return await api.cfApiCall({
      url: `/accounts/${accountId}/workers/scripts/${name}`,
      method: `PUT`,
      body: formData
    });
  },

  async getSettings({zoneId, accountId} = {}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID;
    accountId = accountId || process.CLOUDFLARE_ACCOUNT_ID;

    let url;

    if (accountId) {
      url = `/accounts/${accountId}/workers/settings`
    } else {
      url = `/zones/${zoneId}/workers/settings`
    }

    const result = await api.cfApiCall({
      url,
      method: 'GET'
    })

    return result;
  }
}