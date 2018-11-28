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
  }
}