const assert = require('assert');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

const server = 'http://localhost:10000/api';

describe('Hash', () => {
  describe('/PUT storeHash', function () {
    it('should return 400', function () {
      chai.request(server)
      .put('/storeHash')
      .set('Content-Type', 'application/json')
      .send({
        address: 'addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur', 
        hash: 'aa51202b3df8bb0a109f484b4982d70adc046d89eabddfc02df2c0a3aa3d8d7a',
      }).end(function (err, res) {
        assert.equal(res.status, 400, 'storeHash: Status code is not 400');
        assert.equal(res.text, '{"result":"NFT Minted"}', 'storeHash should return NFT Minted');
      });
    });
  });

  describe('/GET verifyHash', function () {
    it('should return 200', function () {
      chai.request(server).get('/verifyHash')
      .query({
        hash: 'aa51202b3df8bb0a109f484b4982d70adc046d89eabddfc02df2c0a3aa3d8d7a',
      })
      .end(function (err, res) {
        assert.equal(res.status, 400, 'verifyHash: Status code is not 400');
        assert.equal(res.text, '{"result":"Owner address not found"}', 'verifyHash should return owner address not found');
      });
    });
  });

  describe('/GET getPolicyId', function () {
    it('should return 200', function () {
      chai.request(server).get('/getPolicyId')
      .end(function (err, res) {
        assert.equal(res.status, 200, 'getPolicyId: Status code is not 200');
        assert.equal(res.text, '{"result":"1050dd64e77e671a0fee81f391080f5f57fefba2e26a816019aa5524"}');
      });
    });
  });

  describe('/POST verifySignature', function () {
    it('should return 200', function () {
      chai.request(server).post('/verifySignature')
      .send({
        address: '00d86a5efcde8c4129755d0d43b0fd87622a260d45b33bc04140772a532d14a4e1198cebde34e68f82b94f5068de44aa580ebf66cfaaef0698',
        payload: '7b0a202020202272616e646f6d4e756d626572223a20302e393439343136373338343132363330362c0a202020202274696d657374616d70223a20313635333435313134393334380a7d',
        signature: '845869a30127045820f9042dcf90bd841cbbf5a488ce079e21845dd12113f634560aef81a3e535e0856761646472657373583900d86a5efcde8c4129755d0d43b0fd87622a260d45b33bc04140772a532d14a4e1198cebde34e68f82b94f5068de44aa580ebf66cfaaef0698a166686173686564f458957b2261646472657373223a22303064383661356566636465386334313239373535643064343362306664383736323261323630643435623333626330343134303737326135333264313461346531313938636562646533346536386638326239346635303638646534346161353830656266363663666161656630363938222c2274696d65223a313635333435313134393438337d58400538e407261c832b3340487343b3f534d98e7c183d70b155a929a37db3fe6a48525fc20d51cfcb31379b0bcb6a4cf1a36e4556f8b0180f0c0e8661d81fab2b0c',
      }).end(function (err, res) {
        assert.equal(res.status, 200, 'verifySignature: Status code is not 200');
        assert.equal(res.text, '{"result":"true"}', 'verifySignature should return true');
      });
    });
  });
});