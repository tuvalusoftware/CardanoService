import * as dotenv from "dotenv";
dotenv.config();

import * as L from "./lucid";
import * as A from "./account";

import { errorTypes } from "./error.types";
import { memoryCache } from "./cache";
import { BlockFrostAPI, } from "@blockfrost/blockfrost-js";
import { BlockfrostConfig } from "./blockfrost";

import { getAssetDetails } from "./helpers";

import logger from "../Logger";

export const BlockfrostAPI = new BlockFrostAPI({
	projectId: BlockfrostConfig.apiKey,
	network: BlockfrostConfig.network,
});

export const MintNFTRandom = async ({ assetName, metadata, options }) => {
	const rng = Math.floor(Math.random() * 4);

	let MNEMONIC = [
		process.env.MNEMONIC,
		process.env.MNEMONIC2,
		process.env.MNEMONIC3,
		process.env.MNEMONIC4,
	];

	const currentMnemonic = MNEMONIC[rng] || process.env.MNEMONIC4;

	logger.info("Random wallet selection", rng, currentMnemonic);
	L.lucid.selectWalletFromPrivateKey(A.getCurrentAccount(currentMnemonic).paymentKey.to_bech32());

	return await MintNFT({ assetName, metadata, options, walletId: Number(rng) });
};

export const MintNFT = async ({ assetName, metadata, options, walletId }) => {
	if (walletId && !isNaN(walletId)) {
		// Do nothing
	} else {
		L.lucid.selectWalletFromPrivateKey(A.getCurrentAccount(process.env.MNEMONIC4).paymentKey.to_bech32());
	}

	logger.info("[Mint NFT] start");

	const timeToLive = L.lucid.utils.unixTimeToSlot(new Date()) + 3153600000;

	// let policy = W.createLockingPolicyScript();
	const { paymentCredential } = L.lucid.utils.getAddressDetails(
		await L.lucid.wallet.address(),
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

	metadata.timestamp = new Date().getTime();
	metadata.policy = policy.id;
	metadata.ttl = policy.ttl;

	// const utxos = await L.lucid.wallet.getUtxos();
	// const asset = `${policy.id}${Buffer.from(assetName, "hex").toString("hex")}`;
	const asset = `${policy.id}${assetName}`;

	const address = await L.lucid.wallet.address();
	const utxo = await L.lucid.utxosAtWithUnit(address, asset);
	if (utxo.length > 0) {
		throw new Error(errorTypes.NFT_MINTED);
	}

	let mintToken = {
		[asset]: 1n,
	};

	if (options.burn && options.burn == true) {
		mintToken[options.asset] = -1n;
	}

	if (options.policy && options.policy.reuse && options.policy.reuse == true && options.policy.id !== policy.id) {
		logger.error("POLICY_ID_DIFFERENCE:", options.policy.id, policy.id);
		throw new Error(errorTypes.ERROR_WHILE_REUSING_POLICY_ID);
	}

	const tx = await L.lucid.newTx()
		.attachMintingPolicy(policy)
		.attachMetadataWithConversion(721, {
			[`0x${policy.id}`]: {
				[`0x${assetName}`]: metadata,
			},
			version: 2,
		})
		.mintAssets(mintToken)
		.validTo(L.lucid.utils.slotToUnixTime(policy.ttl))
		.payToAddress(address, mintToken)
		.complete();

	const signedTx = await tx.sign().complete();

	let txHash = null;
	try {
		txHash = await signedTx.submit();
		await L.lucid.awaitTx(txHash);
		logger.info("Minted", txHash);
		await getAssetDetails(asset);
	} catch (error) {
		logger.error(error);
		throw new Error(errorTypes.TRANSACTION_REJECT);
	}

	logger.info("[Mint NFT] finish");
	return { policy, asset, txHash, walletId };
};

export const BurnNFT = async ({ config }) => {
	logger.info("[Burn NFT] start");

	// const utxos = await L.lucid.wallet.getUtxos();
	const address = await L.lucid.wallet.address();
	const utxo = await L.lucid.utxosAtWithUnit(address, config.asset);

	if (utxo.length > 0) {

		const tx = await L.lucid.newTx()
			.collectFrom(utxo)
			.attachMintingPolicy(config.policy)
			.mintAssets({
				[config.asset]: -1n
			})
			.validTo(L.lucid.utils.slotToUnixTime(config.policy.ttl))
			.complete();

		const signedTx = await tx.sign().complete();

		try {
			const txHash = await signedTx.submit();
			await L.lucid.awaitTx(txHash);
			logger.info("Burned", txHash);

			if (memoryCache.get(config.asset)) {
				memoryCache.ttl(config.asset, 0);
				memoryCache.del(config.asset);
			}

		} catch (error) {
			logger.error(error);
			throw new Error(errorTypes.TRANSACTION_REJECT);
		}

		logger.info("[Burn NFT] finish");
	} else {
		throw new Error(errorTypes.NFT_COULD_NOT_BE_FOUND_IN_WALLET);
	}
};