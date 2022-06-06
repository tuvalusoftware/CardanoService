const storeHash = require('./storeHash');
const verifyHash = require('./verifyHash');
const verifySignature = require('./verifySignature')
const verifySignatures = require('./verifySignatures')

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
  '/verifySignatures': {
    ...verifySignatures
  },
}