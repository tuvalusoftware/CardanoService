require('dotenv').config();
require('./index');

const core = require('../core');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../server');

const SERVER_URL = process.env.serverUrl;

// describe('Function test', () => {
//   const HASH_OF_DOCUMENT = '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987';

//   it('getPolicyIdFromHashOfDocument', async (done) => {
//     const { policyId } = await core.getPolicyIdFromHashOfDocument(HASH_OF_DOCUMENT);
//     chai.expect(policyId).to.be.an('string');
//   });
// });

describe('Api test', () => {
  before(() => {
    server.start({
      port: 10000
    });
  });

  const ADDRESS = 'addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur';
  const POLICY_ID = '31ca61550f066eccd9a617e9b2ab272b9eac3877cac30f377643bb00';
  const HASH_OF_DOCUMENT = '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987';
  const ACCESS_TOKEN = 'FUIXLABS-ACCESS-TOKEN';

  describe('Hash routes', () => {
    it('PUT /api/storeHash without access_token', (done) => {
      chai.request(SERVER_URL)
        .put(`/api/storeHash`)
        .send({})
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          chai.expect(res.body.error_code).to.equal(10000);
          chai.expect(res.body.error_message).to.have.string('Not authenticated');
          done();
        });
    });

    it('PUT /api/storeHash with access_token, with NFT minted', (done) => {
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
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('result');
          chai.expect(res.body.data.result).to.be.false;
          done();
        });
    });

    it('PUT /api/storeHash with access_token, with NFT invalid', (done) => {
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
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('result');
          chai.expect(res.body.data.result).to.be.false;
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
          chai.expect(res.body.error_code).to.equal(10005);
          chai.expect(res.body.error_message).to.equal('Address and hash of document are required');
          done();
        });
    });

    it('PUT /api/storeHash with random hash of document', (done) => {
      chai.request(SERVER_URL)
        .put(`/api/storeHash`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .send({
          originPolicyId: 'EMPTY',
          previousHashOfDocument: 'EMPTY',
          hashOfDocument: '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467339828',
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
          chai.expect(res.body.error_code).to.equal(10000);
          chai.expect(res.body.error_message).to.equal('Not authenticated');
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

    it('GET /api/getNFTs/:policyId with access_token, with undefined policy id', (done) => {
      chai.request(SERVER_URL)
        .get(`/api/getNFTs/${undefined}`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.have.property('error_code');
          chai.expect(res.body).to.have.property('error_message');
          chai.expect(res.body.error_code).to.equal(10012);
          chai.expect(res.body.error_message).to.equal('Can not fetch NFTs from policy id');
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
          chai.expect(res.body.error_code).to.equal(10000);
          chai.expect(res.body.error_message).to.equal('Not authenticated');
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
          chai.expect(res.body.error_code).to.equal(10006);
          chai.expect(res.body.error_message).to.equal('Policy id and hash of document are required');
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
          chai.expect(res.body.error_code).to.equal(10000);
          chai.expect(res.body.error_message).to.equal('Not authenticated');
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

    it('POST /api/verifySignature with access_token, with address mismatch', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/verifySignature`)
        .set('Cookie', `access_token=${ACCESS_TOKEN}`)
        .send({
          address: '10071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3',
          signature: '845869a3012704582000b0095f60c72bb8e49d9facf8ddd99c5443d9f17d82b3cbbcc31dd144e99acf676164647265737358390071fc0cc009dab1ec32a25ee2d242c9e269ae967b8ffe80d9ddfd4ecfe24b09415e7642ee02ff59f2aabc9f106cb49595ff2e04a11b4259e3a166686173686564f458d07b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2263633338376463653236623033396363363430363534303432633534313239376233366638373662636131336634643037373636613931353131306165336234227d5840985532e4747168a5b1c83983656ed5f2f586efc8a9d70dc0cdf8a965040f11cbe5d6936badc8a56f13e984647e434a7a60838809eaae544b927e06f9a8b40900',
          payload: '7b2261646472657373223a22303037316663306363303039646162316563333261323565653264323432633965323639616539363762386666653830643964646664346563666532346230393431356537363432656530326666353966326161626339663130366362343935393566663265303461313162343235396533222c2274617267657448617368223a2263633338376463653236623033396363363430363534303432633534313239376233366638373662636131336634643037373636613931353131306165336234227d',
        })
        .end((err, res) => {
          chai.expect(res.status).to.equal(200);
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('result');
          chai.expect(res.body.data.result).to.be.false;
          done();
        });
    });

    it('POST /api/verifySignatures without access_token', (done) => {
      chai.request(SERVER_URL)
        .post(`/api/verifySignatures`)
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
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('results');
          chai.expect(res.body.data.results).to.be.an('array');
          chai.expect(res.body.data.results[0]).to.be.false;
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
          chai.expect(res.body).to.be.an('object');
          chai.expect(res.body).to.have.property('data');
          chai.expect(res.body.data).to.have.property('results');
          chai.expect(res.body.data.results).to.be.an('array');
          chai.expect(res.body.data.results[0]).to.be.false;
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

  after(() => {
    server.stop();
  });
});