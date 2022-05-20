const storeHash = require('./storeHash');
const verifyHash = require('./verifyHash');
const getPolicyId = require('./getPolicyId');

module.exports = {
  '/storeHash': {
    ...storeHash,
  },
  '/verifyHash': {
    ...verifyHash,
  },
  '/getPolicyId': {
    ...getPolicyId,
  }
}