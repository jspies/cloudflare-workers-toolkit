const proxyquire = require('proxyquire');
const assert = require('assert');
const sinon = require('sinon');

const ACCOUNT_ID = 1;

describe('KV STORAGE: getKeys', function() {
  let kv;
  let apiStub = sinon.stub();
  let storageStub = sinon.stub();

  before(function() {
    kv = proxyquire('../../src/storage/kv', {
      '../api': {
        cfApiCall: apiStub.resolves({
          success: true,
          result: [{ name: 'abc' }, { name: 'ab' }]
        })
      },
      './storage': {
        getNamespaceByName: storageStub.resolves('12345')
      }
    });
  });

  it('Get keys with name space name', async function() {
    const result = await kv.getKeys({
      accountId: ACCOUNT_ID,
      nameSpace: 'myNamespace'
    });
    assert.equal(result.length === 2, true);
    assert.deepEqual(result, [{ name: 'abc' }, { name: 'ab' }]);
  });

  it('Get keys with name space id', async function() {
    const result = await kv.getKeys({
      accountId: ACCOUNT_ID,
      nameSpace: '039762c2-fef7-11e8-8eb2-f2801f1b9fd1'
    });
    assert.equal(result.length === 2, true);
    assert.deepEqual(result, [{ name: 'abc' }, { name: 'ab' }]);
  });
});

describe('KV STORAGE: getKeyValue', function() {
  let kv;
  let apiStub = sinon.stub();
  let storageStub = sinon.stub();

  before(function() {
    kv = proxyquire('../../src/storage/kv', {
      '../api': {
        cfApiCall: apiStub.resolves({
          success: true,
          result: '1'
        })
      },
      './storage': {
        getNamespaceByName: storageStub.resolves('12345')
      }
    });
  });

  it('Get value of a key with name space name', async function() {
    const result = await kv.getKeyValue({
      accountId: ACCOUNT_ID,
      nameSpace: 'myNamespace',
      key: 'abc'
    });
    assert.equal(result, '1');
  });

  it('Get value of a key with name space id', async function() {
    const result = await kv.getKeyValue({
      accountId: ACCOUNT_ID,
      nameSpace: '039762c2-fef7-11e8-8eb2-f2801f1b9fd1',
      key: 'ab'
    });
    assert.equal(result, '1');
  });
});

describe('KV STORAGE: getAllKeysAndValues', function() {
  let kv;
  let storageStub = sinon.stub();

  before(function() {
    kv = proxyquire('../../src/storage/kv', {
      '../api': {
        cfApiCall: ({ url }) => {
          if (url === '/accounts/1/storage/kv/namespaces/12345/keys') {
            return {
              success: true,
              result: [{ name: 'abc' }, { name: 'ab' }]
            };
          } else if (
            url === '/accounts/1/storage/kv/namespaces/12345/values/abc'
          ) {
            return {
              success: true,
              result: '1'
            };
          }
          return {
            success: true,
            result: '2'
          };
        }
      },
      './storage': {
        getNamespaceByName: storageStub.resolves('12345')
      }
    });
  });

  it('Get value of all keys with name space name', async function() {
    const result = await kv.getAllKeysAndValues({
      accountId: ACCOUNT_ID,
      nameSpace: 'myNamespace'
    });
    assert.deepEqual(result, [
      { key: 'abc', value: '1' },
      { key: 'ab', value: '2' }
    ]);
  });

  it('Get value of all key with name space id', async function() {
    const result = await kv.getAllKeysAndValues({
      accountId: ACCOUNT_ID,
      nameSpace: 'myNamespace'
    });
    assert.deepEqual(result, [
      { key: 'abc', value: '1' },
      { key: 'ab', value: '2' }
    ]);
  });
});

describe('KV STORAGE: setKeyValue', function() {
  let kv;
  let apiStub = sinon.stub();
  let storageStub = sinon.stub();

  before(function() {
    kv = proxyquire('../../src/storage/kv', {
      '../api': {
        cfApiCall: apiStub.resolves({
          success: true,
          result: { name: 'abc', value: 'value' }
        })
      },
      './storage': {
        getNamespaceByName: storageStub.resolves('12345')
      }
    });
  });

  it('Set value of a key with name space name', async function() {
    const result = await kv.setKeyValue({
      accountId: ACCOUNT_ID,
      nameSpace: 'myNamespace',
      key: 'abc',
      value: 'value'
    });
    assert.deepEqual(result, { name: 'abc', value: 'value' });
  });

  it('Set value of a key with name space id', async function() {
    const result = await kv.getKeyValue({
      accountId: ACCOUNT_ID,
      nameSpace: '039762c2-fef7-11e8-8eb2-f2801f1b9fd1',
      key: 'abc',
      value: 'value'
    });
    assert.deepEqual(result, { name: 'abc', value: 'value' });
  });
});

describe('KV STORAGE: deleteKey', function() {
  let kv;
  let apiStub = sinon.stub();
  let storageStub = sinon.stub();

  before(function() {
    kv = proxyquire('../../src/storage/kv', {
      '../api': {
        cfApiCall: apiStub.resolves({
          success: true,
          result: 'deleted'
        })
      },
      './storage': {
        getNamespaceByName: storageStub.resolves('12345')
      }
    });
  });

  it('Delete a key with name space name', async function() {
    const result = await kv.deleteKey({
      accountId: ACCOUNT_ID,
      nameSpace: 'myNamespace',
      key: 'abc'
    });
    assert.equal(result, 'deleted');
  });

  it('Derlete a key with name space id', async function() {
    const result = await kv.deleteKey({
      accountId: ACCOUNT_ID,
      nameSpace: '039762c2-fef7-11e8-8eb2-f2801f1b9fd1',
      key: 'abc'
    });
    assert.equal(result, 'deleted');
  });
});
