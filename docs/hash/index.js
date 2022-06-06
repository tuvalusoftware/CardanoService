const storeHash = require('./storeHash');
const verifyHash = require('./verifyHash');
const verifySignature = require('./verifySignature')

module.exports = {
  '/storeHash': {
    ...storeHash,
  },
  '/verifyHash': {
    ...verifyHash,
  },
  '/verifySignature': {
    ...verifySignature
  },
}