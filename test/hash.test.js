require('dotenv').config();

const assert = require('assert');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = process.env.testAddress;

describe('Hash', () => {
  describe('/GET verifyHash', function () {
    it('should return 200', function () {
      chai.request(server).get('/verifyHash')
      .query({
        hash: 'aa51202b3df8bb0a109f484b4982d70adc046d89eabddfc02df2c0a3aa3d8d7a',
      })
      .end(function (err, res) {});
    });
  });
});