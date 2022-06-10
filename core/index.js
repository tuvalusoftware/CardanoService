/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const Blockfrost = require('@blockfrost/blockfrost-js');
const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');
const { verifyMS } = require('./MessageSigning');
const bip39 = require('bip39');
const md5 = require('md5');
require('dotenv').config();

const blockFrostApi = new Blockfrost.BlockFrostAPI({
  projectId: process.env.blockFrostApiKey,
  isTestnet: process.env.isTestnet,
});

const getDatumValueFromDatumHash = async (datumHash) => {
  try {
    const datumValue = await blockFrostApi.scriptsDatum(datumHash);
    return datumValue;
  } catch (error) {
    throw error;
  }
};

const getLatestBlock = async () => {
  try {
    const latestBlock = await blockFrostApi.blocksLatest();
    return latestBlock;
  } catch (error) {
    throw error;
  }
};

const getLatestEpoch = async () => {
  try {
    const latestEpoch = await blockFrostApi.epochsLatest();
    return latestEpoch;
  } catch (error) {
    throw error;
  }
};

const getProtocolParameters = async (epoch) => {
  try {
    const protocolParameters = await blockFrostApi.epochsParameters(epoch);
    return protocolParameters;
  } catch (error) {
    throw error;
  }
};

const getLatestEpochProtocolParameters = async () => {
  try {
    const latestEpoch = await getLatestEpoch();
    const latestBlock = await getLatestBlock();
    const protocolParameters = await getProtocolParameters(latestEpoch.epoch);
    return { ...protocolParameters, latestBlock };
  } catch (error) {
    throw error;
  }
};

const getMetadataByLabel = async (label) => {
  try {
    const metadata = await blockFrostApi.metadataTxsLabel(label);
    return metadata;
  } catch (error) {
    throw error;
  }
}

const getAssetsFromAddress = async (address) => {
  try {
    const listAssets = await blockFrostApi.addresses(address);
    return listAssets.amount || [];
  } catch (error) {
    throw error;
  }
};

const getAddressesFromAssetId = async (assetId) => {
  try {
    const listAddresses = await blockFrostApi.assetsAddresses(assetId);
    return listAddresses;
  } catch (error) {
    if (error instanceof Blockfrost.BlockfrostServerError && error.status_code === 404) {
      return [];
    } else {
      throw error;
    }
  }
};

const getSpecificAssetByAssetId = async (asset) => {
  try {
    const assetInfo = await blockFrostApi.assetsById(asset);
    return assetInfo;
  } catch (error) {
    if (error instanceof Blockfrost.BlockfrostServerError && error.status_code === 404) {
      throw new Error('Please wait for an NFT to be synced to the block chain');
    } else {
      throw error;
    }
  }
};

const getSpecificAssetsByPolicyId = async (policyId) => {
  try {
    const assetInfo = await blockFrostApi.assetsPolicyById(policyId);
    return assetInfo;
  } catch (error) {
    if (error instanceof Blockfrost.BlockfrostServerError && error.status_code === 404) {
      throw new Error('Please wait for an NFT to be synced to the block chain');
    } else {
      throw error;
    }
  }
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
  const decodedAddress = baseAddress.to_address().to_bech32();
  return { signKey: utxoKey.to_raw_key(), baseAddress: baseAddress.to_address(), decodedAddress: decodedAddress };
};

const getAddressUtxos = async(address) => {
  try {
   const addressUtxo = await blockFrostApi.addressesUtxosAll(address);
   return addressUtxo;
  } catch (error) {
    if (error instanceof Blockfrost.BlockfrostServerError && error.status_code === 404) {
      return [];
    } else {
      throw error;
    }
  }
}

const getServerAccount = () => {
  const mNemonic = process.env.mNemonic;
  const { signKey, baseAddress, decodedAddress } = deriveAddressPrvKey(mnemonicToPrivateKey(mNemonic), process.env.isTestnet);
  return { serverSignKey: signKey, serverBaseAddress: baseAddress, serverDecodedAddress: decodedAddress };
}

const getPolicyIdFrommNemonic = async (mNemonic, isMNemonic = true) => {
  if (!isMNemonic) {
    mNemonic = bip39.entropyToMnemonic(mNemonic);
  }
  const { serverBaseAddress } = getServerAccount();
  const bip32PrvKey = mnemonicToPrivateKey(mNemonic);
  const { signKey, baseAddress, decodedAddress } = deriveAddressPrvKey(bip32PrvKey, process.env.isTestnet);
  const scripts = CardanoWasm.NativeScripts.new();
  /* Add document cardano address to script */
  const policyKeyHash = CardanoWasm.BaseAddress.from_address(baseAddress).payment_cred().to_keyhash();
  const keyHashScript = CardanoWasm.NativeScript.new_script_pubkey(CardanoWasm.ScriptPubkey.new(policyKeyHash));
  scripts.add(keyHashScript);
  /* Add server address to script */
  const policyServerKeyHash = CardanoWasm.BaseAddress.from_address(serverBaseAddress).payment_cred().to_keyhash();
  const serverKeyHashScript = CardanoWasm.NativeScript.new_script_pubkey(CardanoWasm.ScriptPubkey.new(policyServerKeyHash));
  scripts.add(serverKeyHashScript);
  // Add time to live to script
  const ttl = 3155695200;
  // const lockScript = CardanoWasm.NativeScript.new_timelock_expiry(CardanoWasm.TimelockExpiry.new(ttl));
  // scripts.add(lockScript);
  const mintScript = CardanoWasm.NativeScript.new_script_all(CardanoWasm.ScriptAll.new(scripts));
  const policyId = Buffer.from(mintScript.hash().to_bytes()).toString('hex');
  return { signKey, baseAddress, decodedAddress, mintScript, policyId, ttl };
};

const findOptimalUtxo = (utxo) => {
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
  return bestUtxo;
};

const initTransactionBuilder = async () => {
  const protocolParameters = await getLatestEpochProtocolParameters();
  const transactionBuilder = CardanoWasm.TransactionBuilder.new(
    CardanoWasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        CardanoWasm.LinearFee.new(
          CardanoWasm.BigNum.from_str(protocolParameters.min_fee_a.toString()),
          CardanoWasm.BigNum.from_str(protocolParameters.min_fee_b.toString())
        )
      )
      .coins_per_utxo_word(CardanoWasm.BigNum.from_str(protocolParameters.min_utxo.toString()))
      .pool_deposit(CardanoWasm.BigNum.from_str(protocolParameters.pool_deposit.toString()))
      .key_deposit(CardanoWasm.BigNum.from_str(protocolParameters.key_deposit.toString()))
      .max_value_size(parseInt(protocolParameters.max_val_size))
      .max_tx_size(protocolParameters.max_tx_size)
      .build()
  );
  return transactionBuilder;
}

const addInputAndNftToTransaction = (transactionBuilder, serverBaseAddress, bestUtxo, mintScript, assetName, metadata, ttl, outputAddress) => {
  /* Get private keyhash from server account */
  const privKeyHash = CardanoWasm.BaseAddress.from_address(serverBaseAddress).payment_cred().to_keyhash();

  /* Add input to transaction */
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

  /* Add an NFT to the transaction */
  transactionBuilder.add_mint_asset_and_output_min_required_coin(
    mintScript,
    CardanoWasm.AssetName.new(Buffer.from(assetName)),
    CardanoWasm.Int.new_i32(1),
    CardanoWasm.TransactionOutputBuilder.new().with_address(
      CardanoWasm.Address.from_bech32(outputAddress)
    ).next(),
  );

  /* Add an NFT metadata to the transaction */
  transactionBuilder.set_ttl(ttl);
  transactionBuilder.add_json_metadatum(
    CardanoWasm.BigNum.from_str('721'),
    JSON.stringify(metadata),
  );

  transactionBuilder.add_change_if_needed(serverBaseAddress);
  return transactionBuilder;
};

const signTransaction = (transactionBuilder, serverSignKey, documentSignKey, mintScript) => {
  const transactionBody = transactionBuilder.build();
  const transactionHash = CardanoWasm.hash_transaction(transactionBody);
  const witnesses = CardanoWasm.TransactionWitnessSet.new();
  const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
  vkeyWitnesses.add(CardanoWasm.make_vkey_witness(transactionHash, serverSignKey));
  vkeyWitnesses.add(CardanoWasm.make_vkey_witness(transactionHash, documentSignKey));
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
  return transaction;
};

const findOriginHashOfDocument = async (policyId, hashOfDocument) => {
  const assetName = md5(hashOfDocument);
  const assetId = `${policyId}${Buffer.from(assetName).toString('hex')}`;
  const assetInfo = await getSpecificAssetByAssetId(assetId);
  if (assetInfo) {
    const originHashOfDocument = assetInfo.onchain_metadata.originHashOfDocument || undefined;
    if (originHashOfDocument) {
      return originHashOfDocument;
    }
    throw new Error('Origin hash of document not found');
  }
  throw new Error('Asset not found');
};

const createNftTransaction = async (outputAddress, hashOfDocument, isUpdate = false) => {
  /* Determine: update or not ? */
  let previousHashOfDocument = 'EMPTY';
  let originPolicyId = 'EMPTY';
  if (isUpdate) {
    const arrayOfHash = hashOfDocument.split(',');
    if (arrayOfHash.length !== 3) {
      throw new Error('Error while split hash of document');
    }
    hashOfDocument = arrayOfHash[0];
    previousHashOfDocument = arrayOfHash[1];
    originPolicyId = arrayOfHash[2];
  }

  /* Define asset name from hash of document */
  const assetName = md5(hashOfDocument);

  /* Get server account */
  const { serverSignKey, serverBaseAddress, serverDecodedAddress } = getServerAccount();

  /* Get the first policy Id of document */
  const originHashOfDocument = isUpdate ? (await findOriginHashOfDocument(originPolicyId, previousHashOfDocument)) : hashOfDocument;

  /* Get a document cardano account */
  const { signKey, mintScript, policyId, ttl } = await getPolicyIdFrommNemonic(isUpdate ? originHashOfDocument : hashOfDocument, false);

  /* Define an asset id */
  const assetId = `${policyId}${Buffer.from(assetName).toString('hex')}`;

  /* An NFT is minted or not ? */
  const listAddresses = await getAddressesFromAssetId(assetId);
  if (listAddresses.length > 0 && listAddresses.find(a => a.address === outputAddress)) {
    throw new Error('NFT Minted');
  }

  /* Query an utxo on server account */
  let utxo = await getAddressUtxos(serverDecodedAddress);
  if (utxo.length === 0) {
    throw new Error(`You should send ADA to ${serverDecodedAddress} to have enough funds to sent a transaction.`);
  }
  const bestUtxo = findOptimalUtxo(utxo);
  if (bestUtxo === null) {
    throw new Error('Utxo not found');
  }

  /* Build a transaction */
  let transactionBuilder = await initTransactionBuilder();
  
  /* Define an NFT metadata */
  const metadata = {
    [policyId]: {
      [assetName]: {
        name: assetName,
        hashOfDocument: hashOfDocument,
        originHashOfDocument: originHashOfDocument,
        address: md5(outputAddress),
      },
    },
  };

  transactionBuilder = addInputAndNftToTransaction(transactionBuilder, serverBaseAddress, bestUtxo, mintScript, assetName, metadata, ttl, outputAddress);
  const transaction = signTransaction(transactionBuilder, serverSignKey, signKey, mintScript);
  
  /* Submit a transaction */
  try {
    const result = await submitSignedTransaction(transaction.to_bytes());
    console.log(`Transaction successfully submitted: ${result}`)
    return { policyId, assetId };
  } catch (error) {
    if (error instanceof Blockfrost.BlockfrostServerError && error.status_code === 400) {
      console.log(error);
      throw new Error(`Transaction rejected`);
    } else {
      throw error;
    }
  }
}

const submitSignedTransaction = async (signedTransaction) => {
  try {
    const txHash = await blockFrostApi.txSubmit(signedTransaction);
    return txHash;
  } catch (error) {
    throw error;
  }
}

const checkIfNftMinted = async (policyID, hashOfDocument) => {
  const assetName = md5(hashOfDocument);
  const { policyId } = await getPolicyIdFrommNemonic(hashOfDocument, false);
  if (policyID !== policyId) {
    throw new Error('Policy ID not matching');
  }
  const assetId = `${policyID}${Buffer.from(assetName).toString('hex')}`;
  const assetInfo = await getSpecificAssetByAssetId(assetId);
  if (assetInfo) {
    const ownerAddress = assetInfo.onchain_metadata.address || undefined;
    if (!ownerAddress) {
      throw new Error('Owner address not found');
    } 
    const listAddresses = await getAddressesFromAssetId(assetId);
    if (listAddresses.length > 0 && listAddresses.find(a => md5(a.address) === ownerAddress) !== undefined) {
      return true;
    }
    throw new Error('NFT Burned');
  }
  return false;
};

const verifySignature = async (address, payload, signature) => {
  try { 
    if (verifyMS(address, payload, signature)) {
      return true;
    }
  } catch (error) {
    throw error;
  }
  return false;
}

const verifySignatures = async (signatures) => {
  let results = [];
  for (let i = 0; i < signatures.length; i++) {
    const address = signatures[i].address;
    const payload = signatures[i].payload;
    const signature = signatures[i].signature;
    try {
      results.push(await verifySignature(address, payload, signature));
    } catch (error) {
      throw error;
    }
  }
  return results;
}

module.exports = {
  getAddressUtxos,
  getLatestBlock,
  getLatestEpoch,
  getDatumValueFromDatumHash,
  getProtocolParameters,
  getAddressesFromAssetId,
  getLatestEpochProtocolParameters,
  getMetadataByLabel,
  getAssetsFromAddress,
  getSpecificAssetByAssetId,
  getSpecificAssetsByPolicyId,
  getPolicyIdFrommNemonic,
  mnemonicToPrivateKey,
  deriveAddressPrvKey,
  createNftTransaction,
  submitSignedTransaction,
  checkIfNftMinted,
  verifySignature,
  verifySignatures,
};