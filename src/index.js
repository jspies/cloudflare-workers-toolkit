const storage = require("./storage/storage");
const workers = require("./workers/workers");

module.exports = {
  storage,
  workers,
  setAccountId: function(accountId) {
    process.env.CLOUDFLARE_ACCOUNT_ID = accountId;
  }
}