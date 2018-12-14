const api = require('../api');
const { getNamespaceByName } = require('./storage');
const { isUUID } = require('../uuid');
const { isApiSuccess, getResult } = require('../api_handler');

async function getAccountInfo({ accountId, nameSpace }) {
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
  return { account, nameSpaceId };
}

/**
 * Gets keys in a name space
 * @param {*} options
 */
async function getKeys({ accountId, nameSpace } = {}) {
  const { account, nameSpaceId } = await getAccountInfo({
    accountId,
    nameSpace
  });

  let response = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}/keys`,
    method: 'GET'
  });

  return isApiSuccess(response) ? getResult(response) : response;
}

/**
 * Gets all keys and value in the name spaces.
 * WARNING: This method can take long, if you have a lot of keys present in the name space.
 * @param {*} options
 */
async function getAllKeysAndValues({ accountId, nameSpace } = {}) {
  const { account, nameSpaceId } = await getAccountInfo({
    accountId,
    nameSpace
  });

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
 * Gets value of a key
 * @param {*} options
 */
async function getKeyValue({ accountId, nameSpace, key } = {}) {
  const { account, nameSpaceId } = await getAccountInfo({
    accountId,
    nameSpace
  });

  if (!key) {
    throw 'You must provide a key';
  }

  let response = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}/values/${key}`,
    method: 'GET'
  });

  return isApiSuccess(response) ? getResult(response) : response;
}

/**
 * Set value of a key
 * @param {*} options
 */
async function setKeyValue({ accountId, nameSpace, key, value } = {}) {
  const { account, nameSpaceId } = await getAccountInfo({
    accountId,
    nameSpace
  });

  if (!key) {
    throw 'You must provide a key';
  }

  if (!value) {
    throw 'You must provide a value';
  }

  let response = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}/values/${key}`,
    method: 'PUT',
    contentType: `application/json`,
    body: JSON.stringify(value)
  });

  return isApiSuccess(response) ? getResult(response) : response;
}

/**
 * Delete a key
 * @param {*} options
 */
async function deleteKey({ accountId, nameSpace, key } = {}) {
  const { account, nameSpaceId } = await getAccountInfo({
    accountId,
    nameSpace
  });

  if (!key) {
    throw 'You must provide a key';
  }

  let response = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}/values/${key}`,
    method: 'DELETE'
  });

  return isApiSuccess(response) ? getResult(response) : response;
}

module.exports = {
  getKeys,
  getKeyValue,
  getAllKeysAndValues,
  setKeyValue,
  deleteKey
};
