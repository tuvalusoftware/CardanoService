const core = require('./index')

const CardanoMS = require('@emurgo/cardano-message-signing-nodejs');
const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');

const { serverSignKey, serverDecodedAddress } = core.getServerAccount();

const signData = (payload) => {
  const protectedHeaders = CardanoMS.HeaderMap.new();
  protectedHeaders.set_algorithm_id(
    CardanoMS.Label.from_algorithm_id(CardanoMS.AlgorithmId.EdDSA)
  );
  protectedHeaders.set_key_id(serverSignKey.to_public().as_bytes());
  protectedHeaders.set_header(
    CardanoMS.Label.new_text('address'),
    CardanoMS.CBORValue.new_bytes(CardanoWasm.Address.from_bech32(serverDecodedAddress).to_bytes())
  );
  const protectedSerialized = CardanoMS.ProtectedHeaderMap.new(protectedHeaders);
  const unprotectedHeaders = CardanoMS.HeaderMap.new();
  const headers = CardanoMS.Headers.new(
    protectedSerialized,
    unprotectedHeaders
  );
  const builder = CardanoMS.COSESign1Builder.new(
    headers,
    Buffer.from(payload, 'hex'),
    false
  );
  const toSign = builder.make_data_to_sign().to_bytes();
  const signedSigStruc = serverSignKey.sign(toSign).to_bytes();
  const coseSign1 = builder.build(signedSigStruc);
  return Buffer.from(coseSign1.to_bytes(), 'hex').toString('hex');
};

module.exports = {
  signData,
};