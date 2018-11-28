const assert = require("assert");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const FormData = require("form-data");

describe("create", function() {
  let workers;
  let apiStub = sinon.stub();

  before(function() {

    workers = proxyquire("../../src/workers/workers", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })
  });

  it("builds a multipart formData", async function() {
    await workers.deploy({
      accountId: 12,
      name: "TEST_WORKER",
      script: "console.log(12)"
    });

    sinon.assert.calledWith(apiStub, sinon.match({
      body: sinon.match.instanceOf(FormData)
    }))
  });
});

describe("getSettings", function() {
  it("works with accountId", async function() {
    apiStub = sinon.stub();
    workers = proxyquire("../../src/workers/workers", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })

    await workers.getSettings({accountId: 11});
    sinon.assert.calledWith(apiStub, sinon.match({url: '/accounts/11/workers/settings'}));
  })

  it("works with zoneId", async function() {
    apiStub = sinon.stub();
    workers = proxyquire("../../src/workers/workers", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })

    await workers.getSettings({zoneId: 12});
    sinon.assert.calledWith(apiStub, sinon.match({url: '/zones/12/workers/settings'}));
  })

  it("defaults to accountId", async function() {
    apiStub = sinon.stub();
    workers = proxyquire("../../src/workers/workers", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })

    await workers.getSettings({accountId: 11, zoneId: 12});
    sinon.assert.calledWith(apiStub, sinon.match({url: '/accounts/11/workers/settings'}));
  })
})