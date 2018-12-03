const assert = require("assert");
const proxyquire = require("proxyquire");
const sinon = require("sinon");

describe("getFilters", function() {
  let filters;
  let apiStub = sinon.stub();

  before(function() {
    filters = proxyquire("../../src/workers/filters", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })
  });

  it("will use an ENV var for ZONE_ID", async function() {
    process.env.CLOUDFLARE_ZONE_ID = 1;
    await filters.getFilters();
    delete process.env.CLOUDFLARE_ZONE_ID;
    sinon.assert.calledWith(apiStub, sinon.match({url: "/zones/1/workers/filters"}));
  });
});

describe("deploy", function() {
  let filters;
  let apiStub = sinon.stub();

  before(function() {
    filters = proxyquire("../../src/workers/filters", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })
  })

  it("will use an ENV var for ZONE_ID", async function() {
    process.env.CLOUDFLARE_ZONE_ID = 1;
    const result = await filters.deploy({
      path: "/"
    });
    delete process.env.CLOUDFLARE_ZONE_ID;
    assert.equal(result.success, true);
  })
});

describe("remove", function() {
  let filters;
  let apiStub = sinon.stub();

  before(function() {
    filters = proxyquire("../../src/workers/filters", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })
  });

  it("will throw an error without a filter id", async function() {
    try {
      await filters.remove({});
      assert(false);
    } catch(e) {
      assert.equal(e, "You must specify a filter Id")
    }
  });

  it("will use an ENV var for zone ID", async function() {
    process.env.CLOUDFLARE_ZONE_ID = 199;
    await filters.remove({filterId: 1});
    delete process.env.CLOUDFLARE_ZONE_ID;
    sinon.assert.calledWith(apiStub, sinon.match({
      url: '/zones/199/workers/filters/1'
    }))
  })
});

describe("removeAllFilters", function() {
  let filters;
  let apiStub = sinon.stub();

  before(function() {
    filters = proxyquire("../../src/workers/filters", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })
  })

  it("calls remove for each filter", async function() {
    const filterStub = sinon.stub(filters, "getFilters").resolves({
      success: true,
      result: [{
        pattern: "/tset",
        id: "11",
        enabled: true
      }, {
        pattern: "/test",
        id: "12",
        enabled: true
      }]
    });

    const removeStub = sinon.stub(filters, "remove").resolves({success: true});

    await filters.removeAllFilters({zoneId: 1});
    sinon.assert.calledTwice(removeStub)
    filterStub.restore();
    removeStub.restore();
  });

  it("will use an ENV var for ZONE ID", async function() {
    const filterStub = sinon.stub(filters, "getFilters").resolves({
      success: true,
      result: [{
        pattern: "/",
        id: "12",
        enabled: true
      }]
    })

    process.env.CLOUDFLARE_ZONE_ID = 198;
    filters.removeAllFilters();
    delete process.env.CLOUDFLARE_ZONE_ID;
    sinon.assert.calledWith(filterStub, {zoneId: "198"})
    filters.getFilters.restore();
  });
});