require('dotenv').config();
require('./index');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../server');

const SERVER_URL = process.env.serverUrl;

describe('Api test', () => {
  before(() => {
    server.start({
      port: 10000
    });
  });

  describe('Asset routes', () => {

    const ADDRESS = 'addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur';

    it('GET /api/getAssets/:address', (done) => {
      chai.request(SERVER_URL)
        .get(`/api/getAssets/${ADDRESS}`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('assets');
          done();
        });
    });
  
    const ASSET_ID = '9cebd568ac4ad908cdd2d45a52327fc4711911054c9951b90a6033034265727279417572656c6961';
  
    it('GET /api/getNFT/:assetId', (done) => {
      chai.request(SERVER_URL)
        .get(`/api/getNFT/${ASSET_ID}`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('nftMetadata');
          done();
        });
    });

    it('GET /api/getNFT/:assetId with undefined asset id', (done) => {
      chai.request(SERVER_URL)
        .get(`/api/getNFT/${undefined}`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          chai.expect(res.body.error_code).to.equal(10011);
          chai.expect(res.body.error_message).to.have.string('Can not fetch an NFT metadata from asset id or asset id is invalid');
          done();
        });
    });
  });

  after(() => {
    server.stop();
  });
});