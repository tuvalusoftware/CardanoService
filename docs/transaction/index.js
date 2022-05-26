const submitTransaction = require('./submitTransaction')

module.exports = {
  '/submitTransaction': {
    ...submitTransaction,
  },
}