const core = require('../core');
const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');
const bip39 = require('bip39');
const md5 = require('md5');
require('dotenv').config();

const getPolicyIdFromMNemonic = (mNemonicString) => {
  const bip32PrvKey = core.mnemonicToPrivateKey(mNemonicString);
  const { signKey, baseAddress, address } = core.deriveAddressPrvKey(bip32PrvKey, process.env.isTestnet);
  console.log(address);
  const scripts = CardanoWasm.NativeScripts.new();
  const policyKeyHash = CardanoWasm.BaseAddress.from_address(baseAddress).payment_cred().to_keyhash();
  const keyHashScript = CardanoWasm.NativeScript.new_script_pubkey(CardanoWasm.ScriptPubkey.new(policyKeyHash));
  scripts.add(keyHashScript);
  const ttl = 3155695200;
  const lockScript = CardanoWasm.NativeScript.new_timelock_expiry(CardanoWasm.TimelockExpiry.new(ttl));
  scripts.add(lockScript);
  const mintScript = CardanoWasm.NativeScript.new_script_all(CardanoWasm.ScriptAll.new(scripts));
  const policyId = Buffer.from(mintScript.hash().to_bytes()).toString('hex');
  return { mintScript, policyId };
};

const Resolve = (hashOfDocument) => {
  if (!process.env.mNemonic || !process.env.isTestnet) {
    throw new Error('mNemonic or isTestnet (in .env file) not found');
  }
  if (hashOfDocument.length !== 64) {
    throw new Error('hashOfDocument length is not 64');
  }
  const mNemonic = bip39.entropyToMnemonic(md5(hashOfDocument));
  console.log(mNemonic);
  return getPolicyIdFromMNemonic(mNemonic);
};

const { mintScript, policyId } = Resolve('11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987');
console.log(policyId);