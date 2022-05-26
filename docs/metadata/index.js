const getMetadata = require('./getMetadata');

module.exports = {
  '/getMetadata/{label}': {
    ...getMetadata,
  },
}