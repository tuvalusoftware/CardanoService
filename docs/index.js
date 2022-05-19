const basicInfo = require('./basicInfo');
const servers = require('./servers');
const tags = require('./tags');
const components = require('./components');
const metadata = require('./metadata');
const nft = require('./nft');
const utils = require('./utils');
const transaction = require('./transaction');
const image = require('./image');

const paths = {
  ...nft,
  ...metadata,
  ...utils,
  ...transaction,
  ...image
};

module.exports = {
  ...basicInfo,
  ...servers,
  ...tags,
  ...components,
  ...{ paths: paths },
};