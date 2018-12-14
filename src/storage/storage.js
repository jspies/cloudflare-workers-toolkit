const api = require('../api');
const { isUUID } = require('../uuid');
const { isApiSuccess, getResult } = require('../api_handler');

async function getAccountInfo({ accountId, name }) {
  const account = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!account) {
    throw 'You must provide an account ID';
  }

  if (!name) {
    return { account };
  }

  const nameSpaceId = !isUUID(name)
    ? await getNamespaceByName({
        accountId: account,
        name: name
      })
    : name;

  if (!nameSpaceId) {
    throw 'Name space does not exist';
  }
  return { account, nameSpaceId };
}

/**
 * Returns true if this is a Duplicate Namespace Error
 * @param {*} result Result from a createNamespace call
 */
function isDuplicateNamespaceError(result) {
  return (
    result &&
    result.success == false &&
    result.errors.length == 1 &&
    result.errors[0].code == 10014
  );
}

/**
 * Attempts to create a namespace for the account
 * @param {*} accountId
 * @param {*} name
 */
async function createNamespace({ accountId, name }) {
  const { account } = await getAccountInfo({ accountId });

  const result = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces`,
    method: `POST`,
    contentType: `application/json`,
    body: JSON.stringify({
      title: name
    })
  });

  return result;
}

/**
 * Gets namespaces associated with the account
 * @param {*} options
 */
async function getNamespaces({ accountId } = {}) {
  const { account } = await getAccountInfo({ accountId });

  let response = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces`,
    method: 'GET'
  });

  return isApiSuccess(response) ? getResult(response) : response;
}

/**
 * Get a namespace id by name
 * @param {*} options
 */
async function getNamespaceByName({ accountId, name }) {
  const { account } = await getAccountInfo({ accountId });
  let namespaceId = '';

  const namespaces = await getNamespaces({ accountId: account });

  const namespace = namespaces.find(namespace => {
    return namespace.title === name;
  });
  if (namespace) {
    namespaceId = namespace.id;
  }

  return namespaceId;
}

/**
 * Updates a namespace by Id. Will also look up a namespace by name and update.
 * @param {*} options
 */
async function editNamespace({ accountId, name, newName }) {
  if (!name) {
    throw 'You must provide a namespace ID or name';
  }
  const { account, nameSpaceId } = await getAccountInfo({ accountId, name });

  const result = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}`,
    method: 'PUT',
    contentType: `application/json`,
    body: JSON.stringify({
      title: newName
    })
  });

  return result;
}

/**
 * Removes a namespace by Id. Will also look up a namespace by name and remove.
 * @param {*} options
 */
async function removeNamespace({ accountId, name }) {
  if (!name) {
    throw 'You must provide a namespace ID or name';
  }

  const { account, nameSpaceId } = await getAccountInfo({ accountId, name });
  const result = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${nameSpaceId}`,
    method: 'DELETE'
  });

  return result;
}

module.exports = {
  getNamespaceByName,
  isDuplicateNamespaceError,
  createNamespace,
  getNamespaces,
  editNamespace,
  removeNamespace
};
