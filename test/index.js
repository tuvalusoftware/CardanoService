require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../server');

const SERVER_URL = 'http://localhost:10000';
const ACCESS_TOKEN = 'FUIXLABS-TEST-ACCESS-TOKEN';

const ADDRESS = 'addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur';
const POLICY_ID = 'e3d9d43540efdd28b90d73dca2de98d13052547f9ff86cdcb93d8645';
const HASH_OF_DOCUMENT = '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987';

describe('Hash routes', () => {
  before(() => {
    server.start({
      port: 10000,
    })
  });

  it('PUT /api/storeHash without access_token', (done) => {
    chai.request(SERVER_URL)
      .put(`/api/storeHash`)
      .send({
        previousHashOfDocument: 'EMPTY',
        hashOfDocument: HASH_OF_DOCUMENT,
        address: ADDRESS,
      })
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.have.property('error_code');
        chai.expect(res.body).to.have.property('error_message');
        done();
      });
  });

  it('PUT /api/storeHash with access_token', (done) => {
    chai.request(SERVER_URL)
      .put(`/api/storeHash`)
      .set('Cookie', `access_token=${ACCESS_TOKEN}`)
      .send({
        previousHashOfDocument: 'EMPTY',
        hashOfDocument: HASH_OF_DOCUMENT,
        address: ADDRESS,
      })
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.have.property('error_code');
        chai.expect(res.body).to.have.property('error_message');
        chai.expect(res.body.error_message).to.have.string('Minted');
        done();
      });
  });

  it('GET /api/getNFTs/:policyId without access_token', (done) => {
    chai.request(SERVER_URL)
      .get(`/api/getNFTs/${POLICY_ID}`)
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.have.property('error_code');
        chai.expect(res.body).to.have.property('error_message');
        done();
      });
  });

  it('GET /api/getNFTs/:policyId with access_token', (done) => {
    chai.request(SERVER_URL)
      .get(`/api/getNFTs/${POLICY_ID}`)
      .set('Cookie', `access_token=${ACCESS_TOKEN}`)
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.be.an('object');
        chai.expect(res.body).to.have.property('data');
        chai.expect(res.body.data).to.have.property('nfts');
        chai.expect(res.body.data.nfts).to.be.an('array');
        done();
      });
  });

  it('GET /api/verifyHash?policyID=?&hashOfDocument=? without access_token', (done) => {
    chai.request(SERVER_URL)
      .get(`/api/verifyHash?policyID=${POLICY_ID}&hashOfDocument=${HASH_OF_DOCUMENT}`)
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.have.property('error_code');
        chai.expect(res.body).to.have.property('error_message');
        done();
      });
  });

  it('GET /api/verifyHash?policyID=?&hashOfDocument=? with access_token', (done) => {
    chai.request(SERVER_URL)
      .get(`/api/verifyHash?policyID=${POLICY_ID}&hashOfDocument=${HASH_OF_DOCUMENT}`)
      .set('Cookie', `access_token=${ACCESS_TOKEN}`)
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.be.an('object');
        chai.expect(res.body).to.have.property('data');
        chai.expect(res.body.data).to.have.property('result');
        chai.expect(res.body.data.result).to.be.true;
        done();
      });
  });

  it('GET /api/getPolicyId?hashOfDocument=? without access_token', (done) => {
    chai.request(SERVER_URL)
      .get(`/api/getPolicyId?hashOfDocument=${HASH_OF_DOCUMENT}`)
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.have.property('error_code');
        chai.expect(res.body).to.have.property('error_message');
        done();
      });
  });

  it('GET /api/getPolicyId?hashOfDocument=? with access_token', (done) => {
    chai.request(SERVER_URL)
      .get(`/api/getPolicyId?hashOfDocument=${HASH_OF_DOCUMENT}`)
      .set('Cookie', `access_token=${ACCESS_TOKEN}`)
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.be.an('object');
        chai.expect(res.body).to.have.property('data');
        chai.expect(res.body.data).to.have.property('policyId');
        chai.expect(res.body.data.policyId).to.equal(POLICY_ID);
        done();
      });
  });

  after(() => {
    server.stop();
  });
});