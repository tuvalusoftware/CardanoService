require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const SERVER = 'http://localhost:10000';
const ACCESS_TOKEN = 'FUIXLABS-TEST-ACCESS-TOKEN';

const POLICY_ID = '1050dd64e77e671a0fee81f391080f5f57fefba2e26a816019aa5524';

describe('Hash routes', () => {
  it('PUT /api/storeHash without access_token', (done) => {
    chai.request(SERVER)
      .put(`/api/storeHash`)
      .send({
        previousHashOfDocument: 'EMPTY',
        hashOfDocument: '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987',
        address: 'addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur',
      })
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.have.property('error_code');
        chai.expect(res.body).to.have.property('error_message');
        done();
      });
  });

  it('PUT /api/storeHash with access_token', (done) => {
    chai.request(SERVER)
      .put(`/api/storeHash`)
      .set('Cookie', `access_token=${ACCESS_TOKEN}`)
      .send({
        previousHashOfDocument: 'EMPTY',
        hashOfDocument: '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987',
        address: 'addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur',
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
    chai.request(SERVER)
      .get(`/api/getNFTs/${POLICY_ID}`)
      .end((err, res) => {
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.have.property('error_code');
        chai.expect(res.body).to.have.property('error_message');
        done();
      });
  });

  it('GET /api/getNFTs/:policyId with access_token', (done) => {
    chai.request(SERVER)
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
});