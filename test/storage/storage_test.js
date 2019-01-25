const proxyquire =  require('proxyquire')
const assert = require('assert');
const sinon = require("sinon");

const GET_ACCOUNT_ID = 2;
const CREATE_ACCOUNT_ID = 1;

describe("isDuplicateNamespaceError", function() {
  let storage;

  before(function() {
    storage = require("../../src/storage/storage");
  });

  it("is a duplicate if the error code is 10014", function() {
    const result = {
      "success": false,
      "errors": [{
        "code": 10014
      }]
    }

    assert.equal(storage.isDuplicateNamespaceError(result), true)
  });

  it("is is false if there are other errors", function() {
    const result = {
      "success": false,
      "errors": [{
        "code": 10014
      }, {
        "code": "red"
      }]
    }

    assert.equal(storage.isDuplicateNamespaceError(result), false)
  });
});

describe("createNamespace", function() {
  let storage;
  before(function() {
    storage = proxyquire("../../src/storage/storage", {
      '../api': {
        'cfApiCall': function(options) {
          if (options.url == `/accounts/${CREATE_ACCOUNT_ID}/storage/kv/namespaces`) {
            return Promise.resolve({"success": true})
          } else {
            return Promise.resolve({"success": false})
          }
        }
      }
    });
  });

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
  let storage;
  let apiStub = sinon.stub();

  before(function() {
    storage = proxyquire("../../src/storage/storage", {
      '../api': {
        'cfApiCall': apiStub.resolves({
            "success": true,
            "result": [{id: 111}]
          })
      }
    });
  });

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

  it("returns the whole object if errored", async function() {
    const localstorage = proxyquire("../../src/storage/storage", {
      '../api': {
        'cfApiCall': apiStub.resolves({
            "success": false,
            "errors": ["Hi"]
          })
      }
    });
    const result = await localstorage.getNamespaces({accountId: 13});
    assert.equal(result.errors[0], "Hi")
  })

  it("uses the environment account Id if set", async function() {
    process.env.CLOUDFLARE_ACCOUNT_ID = 13;
    
    await storage.getNamespaces();
    sinon.assert.calledWith(apiStub, sinon.match({
      url: '/accounts/13/storage/kv/namespaces'
    }));
  
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    
  });
});

describe("removeNamespace", function() {
  let storage;
  let apiStub = sinon.stub();

  before(function() {
    storage = proxyquire("../../src/storage/storage", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [{
          "id": "namespace1",
          "title": "TESTING"
        }], "success": true})
      }
    });
  });

  it("errors without an account ID", async function() {
    try {
      await storage.removeNamespace({});
      assert(false);
    } catch(err) {
      assert.equal(err, "You must provide an account ID")
    }
  });

  it("accepts a namespace ID", async function() {
    apiStub.resetHistory();

    await storage.removeNamespace({
      accountId: 111,
      namespaceId: "q1"
    });

    sinon.assert.calledWith(apiStub, sinon.match({
      url: '/accounts/111/storage/kv/namespaces/q1'
    }))
  });

  it("errors without an namespaceID or name", async function() {
    try {
      await storage.removeNamespace({accountId: 1});
      assert(false);
    } catch(err) {
      assert.equal(err, "You must provide a namespace ID or name")
    }
  });

  it("throws an error if it cannot find the namespace by name", async function() {
    apiStub.resetHistory();

    try {
      await storage.removeNamespace({
        accountId: "hjk",
        name: "CANNOT_FIND_TESTING"
      })
      assert(false)
    } catch(e) {
      assert.equal(e, "Could not find the namespace")
    }
  });

  it("looks up a namespace by name", async function() {
    apiStub.resetHistory();

    await storage.removeNamespace({
      accountId: "hjk",
      name: "TESTING"
    })

    sinon.assert.calledWith(apiStub, sinon.match({
      url: '/accounts/hjk/storage/kv/namespaces/namespace1'
    }))
  });

  describe("setKey", function() {
    let storage;
    let apiStub = sinon.stub();

    before(function() {
      storage = proxyquire("../../src/storage/storage", {
        "../api": {
          cfApiCall: apiStub.resolves({"result": [{
            "id": "123",
            "title": "TESTING"
          }], "success": true})
        }
      });
    });

    it("returns an error if the namespace is not valid", async function() {
      apiStub.resetHistory();

      try {
        await storage.setKey({
          accountId: "hjk",
          namespace: "CANNOT_FIND_TESTING",
          key: "KEY",
          value: "VALUE"
        })
        assert(false)
      } catch(e) {
        assert.equal(e, "Could not find the namespace")
      }
    });

    it("errors without an namespaceID or name", async function() {
      try {
        await storage.setKey({accountId: 1});
        assert(false);
      } catch(err) {
        assert.equal(err, "You must provide a namespace ID or namespace")
      }
    });

    it("errors without an account ID", async function() {
      try {
        await storage.setKey({});
        assert(false);
      } catch(err) {
        assert.equal(err, "You must provide an account ID")
      }
    });

    it("calls the correct url", async function() {
      sinon.stub(storage, 'getNamespaces').resolves([
        {title: "myNamespace", id: 123}
      ]);
      const result = await storage.setKey({accountId: CREATE_ACCOUNT_ID, namespace: "myNamespace", key: "KEY", value: "VALUE"});
      assert.equal(result.success, true);
      storage.getNamespaces.restore();
    });

    it("accepts a namespace ID", async function() {
      apiStub.resetHistory();
  
      await storage.setKey({
        accountId: 111,
        namespaceId: "123",
        key: "KEY",
        value: "VALUE"
      });
  
      sinon.assert.calledWith(apiStub, sinon.match({
        url: '/accounts/111/storage/kv/namespaces/123/values/KEY'
      }))
    });
  });
});