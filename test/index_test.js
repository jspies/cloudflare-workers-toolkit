const assert = require("assert");
const cf = require("../src");

describe("setAccountId", function() {
  it("sets the CLOUDFLARE_ACCOUNT_ID ENV VAR", function() {
    process.env.CLOUDFLARE_ACCOUNT_ID = null;
    cf.setAccountId(13);
    assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID, 13);
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
  });
});

describe("setZoneId", function() {
  it("sets the CLOUDFLARE_ZONE_ID ENV VAR", function() {
    process.env.CLOUDFLARE_ZONE_ID = null;
    cf.setZoneId(11);
    assert.equal(process.env.CLOUDFLARE_ZONE_ID, 11);
    delete process.env.CLOUDFLARE_ZONE_ID;
  });
});