const core = require('../core');
const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');
require('dotenv').config();

const Resolve = () => {
  if (!process.env.MNEMONIC || !process.env.isTestnet) {
    throw Error('Error');
  }
  const MNEMONIC = process.env.MNEMONIC;
  const bip32PrvKey = core.mnemonicToPrivateKey(MNEMONIC);
  const { _, baseAddress, __ } = core.deriveAddressPrvKey(bip32PrvKey, process.env.isTestnet);
  const scripts = CardanoWasm.NativeScripts.new();
  const policyKeyHash = CardanoWasm.BaseAddress.from_address(baseAddress).payment_cred().to_keyhash();
  const keyHashScript = CardanoWasm.NativeScript.new_script_pubkey(CardanoWasm.ScriptPubkey.new(policyKeyHash));
  scripts.add(keyHashScript);
  const ttl = 3155695200;
  const lockScript = CardanoWasm.NativeScript.new_timelock_expiry(CardanoWasm.TimelockExpiry.new(ttl));
  scripts.add(lockScript);
  const mintScript = CardanoWasm.NativeScript.new_script_all(CardanoWasm.ScriptAll.new(scripts));
  const policyId = Buffer.from(mintScript.hash().to_bytes()).toString('hex');
  return policyId;
};

console.log(Resolve());