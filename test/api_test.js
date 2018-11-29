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
    fetchStub.resetHistory();
    let url = "/nobasehere";

    await api.cfApiCall({
      url
    });
    sinon.assert.calledWith(fetchStub, `https://api.cloudflare.com/client/v4${url}`)
  });

  it("allows a full URL", async function() {
    fetchStub.resetHistory();
    let url = "https://www.google.com";

    await api.cfApiCall({
      url
    });
    sinon.assert.calledWith(fetchStub, `https://www.google.com`)
  });

  it("adds the Content Type header", async function() {
    fetchStub.resetHistory();
    await api.cfApiCall({
      url: "/nobasehere_either",
      contentType: "application/engineer"
    });
    sinon.assert.calledWith(fetchStub, sinon.match.any, sinon.match({
      headers: {"Content-Type": "application/engineer"}
    }))
  });

  it("adds the body", async function() {
    let body = JSON.stringify({});

    fetchStub.resetHistory();
    await api.cfApiCall({
      url: "/nobasehere_either",
      body
    });
    sinon.assert.calledWith(fetchStub, sinon.match.any, sinon.match({
      body
    }))
  })
});