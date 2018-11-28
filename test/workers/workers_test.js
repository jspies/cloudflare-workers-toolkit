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