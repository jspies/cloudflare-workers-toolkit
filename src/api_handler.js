module.exports = {
  isApiSuccess: response => response && response.success,
  getResult: response =>
    response && response.success && response.result ? response.result : null
};
