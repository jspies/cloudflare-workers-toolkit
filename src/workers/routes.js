/**
 * Routes are used instead of filters for Multiscript enabled zones. The primary difference is that a filter runs the one script enabled on the zone whereas a route has a script assigned to it.
 */
const api = require("../api");

module.exports = {
  /**
   * Returns all existing routes for the zone
   * @param {*} options.zoneId
   */
  async getRoutes({zoneId} = {}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID;

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/routes`,
      method: 'GET',
      contentType: 'application/json'
    })
  },

  /**
   * Deploys a route to a script
   * @param {*} options
   * zoneId, path, scriptName
   */
  async deploy({zoneId, path, scriptName}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID;

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/routes`,
      method: 'POST',
      contentType: 'application/json',
      body: JSON.stringify({
        pattern: path,
        script: scriptName
      })
    })
  },

  async remove({zoneId, routeId}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID;

    if (!routeId) {
      throw("You must specify a route Id");
    }

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/routes/${routeId}`,
      method: 'DELETE'
    });
  }
}