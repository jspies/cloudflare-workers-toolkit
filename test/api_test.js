const assert = require("assert");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
//const fetch = require("node-fetch");

describe("cfApiCall", function() {
  let api;
  let fetchStub;

  before(function() {
    fetchStub = sinon.stub()
    api = proxyquire("../src/api", {
      "node-fetch": fetchStub.resolves({
        json: function() { return {}}
      })
    });
  });

  it("adds the default base url to the url", async function() {

    let url = "/nobasehere";

    await api.cfApiCall({
      url
    });
    sinon.assert.calledWith(fetchStub, `https://api.cloudflare.com/client/v4${url}`)
  });
});