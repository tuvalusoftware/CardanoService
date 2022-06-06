const CardanoMS = require('@emurgo/cardano-message-signing-nodejs');
const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');
/**
 * Copied from https://github.com/Berry-Pool/nami-wallet/blob/main/MessageSigning.md
 * @param {string} address - hex encoded
 * @param {string} payload - hex encoded
 * @param {string} coseSign1Hex - hex encoded
 */
 const verifyMS = (address, payload, coseSign1Hex) => {
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

/* Modified by tkhang@ferdon.io */
const verifyPayload = (payload, payloadCose) => {
  return Buffer.from(payloadCose, 'hex').toString() === payload;
};

const verifyAddress = (address, addressCose, publicKeyCose) => {
  const checkAddress = CardanoWasm.Address.from_bytes(Buffer.from(address, 'hex'));
  if (addressCose.to_bech32() !== checkAddress.to_bech32()) return false;
  try {
    const baseAddress = CardanoWasm.BaseAddress.from_address(addressCose);
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
    throw error;
  }
  try {
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
    throw error;
  }
  return false;
};

module.exports = {
  verifyMS,
};