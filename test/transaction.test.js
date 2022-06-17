require('dotenv').config();
require('./index');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../server');

const SERVER_URL = process.env.serverUrl;

const errorConstants = require('../routers/errorConstants');

describe('Api test', () => {
  before(() => {
    server.start({
      port: 10000
    });
  });

  describe('Transaction routes', () => {
    it('POST /api/submitTransaction with fake transaction', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/submitTransaction`)
        .send({
          signedTransaction: [
            [0, 0, 1],
          ],
        })
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          chai.expect(res.body.error_code).to.equal(10009);
          chai.expect(res.body.error_message).to.have.string(errorConstants[10009]);
          done();
        });
    });
  
    it('POST /api/submitTransaction without signed transaction', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/submitTransaction`)
        .send({})
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          chai.expect(res.body.error_code).to.equal(10008);
          chai.expect(res.body.error_message).to.have.string(errorConstants[10008]);
          done();
        });
    });
  });

  after(() => {
    server.stop();
  });
});