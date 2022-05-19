const storeHash = require('./storeHash');
const verifyHash = require('./verifyHash');

module.exports = {
  '/storeHash': {
    ...storeHash,
  },
  '/verifyHash': {
    ...verifyHash,
  }
}