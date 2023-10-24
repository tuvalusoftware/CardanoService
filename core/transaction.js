import * as dotenv from "dotenv";
dotenv.config();

import * as L from "./lucid";
import * as A from "./account";

import { errorTypes } from "./error.types";
import { memoryCache } from "./cache";
import { BlockFrostAPI, } from "@blockfrost/blockfrost-js";
import { BlockfrostConfig } from "./blockfrost";

import { delay, getAssetDetails } from "./helpers";

import logger from "../Logger";

export const BlockfrostAPI = new BlockFrostAPI({
	projectId: BlockfrostConfig.apiKey,
	network: BlockfrostConfig.network,
});

export const MintNFTRandom = async ({ assetName, metadata, options, tries = 0 }) => {
	// const rng = Math.floor(Math.random() * 4);

	// let MNEMONIC = [
	// 	process.env.MNEMONIC,
	// 	process.env.MNEMONIC2,
	// 	process.env.MNEMONIC3,
	// 	process.env.MNEMONIC4,
	// ];

	// const currentMnemonic = MNEMONIC[rng] || process.env.MNEMONIC4;

	// logger.info("Random wallet selection", rng, currentMnemonic);
	// L.lucid.selectWalletFromPrivateKey(A.getCurrentAccount(currentMnemonic).paymentKey.to_bech32());

	return await MintNFT({ assetName, metadata, options, walletId: undefined, kek: true, tries: tries });
};

export const MintNFT = async ({ assetName, metadata, options, walletId, kek, tries }) => {
	if (!tries) {
		tries = 0;
	}

	// if (walletId && !isNaN(walletId)) {
	// 	// Do nothing
	// } else {
	// 	L.lucid.selectWalletFromPrivateKey(A.getCurrentAccount(process.env.MNEMONIC4).paymentKey.to_bech32());
	// }

	logger.info("[Mint NFT] start");

	const timeToLive = L.lucid.utils.unixTimeToSlot(new Date()) + 3153600000;

	// let policy = W.createLockingPolicyScript();
	const { paymentCredential } = L.lucid.utils.getAddressDetails(
		await L.lucid.wallet.address()
	);

	let policy = L.lucid.utils.nativeScriptFromJson({
		type: "all",
		scripts: [
			{ type: "sig", keyHash: paymentCredential.hash },
			{
				type: "before",
				slot: timeToLive,
			},
		],
	});

	// const timeToLive2 = L.lucid.utils.unixTimeToSlot(new Date()) + 3153600000 + Math.floor(Math.random() * 1000);

	// let policy2 = L.lucid.utils.nativeScriptFromJson({
	// 	type: "all",
	// 	scripts: [
	// 		{ type: "sig", keyHash: paymentCredential.hash },
	// 		{
	// 			type: "before",
	// 			slot: timeToLive2,
	// 		},
	// 	],
	// });

	policy.ttl = timeToLive;
	policy.id = L.lucid.utils.mintingPolicyToId(policy);
	// policy.script = Buffer.from(policy.script.to_bytes(), "hex").toString("hex");

	// policy2.ttl = timeToLive2;
	// policy2.id = L.lucid.utils.mintingPolicyToId(policy2);

	// console.log(policy.id, policy2.id);

	if (options.policy && options.policy.id && options.policy.script && options.policy.ttl && options.policy.reuse && options.policy.reuse == true) {
		policy = options.policy;
	}

	metadata.timestamp = new Date().getTime();
	metadata.policy = policy.id;
	metadata.ttl = policy.ttl;

	// const utxos = await L.lucid.wallet.getUtxos();
	// const asset = `${policy.id}${Buffer.from(assetName, "hex").toString("hex")}`;
	const asset = `${policy.id}${assetName}`;
	// const asset2 = `${policy2.id}${assetName}`;

	const address = await L.lucid.wallet.address();
	const utxo = await L.lucid.utxosAtWithUnit(address, asset);
	if (utxo.length > 0) {
		throw new Error(errorTypes.NFT_MINTED);
	}

	let mintToken = {
		[asset]: 1n,
	};

	// let mintToken2 = {
	// 	[asset2]: 1n,
	// };

	if (options.burn && options.burn == true) {
		mintToken[options.asset] = -1n;
	}

	if (options.policy && options.policy.reuse && options.policy.reuse == true && options.policy.id !== policy.id) {
		logger.error("POLICY_ID_DIFFERENCE:", options.policy.id, policy.id);
		throw new Error(errorTypes.ERROR_WHILE_REUSING_POLICY_ID);
	}

	// const UTXOs = await L.lucid.wallet.getUtxos();

	const tx = await L.lucid.newTx()
		.attachMintingPolicy(policy)
		// .attachMintingPolicy(policy2)
		.attachMetadataWithConversion(721, {
			[`0x${policy.id}`]: {
				[`0x${assetName}`]: metadata,
			},
			// [`0x${policy2.id}`]: {
			// 	[`0x${assetName}`]: metadata,
			// },
			version: 2,
		})
		.mintAssets(mintToken)
		// .mintAssets(mintToken2)
		.validTo(L.lucid.utils.slotToUnixTime(policy.ttl))
		.payToAddress(address, mintToken)
		.payToAddress(address, {
			lovelace: 2_000_000,
		})
		// .payToAddress(address, mintToken2)
		.complete({
			coinSelection: true,
		});

	const signedTx = await tx.sign().complete();

	let txHash = null;
	try {
		txHash = await signedTx.submit();
		// Remove '"' 
		txHash = txHash.replace(/['"]+/g, '');

		try {
			// if (!kek) {
				// await L.lucid.awaitTx(txHash);
				// await delay(10000);
				// await getAssetDetails(asset);
			// }
		} catch (doNothing) { }

		logger.info("Minted", txHash);
	} catch (error) {
		logger.error(error);

		// if (tries < 2) {
		// 	++tries;
		// 	logger.info("Trying again", tries);
		// 	return await MintNFT({ assetName, metadata, options, walletId, kek: kek, tries: tries });
		// }

		throw new Error(errorTypes.TRANSACTION_REJECT);
	}

	logger.info("[Mint NFT] finish");
	return { policy, asset, txHash: txHash, walletId };
};

export const MintBatchNFT = async ({ assetNames, metadata, options, walletId }) => {
	logger.info("[Mint batch NFT] start");

	const timeToLive = L.lucid.utils.unixTimeToSlot(new Date()) + 3153600000;

	// let policy = W.createLockingPolicyScript();
	const { paymentCredential } = L.lucid.utils.getAddressDetails(
		await L.lucid.wallet.address()
	);

	let policy = L.lucid.utils.nativeScriptFromJson({
		type: "all",
		scripts: [
			{ type: "sig", keyHash: paymentCredential.hash },
			{
				type: "before",
				slot: timeToLive,
			},
		],
	});

	policy.ttl = timeToLive;
	policy.id = L.lucid.utils.mintingPolicyToId(policy);
	// policy.script = Buffer.from(policy.script.to_bytes(), "hex").toString("hex");

	if (options.policy && options.policy.id && options.policy.script && options.policy.ttl && options.policy.reuse && options.policy.reuse == true) {
		policy = options.policy;
	}

	let mintToken = {
		// [asset]: 1n,
	};

	let assets = [];

	const address = await L.lucid.wallet.address();

	for (let i = 0; i < assetNames.length; ++i) {
		const assetName = assetNames[i];
		metadata[assetName].timestamp = new Date().getTime();
		const asset = `${policy.id}${assetName}`;
		const utxo = await L.lucid.utxosAtWithUnit(address, asset);
		if (utxo.length > 0) {
			logger.error("NFT_MINTED:", asset);
			continue;
		}
		mintToken[asset] = 1n;
		assets.push(asset);
	}

	if (options.burn && options?.burn == true) {
		mintToken[options.asset] = -1n;
	}

	// const utxos = await L.lucid.wallet.getUtxos();
	// const asset = `${policy.id}${Buffer.from(assetName, "hex").toString("hex")}`;

	if (options.policy && options.policy.reuse && options.policy.reuse == true && options.policy.id !== policy.id) {
		logger.error("POLICY_ID_DIFFERENCE:", options.policy.id, policy.id);
		throw new Error(errorTypes.ERROR_WHILE_REUSING_POLICY_ID);
	}

	// const utxos = await L.lucid.wallet.getUtxos();

	const tx = await L.lucid.newTx()
		.attachMintingPolicy(policy)
		.attachMetadataWithConversion(721, {
			[`0x${policy.id}`]: {
				...metadata,
			},
			version: 2,
		})
		.mintAssets(mintToken)
		.validTo(L.lucid.utils.slotToUnixTime(policy.ttl))
		.payToAddress(address, mintToken)
		.complete({
			coinSelection: true,
		});

	const signedTx = await tx.sign().complete();

	let txHash = null;
	try {
		txHash = await signedTx.submit();
		txHash = txHash.replace(/['"]+/g, '');

		try {
			await L.lucid.awaitTx(txHash);
		} catch (doNothing) { }

		logger.info("Minted", txHash);
	} catch (error) {
		logger.error(error);
		throw new Error(errorTypes.TRANSACTION_REJECT);
	}

	logger.info("[Mint batch NFT] finish");
	return { policy, assets, txHash, walletId };
};

export const BurnNFT = async ({ config, burnAll }) => {
	logger.error("[Burn NFT] start");

	// const { paymentCredential } = L.lucid.utils.getAddressDetails(
	// 	await L.lucid.wallet.address()
	// );

	// const utxos = await L.lucid.wallet.getUtxos();
	const address = await L.lucid.wallet.address();
	// logger.info(address);
	// const utxo = await L.lucid.utxosAtWithUnit(address, config.asset);

	logger.info(JSON.stringify(config));
	// logger.info(JSON.stringify(utxo));

	let UTXOs = [];
	const MINT_ASSETS = {};

	if (burnAll) {
		let Assets = await BlockfrostAPI.assetsPolicyByIdAll(config.policy.id, { page: 1, count: 1000000, order: "asc" });
		Assets = (Assets || []).filter((asset) => {
			return asset.asset !== config.asset;
		});
		console.log("Assets", Assets);

		for (let i = 0; i < Assets.length; ++i) {
			const asset = Assets[i];
			const utxo = await L.lucid.utxosAtWithUnit(address, asset.asset);
			UTXOs = UTXOs.concat(utxo);
			MINT_ASSETS[asset.asset] = -1n;
		}
	}

	const utxo2 = await L.lucid.utxoByUnit(config.asset);
	console.log("utxo2", utxo2);

	// if (utxo.length > 0) {

	MINT_ASSETS[config.asset] = -1n;
	console.log("MINT_ASSETS", MINT_ASSETS);

	UTXOs = (UTXOs || []).concat([utxo2]);

	const tx = await L.lucid.newTx()
		.collectFrom(UTXOs)
		.attachMintingPolicy(config.policy)
		.mintAssets(MINT_ASSETS)
		.validTo(L.lucid.utils.slotToUnixTime(config.policy.ttl))
		.complete({
			coinSelection: true,
		});

	const signedTx = await tx.sign().complete();

	try {
		let txHash = await signedTx.submit();
		txHash = txHash.replace(/['"]+/g, '');

		await L.lucid.awaitTx(txHash);
		logger.info("Burned", txHash);

		if (memoryCache.get(config.asset)) {
			memoryCache.ttl(config.asset, 0);
			memoryCache.del(config.asset);
		}

		logger.info("[Burn NFT] finish");
	} catch (error) {
		logger.error(error);
		throw new Error(error);
	}

	// } else {
	// 	throw new Error(errorTypes.NFT_COULD_NOT_BE_FOUND_IN_WALLET);
	// }
};