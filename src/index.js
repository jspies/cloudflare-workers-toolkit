const storage = require("./storage/storage");
const workers = require("./workers/workers");
const routes = require("./workers/routes");
const filters = require("./workers/filters");

module.exports = {
  storage,
  workers,
  routes,
  filters,
  setZoneId: function(zoneId) {
    process.env.CLOUDFLARE_ZONE_ID = zoneId;
  },
  setAccountId: function(accountId) {
    process.env.CLOUDFLARE_ACCOUNT_ID = accountId;
  }
}