const assert = require("assert");
const proxyquire = require("proxyquire");
const sinon = require("sinon");

describe("getRoutes", function() {
  let routes;
  let apiStub = sinon.stub();

  before(function() {
    routes = proxyquire("../../src/workers/routes", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })
  });

  it("will use an ENV var for ZONE_ID", async function() {
    process.env.CLOUDFLARE_ZONE_ID = 1;
    const result = await routes.getRoutes();
    delete process.env.CLOUDFLARE_ZONE_ID;
    assert.equal(result.success, true);
  });
});

describe("deploy", function() {
  let routes;
  let apiStub = sinon.stub();

  before(function() {
    routes = proxyquire("../../src/workers/routes", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })
  })

  it("will use an ENV var for ZONE_ID", async function() {
    process.env.CLOUDFLARE_ZONE_ID = 1;
    const result = await routes.deploy({
      path: "/",
      scriptName: "Test"
    });
    delete process.env.CLOUDFLARE_ZONE_ID;
    assert.equal(result.success, true);
  })
});

describe("remove", function() {
  let routes;
  let apiStub = sinon.stub();

  before(function() {
    routes = proxyquire("../../src/workers/routes", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })
  });

  it("will throw an error without a route id", async function() {
    try {
      await routes.remove({});
      assert(false);
    } catch(e) {
      assert.equal(e, "You must specify a route Id")
    }
  });

  it("will use an ENV var for zone ID", async function() {
    process.env.CLOUDFLARE_ZONE_ID = 199;
    await routes.remove({routeId: 1});
    delete process.env.CLOUDFLARE_ZONE_ID;
    sinon.assert.calledWith(apiStub, sinon.match({
      url: '/zones/199/workers/routes/1'
    }))
  })
})