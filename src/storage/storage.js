const api = require('../api');

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
  accountId = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!accountId) {
    throw 'You must provide an account ID';
  }

  const result = await api.cfApiCall({
    url: `/accounts/${accountId}/storage/kv/namespaces`,
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
  accountId = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!accountId) {
    throw 'You must provide an account ID';
  }

  let result = await api.cfApiCall({
    url: `/accounts/${accountId}/storage/kv/namespaces`,
    method: 'GET'
  });

  if (result.success && result.result) {
    result = result.result;
  }

  return result;
}

/**
 * Get a namespace id by name
 * @param {*} options
 */
async function getNamespaceByName({ accountId, name }) {
  const account = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
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
  let account = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!account) {
    throw 'You must provide an account ID';
  }

  if (!name) {
    throw 'You must provide a namespace ID or name';
  }

  const namespaceId = await getNamespaceByName({
    accountId: account,
    name
  });

  if (!namespaceId) {
    throw 'Could not find the namespace';
  }

  const result = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${namespaceId}`,
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
  let account = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!account) {
    throw 'You must provide an account ID';
  }

  if (!name) {
    throw 'You must provide a namespace ID or name';
  }

  const namespaceId = await getNamespaceByName({
    accountId: account,
    name
  });

  if (!namespaceId) {
    throw 'Could not find the namespace';
  }

  const result = await api.cfApiCall({
    url: `/accounts/${account}/storage/kv/namespaces/${namespaceId}`,
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
