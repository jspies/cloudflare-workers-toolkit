const api = require("../api");
const FormData = require('form-data');

module.exports = {
  
  /**
   * Deploys a worker
   * @param {*} options
   */
  async deploy({accountId, name, script, bindings}) {

    const formData = new FormData();
    formData.append('metadata', JSON.stringify({
      "body_part": "script",
      "bindings": bindings
    }));

    formData.append('script', script);

    return await api.cfApiCall({
      url: `/accounts/${accountId}/workers/scripts/${name}`,
      method: `PUT`,
      body: formData
    });
  },
}