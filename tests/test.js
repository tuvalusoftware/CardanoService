import * as dotenv from "dotenv";
dotenv.config();

import chai from "chai";
import chaiHttp from "chai-http";

import keccak256 from "keccak256";

chai.use(chaiHttp);

import { start, stop } from "../server";

function randomString(len, charSet) {
	charSet = charSet || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	var randomString = "";
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	return keccak256(randomString).toString("hex");
}

const MOCK_DATA = {
	RANDOM_HASH: randomString(64),
	MINTING_CONFIG: {
		type: "document",
		policy: {
			type: "Native",
			script: "8201828200581c4b3230ba5b12fffd92edd7aea44b6bebbcdf57ef7fe262760a3722ee82051abd3ccd56",
			ttl: 3174878550,
			id: "10ea344083a8052862d7803ce308b28e7a6ffafb684ed87e76da3b1c"
		},
		asset: "10ea344083a8052862d7803ce308b28e7a6ffafb684ed87e76da3b1cac1e6641b79031e271d138f6407f495ee8a1b25e2ae926f31de2010ed2da4b7a",
		txHash: "cf9514a5f7eb28d710e569cdda663efd64c21c6f915b5309bd62429a788ee97f"
	}
};

before(function (done) {
	start({
		port: 10003,
	})
	process.env["ENVIRONMENT"] = "develop";
	done();
});

const BASE_URL = "http://localhost:10003/api/v2";

describe("Cardano Service Unit Tests", function () {
	describe("Warmup", function () {
		it("1 = 1", function (done) {
			chai.expect(1).to.equal(1);
			done();
		});
	});
	describe("Auth API", function () {
		const API_URL = "/fetch/nft";
		before(function (done) {
			process.env["ENVIRONMENT"] = "prod";
			done();
		});
		it("Invalid access token", function (done) {
			chai
				.request(BASE_URL)
				.post(API_URL)
				.set("Cookie", `access_token=dummy`)
				.send({
					asset: "dummy",
				}).then(function (response) {
					chai.expect(response).to.have.status(200);
					chai.expect(response.body.code).to.be.equal(1);
					chai.expect(response.body.message).to.be.equal("INVALID_ACCESS_TOKEN");
					done();
				}).catch(function (error) {
					throw error;
				});
		});
		after(function (done) {
			process.env["ENVIRONMENT"] = "develop";
			done();
		});
	});
	describe("Hash API", function () {
		const API_URL = "/hash";
		it("Store hash", function (done) {
			chai
				.request(BASE_URL)
				.post(API_URL)
				.send({
					hash: MOCK_DATA.RANDOM_HASH,
				}).then(function (response) {
					chai.expect(response).to.have.status(200);
					chai.expect(response.body.code).to.be.equal(0);
					chai.expect(response.body.message).to.be.equal("SUCCESS");
					chai.expect(response.body.data).to.be.contains.keys("type");
					chai.expect(response.body.data).to.be.contains.keys("policy");
					chai.expect(response.body.data.policy).to.be.contains.keys("type");
					chai.expect(response.body.data.policy).to.be.contains.keys("id");
					chai.expect(response.body.data.policy).to.be.contains.keys("script");
					chai.expect(response.body.data.policy).to.be.contains.keys("ttl");
					chai.expect(response.body.data).to.be.contains.keys("asset");
					chai.expect(response.body.data).to.be.contains.keys("txHash");
					done();
				}).catch(function (error) {
					throw error;
				});
		});
	});
	describe("Fetch API", function () {
		const API_URL = "/fetch/nft";
		it("By asset", function (done) {
			chai
				.request(BASE_URL)
				.post(API_URL)
				.send({
					asset: MOCK_DATA.MINTING_CONFIG.asset,
				}).then(function (response) {
					chai.expect(response).to.have.status(200);
					chai.expect(response.body.code).to.be.equal(0);
					chai.expect(response.body.message).to.be.equal("SUCCESS");
					chai.expect(response.body.data).to.be.contains.keys("asset");
					chai.expect(response.body.data).to.be.contains.keys("policyId");
					chai.expect(response.body.data).to.be.contains.keys("assetName");
					chai.expect(response.body.data).to.be.contains.keys("fingerprint");
					chai.expect(response.body.data).to.be.contains.keys("onchainMetadata");
					chai.expect(response.body.data).to.be.contains.keys("originalOnchainMetadata");
					chai.expect(response.body.data).to.be.contains.keys("quantity");
					chai.expect(response.body.data.onchainMetadata).to.be.contains.keys("name");
					chai.expect(response.body.data.onchainMetadata).to.be.contains.keys("attach");
					chai.expect(response.body.data.onchainMetadata).to.be.contains.keys("policy");
					done();
				}).catch(function (error) {
					throw error;
				});
		});
	});
});

after(function (done) {
	stop(0);
	done();
});