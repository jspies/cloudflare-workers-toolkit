const assert = require("assert");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const FormData = require("form-data");
const fs = require("fs");

describe("deploy", function() {
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
    apiStub.resetHistory();

    await workers.deploy({
      accountId: 12,
      name: "TEST_WORKER",
      script: "console.log(12)"
    });

    sinon.assert.calledWith(apiStub, sinon.match({
      body: sinon.match.instanceOf(FormData)
    }))
  });

  it("defaults to account level", async function() {
    apiStub.resetHistory();

    process.env.CLOUDFLARE_ACCOUNT_ID = 12;
    await workers.deploy({
      name: "TEST",
      script: "console.log"
    });

    delete process.env.CLOUDFLARE_ACCOUNT_ID;

    sinon.assert.calledWith(apiStub, sinon.match({
      url: '/accounts/12/workers/scripts/TEST'
    }))
  });

  it("prefers account level", async function() {
    apiStub.resetHistory();

    process.env.CLOUDFLARE_ACCOUNT_ID = 12;
    process.env.CLOUDFLARE_ZONE_ID = 10;

    await workers.deploy({
      name: "TEST",
      script: "console.log"
    });

    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_ZONE_ID;

    sinon.assert.calledWith(apiStub, sinon.match({
      url: '/accounts/12/workers/scripts/TEST'
    }))
  })

  it("supports zoneId for single script customers", async function() {
    apiStub.resetHistory();

    await workers.deploy({
      zoneId: 15,
      script: "console.log"
    });

    sinon.assert.calledWith(apiStub, sinon.match({
      url: '/zones/15/workers/script'
    }))
  });

  it("handles bad wasm data", async function() {
    apiStub.resetHistory();

    await workers.deploy({
      zoneId: 15,
      script: "console.log",
      wasm: null
    });
    
    sinon.assert.calledWith(apiStub, sinon.match({
      body: sinon.match.instanceOf(FormData)
    }))
  });

  it("supports wasm in form data", async function() {
    
    apiStub.resetHistory();

    await workers.deploy({
      zoneId: 15,
      script: "console.log",
      wasm: [process.cwd() + "/test/fixtures/wasm_script.wasm"]
    });
    
    sinon.assert.calledWith(apiStub, sinon.match({
      body: {
        _streams: sinon.match.some(sinon.match(/wasm_script/))
      }
    }));
    
  });

  it("throws an error if wasm is not a string", async function() {
    apiStub.resetHistory();

    try {
      await workers.deploy({
        zoneId: 15,
        script: "console.log",
        wasm: [1]
      });
      assert(false);
    } catch(e) {
      assert.equal(e, "WASM should be a string file name");
    }
  });
});

describe("remove", function() {
  it("works with accountId", async function() {
    apiStub = sinon.stub();
    workers = proxyquire("../../src/workers/workers", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })

    await workers.remove({accountId: 11, name: "test"});
    sinon.assert.calledWith(apiStub, sinon.match({url: '/accounts/11/workers/scripts/test'}));
  })

  it("works with zoneId", async function() {
    apiStub = sinon.stub();
    workers = proxyquire("../../src/workers/workers", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })

    await workers.remove({zoneId: 12});
    sinon.assert.calledWith(apiStub, sinon.match({url: '/zones/12/workers/script'}));
  })

  it("throws an error if there is no zone id or name since accountId requires script name", async function() {
    try {
      await workers.remove({})
      assert(false);
    } catch(e) {
      assert.equal(e, "You must provide a script name")
    }
  })
});

describe("getSettings", function() {
  let apiStub;
  let workers;
  
  before(function() {
    apiStub = sinon.stub();
    workers = proxyquire("../../src/workers/workers", {
      "../api": {
        cfApiCall: apiStub.resolves({"result": [], "success": true})
      }
    })
  })

  it("works with accountId", async function() {
    apiStub.resetHistory();

    await workers.getSettings({accountId: 11});
    sinon.assert.calledWith(apiStub, sinon.match({url: '/accounts/11/workers/settings'}));
  })

  it("works with zoneId", async function() {
    apiStub.resetHistory();

    await workers.getSettings({zoneId: 12});
    sinon.assert.calledWith(apiStub, sinon.match({url: '/zones/12/workers/settings'}));
  })

  it("defaults to accountId", async function() {
    apiStub.resetHistory();

    await workers.getSettings({accountId: 11, zoneId: 12});
    sinon.assert.calledWith(apiStub, sinon.match({url: '/accounts/11/workers/settings'}));
  })

  it("uses the ACCOUNT_ID ENV VAR", async function() {
    apiStub.resetHistory();

    process.env.CLOUDFLARE_ACCOUNT_ID = 111;
    await workers.getSettings();
    sinon.assert.calledWith(apiStub, sinon.match({url: '/accounts/111/workers/settings'}));
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
  })
})