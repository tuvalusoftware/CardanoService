/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const Blockfrost = require('@blockfrost/blockfrost-js');
const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');
const CardanoMS = require("@emurgo/cardano-message-signing-nodejs");
const bip39 = require('bip39');
const md5 = require('md5');
require('dotenv').config();

/**
 * Copied from https://github.com/Berry-Pool/nami-wallet/blob/main/MessageSigning.md
 * @param {string} address - hex encoded
 * @param {string} payload - hex encoded
 * @param {string} coseSign1Hex - hex encoded
 */
 const verify = (address, payload, coseSign1Hex) => {
  const coseSign1 = CardanoMS.COSESign1.from_bytes(Buffer.from(coseSign1Hex, 'hex'));
  const payloadCose = coseSign1.payload();
  if (verifyPayload(payload, payloadCose)) {
    throw new Error('Payload does not match');
  }
  const protectedHeaders = coseSign1.headers().protected().deserialized_headers();
  const addressCose = CardanoWasm.Address.from_bytes(protectedHeaders.header(CardanoMS.Label.new_text('address')).as_bytes());
  const publicKeyCose = CardanoWasm.PublicKey.from_bytes(protectedHeaders.key_id());
  if (!verifyAddress(address, addressCose, publicKeyCose)) {
    throw new Error('Could not verify because of address mismatch');
  }
  const signature = CardanoWasm.Ed25519Signature.from_bytes(coseSign1.signature());
  const data = coseSign1.signed_data().to_bytes();
  return publicKeyCose.verify(data, signature);
};

// Modified by tkhang@ferdon.io
const verifyPayload = (payload, payloadCose) => {
  // return Buffer.from(payloadCose, 'hex').compare(Buffer.from(payload, 'hex'));
  const hexMessage = Buffer.from(payloadCose, 'hex').toString();
  return hexMessage == payload;
};

const verifyAddress = (address, addressCose, publicKeyCose) => {
  const checkAddress = CardanoWasm.Address.from_bytes(Buffer.from(address, 'hex'));
  if (addressCose.to_bech32() !== checkAddress.to_bech32()) return false;
  // Check if BaseAddress
  try {
    const baseAddress = CardanoWasm.BaseAddress.from_address(addressCose);
    // Reconstruct address
    const paymentKeyHash = publicKeyCose.hash();
    const stakeKeyHash = baseAddress.stake_cred().to_keyhash();
    const reconstructedAddress = CardanoWasm.BaseAddress.new(
      checkAddress.network_id(),
      CardanoWasm.StakeCredential.from_keyhash(paymentKeyHash),
      CardanoWasm.StakeCredential.from_keyhash(stakeKeyHash)
    );
    if (checkAddress.to_bech32() !== reconstructedAddress.to_address().to_bech32()) {
      return false;
    }
    return true;
  } catch (error) {
    throw new Error(error);
  }
  // Check if RewardAddress
  try {
    // Reconstruct address
    const stakeKeyHash = publicKeyCose.hash();
    const reconstructedAddress = CardanoWasm.RewardAddress.new(
      checkAddress.network_id(),
      CardanoWasm.StakeCredential.from_keyhash(stakeKeyHash)
    );
    if (checkAddress.to_bech32() !== reconstructedAddress.to_address().to_bech32()) {
      return false;
    }
    return true;
  } catch (error) {
    throw new Error(error);
  }
  return false;
};

const blockFrostApi = new Blockfrost.BlockFrostAPI({
  projectId: process.env.blockFrostApiKey,
  isTestnet: process.env.isTestnet,
});

const getDatumValueFromDatumHash = async (datumHash) => {
  try {
    const datumValue = await blockFrostApi.scriptsDatum(datumHash);
    return datumValue;
  } catch (error) {
    throw new Error;
  }
};

const getLatestBlock = async () => {
  try {
    const latestBlock = await blockFrostApi.blocksLatest();
    return latestBlock;
  } catch (error) {
    throw new Error(error);
  }
};

const getLatestEpoch = async () => {
  try {
    const latestEpoch = await blockFrostApi.epochsLatest();
    return latestEpoch;
  } catch (error) {
    throw new Error(error);
  }
};

const getProtocolParameters = async (epoch) => {
  try {
    const protocolParameters = await blockFrostApi.epochsParameters(epoch);
    return protocolParameters;
  } catch (error) {
    throw new Error(error);
  }
};

const getLatestEpochProtocolParameters = async () => {
  try {
    const latestEpoch = await getLatestEpoch();
    const latestBlock = await getLatestBlock();
    const protocolParameters = await getProtocolParameters(latestEpoch.epoch);
    return { ...protocolParameters, latestBlock };
  } catch (error) {
    throw new Error(error);
  }
};

const getMetadataByLabel = async (label) => {
  try {
    const metadata = await blockFrostApi.metadataTxsLabel(label);
    return metadata;
  } catch (error) {
    throw new Error(error);
  }
}

const getAssetsFromAddress = async (address) => {
  let listAssets = [];
  try {
    listAssets = await blockFrostApi.addresses(address);
  } catch (error) {
    throw new Error(error);
  }
  return listAssets.amount;
};

const getAddressesFromAssetId = async (assetId) => {
  let listAddresses = [];
  try {
    listAddresses = await blockFrostApi.assetsAddresses(assetId);
  } catch (error) {
    if (error instanceof Blockfrost.BlockfrostServerError && error.status_code === 404) {
      listAddresses = [];
    } else {
      throw error;
    }
  }
  return listAddresses;
};

const getSpecificAssetByAssetId = async (asset) => {
  let assetInfo = {};
  try {
    assetInfo = await blockFrostApi.assetsById(asset);
  } catch (error) {
    throw new Error(error);
  }
  return assetInfo;
};

const getSpecificAssetByPolicyId = async (policyId) => {
  let assetInfo = {};
  try {
    assetInfo = await blockFrostApi.assetsPolicyById(policyId);
  } catch (error) {
    throw new Error(error);
  }
  return assetInfo;
};

const mnemonicToPrivateKey = (mnemonic) => {
  const entropy = bip39.mnemonicToEntropy(mnemonic);
  const rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(entropy, 'hex'),
    Buffer.from('')
  );
  return rootKey;
};

const deriveAddressPrvKey = (bipPrvKey, isTestnet) => {
  const networkId = isTestnet ? CardanoWasm.NetworkInfo.testnet().network_id() : CardanoWasm.NetworkInfo.mainnet().network_id();
  const harden = (number) => {
    return 0x80000000 + number;
  };
  const accountKey = bipPrvKey
    .derive(harden(1852))
    .derive(harden(1815))
    .derive(harden(0));
  const utxoKey = accountKey
    .derive(0)
    .derive(0);
  const stakeKey = accountKey
    .derive(2)
    .derive(0)
    .to_public();
  const baseAddress = CardanoWasm.BaseAddress.new(
    networkId,
    CardanoWasm.StakeCredential.from_keyhash(utxoKey.to_public().to_raw_key().hash()),
    CardanoWasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()),
  );
  const address = baseAddress.to_address().to_bech32();
  return { signKey: utxoKey.to_raw_key(), baseAddress: baseAddress.to_address(), address: address };
};

const getAddressUtxos = async(address) => {
  let addressUtxo = [];
  try {
   addressUtxo = await blockFrostApi.addressesUtxosAll(address);
  } catch (error) {
    if (error instanceof Blockfrost.BlockfrostServerError && error.status_code === 404) {
      addressUtxo = [];
    } else {
      throw error;
    }
  }
  return addressUtxo;
}

const createNftTransaction = async (outputAddress, hash) => {
  const assetName = md5(hash);
  const mNemonic = process.env.mNemonic;
  const bip32PrvKey = mnemonicToPrivateKey(mNemonic);
  const { signKey, baseAddress, address } = deriveAddressPrvKey(bip32PrvKey, process.env.isTestnet);
  // console.log(`Using address ${address}`);
  let utxo = await getAddressUtxos(address);
  if (utxo.length === 0) {
    throw Error(`You should send ADA to ${address} to have enough funds to sent a transaction.`);
  }
  // console.log(`Utxo on ${address}`);
  // console.log(JSON.stringify(utxo, undefined, 4));
  const latestBlock = await getLatestBlock();
  const currentSlot = latestBlock.slot;
  if (!currentSlot) {
    throw new Error('Failed to fetch slot number');
  }
  const transactionBuilder = CardanoWasm.TransactionBuilder.new(
    CardanoWasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        CardanoWasm.LinearFee.new(
          CardanoWasm.BigNum.from_str('44'),
          CardanoWasm.BigNum.from_str('155381')
        )
      )
      .coins_per_utxo_word(CardanoWasm.BigNum.from_str('34482'))
      .pool_deposit(CardanoWasm.BigNum.from_str('500000000'))
      .key_deposit(CardanoWasm.BigNum.from_str('2000000'))
      .max_value_size(5000)
      .max_tx_size(16384)
      .build()
  );
  const scripts = CardanoWasm.NativeScripts.new();
  const policyKeyHash = CardanoWasm.BaseAddress.from_address(baseAddress).payment_cred().to_keyhash();
  const keyHashScript = CardanoWasm.NativeScript.new_script_pubkey(CardanoWasm.ScriptPubkey.new(policyKeyHash));
  scripts.add(keyHashScript);
  const ttl = 3155695200;
  const lockScript = CardanoWasm.NativeScript.new_timelock_expiry(CardanoWasm.TimelockExpiry.new(ttl));
  scripts.add(lockScript);
  const mintScript = CardanoWasm.NativeScript.new_script_all(CardanoWasm.ScriptAll.new(scripts));
  const privKeyHash = CardanoWasm.BaseAddress.from_address(baseAddress).payment_cred().to_keyhash();
  let bestUtxo = null;
  for (let id = 0; id < utxo.length; ++id) {
    const u = utxo[id];
    if (bestUtxo === null) {
      bestUtxo = u;
    }
    const amount = (u.amount.find(a => a.unit === 'lovelace')?.quantity || 0);
    if (amount > (bestUtxo.amount.find(a => a.unit === 'lovelace')?.quantity || 0)) {
      bestUtxo = u;
    }
  }
  if (bestUtxo === null) {
    throw new Error('Utxo not found');
  }
  // console.log("Utxo", bestUtxo);
  transactionBuilder.add_key_input(
    privKeyHash,
    CardanoWasm.TransactionInput.new(
      CardanoWasm.TransactionHash.from_bytes(Buffer.from(bestUtxo.tx_hash, 'hex')),
      bestUtxo.tx_index,
    ),
    CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(
      (bestUtxo.amount.find(a => a.unit === 'lovelace')?.quantity || 0).toString(),
    )),
  );
  transactionBuilder.add_mint_asset_and_output_min_required_coin(
    mintScript,
    CardanoWasm.AssetName.new(Buffer.from(assetName)),
    CardanoWasm.Int.new_i32(1),
    CardanoWasm.TransactionOutputBuilder.new().with_address(CardanoWasm.Address.from_bech32(outputAddress)).next(),
  );
  const policyId = Buffer.from(mintScript.hash().to_bytes()).toString('hex');
  const assetId = `${policyId}${Buffer.from(assetName).toString('hex')}`;
  const listAddresses = await getAddressesFromAssetId(assetId);
  if (listAddresses.length > 0 && listAddresses.find(a => a.address === outputAddress)) {
    throw new Error('NFT Minted');
  }
  const metadata = {
    [policyId]: {
      [assetName]: {
        name: assetName,
        hash: hash,
        address: md5(outputAddress),
      },
    },
  };
  transactionBuilder.set_ttl(ttl);
  transactionBuilder.add_json_metadatum(
    CardanoWasm.BigNum.from_str('721'),
    JSON.stringify(metadata),
  );
  transactionBuilder.add_change_if_needed(baseAddress);
  const transactionBody = transactionBuilder.build();
  const transactionHash = CardanoWasm.hash_transaction(transactionBody);
  const witnesses = CardanoWasm.TransactionWitnessSet.new();
  const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
  vkeyWitnesses.add(CardanoWasm.make_vkey_witness(transactionHash, signKey));
  witnesses.set_vkeys(vkeyWitnesses);
  witnesses.set_native_scripts;
  const witnessScripts = CardanoWasm.NativeScripts.new();
  witnessScripts.add(mintScript);
  witnesses.set_native_scripts(witnessScripts);
  const unsignedTransaction = transactionBuilder.build_tx();
  const transaction = CardanoWasm.Transaction.new(
    unsignedTransaction.body(),
    witnesses,
    unsignedTransaction.auxiliary_data(),
  );
  console.log("Here");
  try {
    const result = await submitSignedTransaction(transaction.to_bytes());
    console.log(`Transaction successfully submitted: ${result}`)
  } catch (error) {
    // Submit could fail if the transactions is rejected by cardano node
    if (error instanceof Blockfrost.BlockfrostServerError && error.status_code === 400) {
      console.log(`Transaction ${transactionHash} rejected`);
      console.log("Hi", error.message);
    } else {
      throw error;
    }
  }
}

const submitSignedTransaction = async (signedTransaction) => {
  let txHash = null;
  try {
    txHash = await blockFrostApi.txSubmit(signedTransaction);
  } catch (error) {
    console.log("Hello", error);
    throw new Error(error);
  }
  return txHash;
}

const checkIfNftMinted = async (hash) => {
  const policyID = getCurrentPolicyId();
  const assetName = md5(hash);
  const assetId = `${policyID}${Buffer.from(assetName).toString('hex')}`;
  const listAssets = await blockFrostApi.assetsById(assetId);
  if (listAssets) {
    const ownerAddress = (listAssets.onchain_metadata.address || undefined);
    if (!ownerAddress) {
      throw new Error('Owner address not found');
    } 
    const listAddresses = await getAddressesFromAssetId(assetId);
    const md5OwnerAddress = md5(ownerAddress);
    if (listAddresses.length > 0 && listAddresses.find(a => a.address === md5OwnerAddress)) {
      return true;
    }
    throw new Error('NFT Burned');
  }
  return false;
};

const getCurrentPolicyId = () => {
  if (!process.env.policyId) {
    throw new Error('PolicyID not found');
  }
  return process.env.policyId;
}

const verifySignature = async (address, payload, signature) => {
  try { 
    if (verify(address, payload, signature)) {
      return true;
    }
  } catch (error) {
    throw new Error(error);
  }
  return false;
}

module.exports = {
  getAddressUtxos,
  mnemonicToPrivateKey,
  deriveAddressPrvKey,
  getLatestBlock,
  getLatestEpoch,
  getDatumValueFromDatumHash,
  getProtocolParameters,
  getAddressesFromAssetId,
  getLatestEpochProtocolParameters,
  getMetadataByLabel,
  getAssetsFromAddress,
  getSpecificAssetByAssetId,
  getSpecificAssetByPolicyId,
  checkIfNftMinted,
  getCurrentPolicyId,
  createNftTransaction,
  submitSignedTransaction,
  verifySignature,
};