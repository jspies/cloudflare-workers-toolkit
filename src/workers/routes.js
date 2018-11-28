const api = require("../api");

module.exports = {
  async getRoutes({zoneId} = {}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID;

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/routes`,
      method: 'GET',
      contentType: 'application/json'
    })
  }
}