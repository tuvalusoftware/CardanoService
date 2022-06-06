const getAssets = require('./getAssets');
const getNFT = require('./getNFT');
const getNFTs = require('./getNFTs');

module.exports = {
  '/getAssets/{address}': {
    ...getAssets,
  },
  '/getNFT/{assetId}': {
    ...getNFT,
  },
  '/getNFTs/{policyId}': {
    ...getNFTs,
  },
}