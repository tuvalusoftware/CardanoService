const getAssets = require('./getAssets');
const getNFT = require('./getNFT');

module.exports = {
  '/getAssets/{address}': {
    ...getAssets,
  },
  '/getNFT/{assetId}': {
    ...getNFT,
  },
}