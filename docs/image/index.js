const storeHash = require('./storeHash');
const verifyHash = require('./verifyHash');

module.exports = {
  '/image/storeHash': {
    ...storeHash,
  },
  '/image/verifyHash': {
    ...verifyHash,
  }
}