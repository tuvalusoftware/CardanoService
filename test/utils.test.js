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

  describe('Utils routes', () => {
    it('GET /api/getProtocolParameters', (done) => {
      chai.request(SERVER_URL)
        .get(`/api/getProtocolParameters`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('protocolParameters');
          done();
        });
    });
  });

  after(() => {
    server.stop();
  });
});