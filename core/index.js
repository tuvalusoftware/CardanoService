/**
 *
 * Copyright (c) 2022 - Fuixlabs
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const Blockfrost = require('@blockfrost/blockfrost-js');
const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');
const bip39 = require('bip39');
require('dotenv').config();

const blockFrostApi = new Blockfrost.BlockFrostAPI({
  projectId: process.env.blockFrostApiKey,
  isTestnet: process.env.isTestnet,
});

const getLatestBlock = async () => {
  const latestBlock = await blockFrostApi.blocksLatest();
  return latestBlock;
};

const getLatestEpoch = async () => {
  const latestEpoch = await blockFrostApi.epochsLatest();
  return latestEpoch;
};

const getProtocolParameters = async (epoch) => {
  const protocolParameters = await blockFrostApi.epochsParameters(epoch);
  return protocolParameters;
};

const getLatestEpochProtocolParameters = async () => {
  const latestEpoch = await getLatestEpoch();
  const latestBlock = await getLatestBlock();
  const protocolParameters = await getProtocolParameters(latestEpoch.epoch);
  return { ...protocolParameters, latestBlock };
};

const getMetadataByLabel = async (label) => {
  const metadata = await blockFrostApi.metadataTxsLabel(label);
  return metadata;
}

const getAssetsFromAddress = async (address) => {
  let listAssets = [];
  try {
    listAssets = await blockFrostApi.addresses(address);
  } catch (error) {
    return listAssets;
  }
  return listAssets.amount;
};

const getSpecificAssetByAssetId = async (asset) => {
  const assetInfo = await blockFrostApi.assetsById(asset);
  return assetInfo;
};

const getSpecificAssetByPolicyId = async (policyId) => {
  const assetInfo = await blockFrostApi.assetsPolicyById(policyId);
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

const createNftTransaction = async (outputAddress, assetName) => {
  const MNEMONIC = process.env.MNEMONIC;
  const bip32PrvKey = mnemonicToPrivateKey(MNEMONIC);
  const { signKey, baseAddress, address } = deriveAddressPrvKey(bip32PrvKey, process.env.isTestnet);
  console.log(`Using address ${address}`);
  let utxo = await getAddressUtxos(address);
  if (utxo.length === 0) {
    throw Error(`You should send ADA to ${address} to have enough funds to sent a transaction.`);
  }
  console.log(`Utxo on ${address}`);
  console.log(JSON.stringify(utxo, undefined, 4));
  const latestBlock = await getLatestBlock();
  const currentSlot = latestBlock.slot;
  if (!currentSlot) {
    throw Error('Failed to fetch slot number');
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
    throw Error('Utxo not found.');
  }
  console.log(bestUtxo);
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
  console.log('policyID: ', policyId);
  const metadata = {
    [policyId]: {
      [assetName]: {
        document: assetName,
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
  // vkeyWitnesses.add(CardanoWasm.make_vkey_witness(transactionHash, signKey));
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
  try {
    const result = await submitSignedTransaction(transaction.to_bytes());
    if (!result) {
      console.log(`Transaction successfully submitted: ${result}`)
    }
  } catch (error) {
    // Submit could fail if the transactions is rejected by cardano node
    if (error instanceof Blockfrost.BlockfrostServerError && error.status_code === 400) {
      console.log(`Transaction ${transactionHash} rejected`);
      console.log(error.message);
    } else {
      throw error;
    }
  }
}

const submitSignedTransaction = async (signedTransaction) => {
  const txHash = await blockFrostApi.txSubmit(signedTransaction);
  return txHash;
}

const checkIfNftMinted = async (assetName) => {
  const policyID = `1050dd64e77e671a0fee81f391080f5f57fefba2e26a816019aa5524`;
  const assetId = `${policyID}${Buffer.from(assetName).toString('hex')}`;
  console.log(assetId);
  const listAssets = await blockFrostApi.assetsById(assetId);
  console.log(listAssets);
  return false;
};

module.exports = {
  getLatestBlock,
  getLatestEpoch,
  getProtocolParameters,
  getLatestEpochProtocolParameters,
  getMetadataByLabel,
  getAssetsFromAddress,
  getSpecificAssetByAssetId,
  getSpecificAssetByPolicyId,
  checkIfNftMinted,
  createNftTransaction,
  submitSignedTransaction,
};