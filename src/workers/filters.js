/**
 * Filters are used to turn workers on and off for a path in Single Script environments
 */
const api = require("../api");

module.exports = {
  
  /**
   * getFilters returns all defined filters for a zone and their enabled status
   * Will default to CLOUDFLARE_ZONE_ID
   * @param {*} {zoneId}
   */
  async getFilters({zoneId} = {}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID;

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/filters`,
      method: 'GET',
      contentType: 'application/json'
    })
  },

  /**
   * Will turn the single script worker on for the specified path
   * @param {*} options (zoneId, path) 
   */
  async deploy({zoneId, path}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID;

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/filters`,
      method: 'POST',
      contentType: 'application/json',
      body: JSON.stringify({
        pattern: path,
        enabled: true
      })
    })
  },

  /**
   * Removes all filters on the zone.
   * @param {*} param0 
   */
  async removeAllFilters({zoneId} = {}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID;

    let filters = await this.getFilters({zoneId});
    filters = filters.result;

    let results = [];

    for (let filter of filters) {
      const result = await this.remove({zoneId, filterId: filter.id})
      results.push(result);
    }

    return results;
  },

  /**
   * Removes the specified filter. Ids can be found using getFilters.
   * @param {*} {zoneId, filterId}
   */
  async remove({zoneId, filterId}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID;

    if (!filterId) {
      throw("You must specify a filter Id");
    }

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/filters/${filterId}`,
      method: 'DELETE'
    });
  }
}