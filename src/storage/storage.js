const api = require("../api");

module.exports = {
  /**
   * Returns true if this is a Duplicate Namespace Error
   * @param {*} result Result from a createNamespace call
   */
  isDuplicateNamespaceError(result) {
    return (result && result.success == false && result.errors.length == 1 && result.errors[0].code == 10014);
  },

  /**
   * Attempts to create a namespace for the account
   * @param {*} accountId 
   * @param {*} name 
   */
  async createNamespace({accountId, name}) {
    accountId = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!accountId) {
      throw("You must provide an account ID");
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
  },

  /**
   * Gets namespaces associated with the account
   * @param {*} options
   */
  async getNamespaces({accountId} = {}) {
    accountId = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!accountId) {
      throw("You must provide an account ID");
    }

    let result = await api.cfApiCall({
      url: `/accounts/${accountId}/storage/kv/namespaces`,
      method: 'GET'
    });

    if (result.success && result.result) {
      result = result.result;
    }

    return result;
  },

  /**
   * Removes a namespace by Id. Will also look up a namespace by name and remove.
   * @param {*} options
   */
  async removeNamespace({accountId, name, namespaceId}) {
    accountId = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!accountId) {
      throw("You must provide an account ID");
    }

    if (!namespaceId && !name) {
      throw("You must provide a namespace ID or name");
    }

    if (!namespaceId && name) {
      const namespaces = await this.getNamespaces({accountId});

      const namespace = namespaces.find(namespace => {
        return namespace.title === name;
      });
      if (namespace) {
        namespaceId = namespace.id;
      }
    }

    if (!namespaceId) {
      throw("Could not find the namespace");
    }

    const result = await api.cfApiCall({
      url: `/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`,
      method: 'DELETE'
    });

    return result;
  },

  /**
   * Will set the value for a key in the namespace
   * If namespaceId is not provided, namespace will be used to look up the namespaceId
   */
  async setKey({key, value, accountId, namespace, namespaceId}) {
    accountId = accountId || process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!accountId) {
      throw("You must provide an account ID");
    }

    if (!namespaceId && !namespace) {
      throw("You must provide a namespace ID or namespace");
    }

    if (!namespaceId && namespace) {
      const namespaces = await this.getNamespaces({accountId});

      const foundNamespace = namespaces.find(_namespace => {
        return _namespace.title === namespace;
      });

      if (foundNamespace) {
        namespaceId = foundNamespace.id;
      } else {
        throw("Could not find the namespace");
      }
    }

    const result = await api.cfApiCall({
      url: `/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`,
      method: 'PUT',
      body: value
    });

    return result;
  }
}