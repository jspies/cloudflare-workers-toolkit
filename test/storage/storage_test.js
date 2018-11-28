const proxyquire =  require('proxyquire')
const assert = require('assert');

const GET_ACCOUNT_ID = 2;
const CREATE_ACCOUNT_ID = 1;

const storage = proxyquire("../../src/storage/storage", {
  '../api': {
    'cfApiCall': function(options) {
      if (options.url == `/accounts/${CREATE_ACCOUNT_ID}/storage/kv/namespaces`) {
        return Promise.resolve({"success": true})
      } else if(options.url.match('duplicate')) {
        return Promise.resolve({"success": false, "errors": [{
          "code": 10014,
          "message": "a namespace with this account ID and title already exists"
        }]})
      } else if (options.url == `/accounts/${GET_ACCOUNT_ID}/storage/kv/namespaces`) {
        return Promise.resolve({
          "success": true,
          "result": [{id: 111}]
        })
      } else {
        return Promise.resolve({"success": false})
      }
    }
  }
});

describe("createNamespace", function() {
  it("calls the correct url", async function() {
    const result = await storage.createNamespace({accountId: CREATE_ACCOUNT_ID, name: "myNamespace"});
    assert.equal(result.success, true)
  });

  it("errors without an account Id", async function() {
    try {
      await storage.createNamespace({name: "namespace"});
      assert(false);
    } catch(err) {
      assert.equal(err, "You must provide an account ID")
    }
  });
});

describe("getNamespaces", function() {
  it("returns the results without meta data on success", async function() {
    const result = await storage.getNamespaces({accountId: GET_ACCOUNT_ID});
    assert.deepEqual(result, [{id: 111}])
  });

  it("errors without an account ID", async function() {
    try {
      await storage.getNamespaces({});
      assert(false);
    } catch(err) {
      assert.equal(err, "You must provide an account ID")
    }
  });

  it("uses the environment account Id if set", async function() {
    process.env.CLOUDFLARE_ACCOUNT_ID = 13;
    try {
      await storage.getNamespaces();
      assert(true);
    } catch (e) {
      assert(false);
    } finally {
      delete process.env.CLOUDFLARE_ACCOUNT_ID;
    }
  });
});