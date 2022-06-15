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

describe('/api', () => {
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
  });

  describe('Asset routes', () => {
    it('GET /api/getAssets', (done) => {
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

    it('GET /api/getNFT', (done) => {
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

  describe('Hash routes', () => {
    it('PUT /api/storeHash with fake access_token', (done) => {
      chai.request(SERVER_URL)
        .put(`/api/storeHash`)
        .set('Cookie', `access_token=RANDOM-TOKEN`)
        .send({
          originPolicyId: 'EMPTY',
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

    it('PUT /api/storeHash without access_token', (done) => {
      chai.request(SERVER_URL)
        .put(`/api/storeHash`)
        .send({
          originPolicyId: 'EMPTY',
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
          originPolicyId: 'EMPTY',
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

    it('PUT /api/storeHash with access_token', (done) => {
      chai.request(SERVER_URL)
        .put(`/api/storeHash`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .send({
          originPolicyId: '4d48836cc6dc0a7c99d4fc0a198b807b76976a4bb86a85e5d5217262',
          previousHashOfDocument: '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335444',
          hashOfDocument: '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335555',
          address: ADDRESS,
        })
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          chai.expect(res.body.error_message).to.have.string('invalid');
          done();
        });
    });

    it('PUT /api/storeHash without body', (done) => {
      chai.request(SERVER_URL)
        .put(`/api/storeHash`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .send({})
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          done();
        });
    });

    it('PUT /api/storeHash with random hash of document', (done) => {
      chai.request(SERVER_URL)
        .put(`/api/storeHash`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .send({
          hashOfDocument: '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467337999',
          address: ADDRESS,
        })
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('result');
          chai.expect(res.body.data.result).to.be.true;
          chai.expect(res.body.data).to.have.property('token');
          chai.expect(res.body.data.token).to.have.property('policyId');
          chai.expect(res.body.data.token).to.have.property('assetId');
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

    it('GET /api/verifyHash?policyID=?&hashOfDocument=? with access_token, without query parameters', (done) => {
      chai.request(SERVER_URL)
        .get(`/api/verifyHash?hashOfDocument=${HASH_OF_DOCUMENT}`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
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

    it('GET /api/getPolicyId?hashOfDocument=? with access_token, without query parameters', (done) => {
      chai.request(SERVER_URL)
        .get(`/api/getPolicyId`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          done();
        });
    });

    it('POST /api/verifySignature without access_token', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/verifySignature`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          done();
        });
    });

    it('POST /api/verifySignature with access_token', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/verifySignature`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .send({
          address: '0071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3',
          signature: '845869a3012704582000b0095f60c72bb8e49d9facf8ddd99c5443d9f17d82b3cbbcc31dd144e99acf676164647265737358390071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3a166686173686564f458d07b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2263633338376463653236623033396363363430363534303432633534313239376233366638373662636131336634643037373636613931353131306165336234227d5840985532e4747168a5b1c83983656ed5f2f586efc8a9d70dc0cdf8a965040f11cbe5d6936badc8a56f13e984647e434a7a60838809eaae544b927e06f9a8b40900',
          payload: '7b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2263633338376463653236623033396363363430363534303432633534313239376233366638373662636131336634643037373636613931353131306165336234227d',
        })
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('result');
          chai.expect(res.body.data.result).to.be.true;
          done();
        });
    });

    it('POST /api/verifySignatures with fake access_token', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/verifySignatures`)
        .set('Cookie', `access_token=RANDOM-TOKEN`)
        .send({})
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          done();
        });
    });

    it('POST /api/verifySignatures with access_token with address mismatch', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/verifySignatures`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .send({
          signatures: [{
            address: '100d86a5efcde8c4129755d0d43b0fd87622a260d45b33bc04140772a532d14a4e1198cebde34e68f82b94f5068de44aa580ebf66cfaaef0698',
            signature: '845869a3012704582000b0095f60c72bb8e49d9facf8ddd99c5443d9f17d82b3cbbcc31dd144e99acf676164647265737358390071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3a166686173686564f458d07b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2263633338376463653236623033396363363430363534303432633534313239376233366638373662636131336634643037373636613931353131306165336234227d5840985532e4747168a5b1c83983656ed5f2f586efc8a9d70dc0cdf8a965040f11cbe5d6936badc8a56f13e984647e434a7a60838809eaae544b927e06f9a8b40900',
            payload: '7b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2263633338376463653236623033396363363430363534303432633534313239376233366638373662636131336634643037373636613931353131306165336234227d',
          }],
        })
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          chai.expect(res.body.error_message).to.have.string('Could not verify because of address mismatch');
          done();
        });
    });

    it('POST /api/verifySignatures with access_token with payload mismatch', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/verifySignatures`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .send({
          signatures: [{
            address: '0071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3',
            signature: '845869a3012704582000b0095f60c72bb8e49d9facf8ddd99c5443d9f17d82b3cbbcc31dd144e99acf676164647265737358390071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3a166686173686564f458d07b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2263633338376463653236623033396363363430363534303432633534313239376233366638373662636131336634643037373636613931353131306165336234227d5840985532e4747168a5b1c83983656ed5f2f586efc8a9d70dc0cdf8a965040f11cbe5d6936badc8a56f13e984647e434a7a60838809eaae544b927e06f9a8b40900',
            payload: '17b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2263633338376463653236623033396363363430363534303432633534313239376233366638373662636131336634643037373636613931353131306165336234227d',
          }],
        })
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          chai.expect(res.body.error_message).to.have.string('Payload does not match');
          done();
        });
    });

    it('POST /api/verifySignatures without body', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/verifySignatures`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .send({})
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          done();
        });
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
          chai.expect(res.body.error_message).to.have.string('transaction read error RawCborDecodeError');
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
          chai.expect(res.body.error_message).to.have.string('Signed transaction is required');
          done();
        });
    });
  });

  after(() => {
    server.stop();
  });
});