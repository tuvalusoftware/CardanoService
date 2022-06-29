const storeHash = require('./storeHash');
const storeCredentials = require('./storeCredentials');
const verifyHash = require('./verifyHash');
const getPolicyId = require('./getPolicyId')
const verifySignature = require('./verifySignature')
const verifySignatures = require('./verifySignatures')

module.exports = {
  '/storeHash': {
    ...storeHash,
  },
  '/storeCredentials': {
    ...storeCredentials,
  },
  '/verifyHash': {
    ...verifyHash,
  },
  '/verifySignature': {
    ...verifySignature
  },
  '/verifySignatures': {
    ...verifySignatures
  },
  '/getPolicyId': {
    ...getPolicyId
  },
}