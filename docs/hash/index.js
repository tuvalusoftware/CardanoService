const storeHash = require('./storeHash');
const verifyHash = require('./verifyHash');
const getPolicyId = require('./getPolicyId');
const verifySignature = require('./verifySignature')

module.exports = {
  '/storeHash': {
    ...storeHash,
  },
  '/verifyHash': {
    ...verifyHash,
  },
  '/getPolicyId': {
    ...getPolicyId,
  },
  '/verifySignature': {
    ...verifySignature
  },
}