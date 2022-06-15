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

  describe('Metadata routes', () => {
    it('GET /api/getMetadata', (done) => {
      chai.request(SERVER_URL)
        .get(`/api/getMetadata/${721}`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('metadata');
          done();
        });
    });

    it('GET /api/getMetadata with negative label', (done) => {
      chai.request(SERVER_URL)
        .get(`/api/getMetadata/${-721}`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body.error_code).to.equal(10014);
          done();
        });
    });
  });

  after(() => {
    server.stop();
  });
});