const core = require('../core');
const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');
const { getWords } = require('../core/bip39');
const bip39 = require('bip39');
require('dotenv').config();

const convertToNumber = (s) => {
  let result = 0;
  for (let id = 0; id < s.length; ++id) {
    result = (result * 10 + s.charCodeAt(id) - 48) % 2049;
  }
  return result;
}

const Resolve = (hashOfDocument) => {
  if (!process.env.mNemonic || !process.env.isTestnet) {
    throw new Error('mNemonic or isTestnet (in .env file) not found');
  }
  const bip39Words = getWords();
  if (bip39Words.length !== 2049) {
    throw new Error('BIP39 words length is not 2049');
  }
  if (hashOfDocument.length !== 64) {
    throw new Error('hashOfDocument must be 64 bytes long');
  }
  const numberOfChar = parseInt(hashOfDocument.length / 12);
  const arrayOfNumber = [];
  for (let cnt = 0; cnt < 12; ++cnt) {
    arrayOfNumber.push(convertToNumber(hashOfDocument.substr(numberOfChar * cnt, numberOfChar + (cnt == 11 ? 4 : 0))));
  } 
  const mNemonic = arrayOfNumber.map(x => bip39Words[x]).join(' ');
  console.log(mNemonic);
  const bip32PrvKey = core.mnemonicToPrivateKey(mNemonic);
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
  console.log(policyId);
};

Resolve('11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987');