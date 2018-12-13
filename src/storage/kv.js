const api = require('../api');
const { getNamespaceByName } = require('./storage');
const { isUUID } = require('../common');

/**
 * Gets namespaces associated with the account
 * @param {*} options
 */
async function getKeys({ accountId, nameSpace } = {}) {
  const account = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!account) {
    throw 'You must provide an account ID';
  }

  const nameSpaceId = !isUUID(nameSpace)
    ? await getNamespaceByName({
        accountId: account,
        name: nameSpace
      })
    : nameSpace;

  if (!nameSpaceId) {
    throw 'Name space does not exist';
  }

  let result = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}/keys`,
    method: 'GET'
  });

  if (result.success && result.result) {
    result = result.result;
  }

  return result;
}

/**
 * Gets namespaces associated with the account
 * @param {*} options
 */
async function getAllKeysAndValues({ accountId, nameSpace } = {}) {
  const account = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!account) {
    throw 'You must provide an account ID';
  }

  const nameSpaceId = !isUUID(nameSpace)
    ? await getNamespaceByName({
        accountId: account,
        name: nameSpace
      })
    : nameSpace;

  if (!nameSpaceId) {
    throw 'Name space does not exist';
  }

  const keys = await getKeys({
    accountId: account,
    nameSpace: nameSpaceId
  });

  const result = [];
  for (const key of keys) {
    const value = await getKeyValue({
      accountId: account,
      nameSpace: nameSpaceId,
      key: key.name
    });
    result.push({ key: key.name, value }).result;
  }

  return result;
}

/**
 * Gets namespaces associated with the account
 * @param {*} options
 */
async function getKeyValue({ accountId, nameSpace, key } = {}) {
  const account = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!account) {
    throw 'You must provide an account ID';
  }

  if (!key) {
    throw 'You must provide a key';
  }

  const nameSpaceId = !isUUID(nameSpace)
    ? await getNamespaceByName({
        accountId: account,
        name: nameSpace
      })
    : nameSpace;

  if (!nameSpaceId) {
    throw 'Name space does not exist';
  }

  let result = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}/values/${key}`,
    method: 'GET'
  });

  if (result.success && result.result) {
    result = result.result;
  }

  return result;
}

/**
 * Gets namespaces associated with the account
 * @param {*} options
 */
async function setKeyValue({ accountId, nameSpace, key, value } = {}) {
  const account = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!account) {
    throw 'You must provide an account ID';
  }

  if (!key) {
    throw 'You must provide a key';
  }

  if (!value) {
    throw 'You must provide a value';
  }

  const nameSpaceId = !isUUID(nameSpace)
    ? await getNamespaceByName({
        accountId: account,
        name: nameSpace
      })
    : nameSpace;

  if (!nameSpaceId) {
    throw 'Name space does not exist';
  }

  let result = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}/values/${key}`,
    method: 'PUT',
    contentType: `application/json`,
    body: JSON.stringify(value)
  });

  if (result.success && result.result) {
    result = result.result;
  }

  return result;
}

/**
 * Gets namespaces associated with the account
 * @param {*} options
 */
async function deleteKey({ accountId, nameSpace, key } = {}) {
  const account = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!account) {
    throw 'You must provide an account ID';
  }

  if (!key) {
    throw 'You must provide a key';
  }

  const nameSpaceId = !isUUID(nameSpace)
    ? await getNamespaceByName({
        accountId: account,
        name: nameSpace
      })
    : nameSpace;

  if (!nameSpaceId) {
    throw 'Name space does not exist';
  }

  let result = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}/values/${key}`,
    method: 'DELETE'
  });

  if (result.success && result.result) {
    result = result.result;
  }

  return result;
}
module.exports = {
  getKeys,
  getKeyValue,
  getAllKeysAndValues,
  setKeyValue,
  deleteKey
};
