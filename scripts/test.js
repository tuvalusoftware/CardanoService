require('dotenv').config();
const CardanoMS = require('@emurgo/cardano-message-signing-nodejs');
const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');
const { CoinSelection } = require('./CoinSelection')

const core = require('../core');

const DATUM_LABEL = 405;
const SELLER_ADDRESS_LABEL = 406;
const BIDDER_ADDRESS_LABEL = 407;

const languageViews = "a141005901d59f1a000302590001011a00060bc719026d00011a000249f01903e800011a000249f018201a0025cea81971f70419744d186419744d186419744d186419744d186419744d186419744d18641864186419744d18641a000249f018201a000249f018201a000249f018201a000249f01903e800011a000249f018201a000249f01903e800081a000242201a00067e2318760001011a000249f01903e800081a000249f01a0001b79818f7011a000249f0192710011a0002155e19052e011903e81a000249f01903e8011a000249f018201a000249f018201a000249f0182001011a000249f0011a000249f0041a000194af18f8011a000194af18f8011a0002377c190556011a0002bdea1901f1011a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000242201a00067e23187600010119f04c192bd200011a000249f018201a000242201a00067e2318760001011a000242201a00067e2318760001011a0025cea81971f704001a000141bb041a000249f019138800011a000249f018201a000302590001011a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a00330da70101ff";

const fromHex = (hex) => Buffer.from(hex, "hex");
const toHex = (bytes) => Buffer.from(bytes).toString("hex");

const CONTRACT = () => {
  const scripts = CardanoWasm.PlutusScripts.new();
  scripts.add(CardanoWasm.PlutusScript.new(fromHex(process.env.HEX_CONTRACT)));
  return scripts;
};

const CONTRACT_ADDRESS = () => {
  return CardanoWasm.Address.from_bech32(
    process.env.CONTRACT_ADDRESS
  );
}

const MARKETPLACE_ADDRESS = () => {
  return CardanoWasm.Address.from_bech32(
    process.env.MARKETPLACE_ADDRESS
  );
}

const initializeTransaction = async () => {
  const protocolParameters = await getLatestEpochProtocolParameters();
  const txBuilder = CardanoWasm.TransactionBuilder.new(
    CardanoWasm.LinearFee.new(
      CardanoWasm.BigNum.from_str(
        protocolParameters.min_fee_a.toString()
      ),
      CardanoWasm.BigNum.from_str(
        protocolParameters.min_fee_b.toString()
      )
    ),
    CardanoWasm.BigNum.from_str(protocolParameters.min_utxo.toString()),
    CardanoWasm.BigNum.from_str(protocolParameters.pool_deposit.toString()),
    CardanoWasm.BigNum.from_str(protocolParameters.key_deposit.toString()),
    protocolParameters.max_val_size,
    protocolParameters.max_tx_size,
    protocolParameters.price_mem,
    protocolParameters.price_step,
    CardanoWasm.LanguageViews.new(Buffer.from(languageViews, "hex"))
  )

  const datums = CardanoWasm.PlutusList.new();
  const metadata = { [DATUM_LABEL]: {}, [SELLER_ADDRESS_LABEL]: {}, [BIDDER_ADDRESS_LABEL]: {} };
  const outputs = CardanoWasm.TransactionOutputs.new();
  return { txBuilder, datums, metadata, outputs };
}

// This is the Spacebudz createOutput function (with some updates for ADABlobs to handle multiple addresses) which will build the output of the transaction
const createOutput = async (address, value, { index, datum, metadata, sellerAddress, bidderAddress } = {}) => {
  const protocolParameters = await getLatestEpochProtocolParameters();
  const minAda = CardanoWasm.min_ada_required(
    value,
    CardanoWasm.BigNum.from_str(protocolParameters.min_utxo),
    datum && CardanoWasm.hash_plutus_data(datum)
  );
  if (minAda.compare(value.coin()) == 1) value.set_coin(minAda);
  const output = CardanoWasm.TransactionOutput.new(address, value);
  if (datum) {
    output.set_data_hash(CardanoWasm.hash_plutus_data(datum));
    metadata[DATUM_LABEL][index] = bytesToArray("0x" + toHex(datum.to_bytes()));
  }
  if (sellerAddress) {
    metadata[SELLER_ADDRESS_LABEL].address = "0x" + toHex(sellerAddress.to_address().to_bytes());
  }
  if (bidderAddress) {
    metadata[BIDDER_ADDRESS_LABEL].address = "0x" + toHex(bidderAddress.to_address().to_bytes());
  }
  return output;
}

// Split amount according to marketplace fees
const splitAmount = (lovelaceAmount, address, outputs) => {
  const marketplaceFeeAmount = lovelacePercentage(lovelaceAmount, fee);
  outputs.add(createOutput(MARKETPLACE_ADDRESS(), CardanoWasm.Value.new(marketplaceFeeAmount)));
  outputs.add(createOutput(address, CardanoWasm.Value.new(lovelaceAmount.checked_sub(marketplaceFeeAmount))));
}

const lovelacePercentage = (amount, p) => {
  // Check mul multiplies the value by 10, we then want to divide by 1000 to get 1%
  const scaledFee = (parseInt(p) * 100).toString();
  return amount.checked_mul(CardanoWasm.BigNum.from_str("10")).checked_div(CardanoWasm.BigNum.from_str(scaledFee));
};

const setCollateral = (txBuilder, utxos) => {
  const inputs = CardanoWasm.TransactionInputs.new();
  utxos.forEach((utxo) => {
    inputs.add(utxo.input());
  });
  txBuilder.set_collateral(inputs);
}

const finalizeTransaction = async ({
  txBuilder,
  changeAddress,
  utxos,
  outputs,
  datums,
  metadata,
  scriptUtxo,
  action,
  timeToLive = 2 * 60 * 60,
}) => {
  // Build the transaction witness set
  const transactionWitnessSet = CardanoWasm.TransactionWitnessSet.new();

  // Build the transaction inputs using the random improve algorithm
  // Algorithm details: https://input-output-hk.github.io/cardano-coin-selection/haddock/cardano-coin-selection-1.0.1/Cardano-CoinSelection-Algorithm-RandomImprove.html
  //@ts-ignore
  let { input, change } = CoinSelection.randomImprove(utxos, outputs, 8, scriptUtxo ? [scriptUtxo] : []);
  input.forEach((utxo) => {
    txBuilder.add_input(utxo.output().address(), utxo.input(), utxo.output().amount());
  });

  // Build the transaction outputs
  for (let i = 0; i < outputs.len(); i++) {
    txBuilder.add_output(outputs.get(i));
  }

  // Ensure proper redeemers for transaction
  if (scriptUtxo) {
    const redeemers = CardanoWasm.Redeemers.new();
    const redeemerIndex = txBuilder.index_of_input(scriptUtxo.input()).toString();
    redeemers.add(action(redeemerIndex));
    txBuilder.set_redeemers(
      CardanoWasm.Redeemers.from_bytes(redeemers.to_bytes())
    );
    txBuilder.set_plutus_data(
      CardanoWasm.PlutusList.from_bytes(datums.to_bytes())
    );
    txBuilder.set_plutus_scripts(
      CONTRACT()
    );

    // ?
    const collateral = await WalletAPI.getCollateral();
    if (collateral.length <= 0) throw new Error("Your wallet has no collateral. Ensure your connected wallet has collateral. You can follow the guide page for instructions");
    setCollateral(txBuilder, collateral);

    transactionWitnessSet.set_plutus_scripts(CONTRACT());
    transactionWitnessSet.set_plutus_data(datums);
    transactionWitnessSet.set_redeemers(redeemers);

    // Get the current blockchain slot time
    const protocolParameters = await getLatestEpochProtocolParameters();
    const currentTime = protocolParameters.latestBlock;

    // set_validity_start_interval is the current slot on the cardano blockchain
    txBuilder.set_validity_start_interval(currentTime.slot);

    // ttl is an absolute slot number greater than the current slot. This code sets the ttl to "timeToLive" seconds after the current slot
    // Transactions will silently fail and not place a bid if this time window is not before the end of the auction
    txBuilder.set_ttl(currentTime.slot + timeToLive);
  }

  // Attach metadata to the transaction
  let aux_data;
  if (metadata) {
    aux_data = CardanoWasm.AuxiliaryData.new();
    const generalMetadata = CardanoWasm.GeneralTransactionMetadata.new();
    Object.keys(metadata).forEach((label) => {
      Object.keys(metadata[label]).length > 0 &&
        generalMetadata.insert(
          CardanoWasm.BigNum.from_str(label),
          CardanoWasm.encode_json_str_to_metadatum(
            JSON.stringify(metadata[label]),
            1
          )
        );
    });
    aux_data.set_metadata(generalMetadata);
    txBuilder.set_auxiliary_data(aux_data);
  }

  const changeMultiAssets = change.multiasset();

  // Check if change value is too big for single output
  if (changeMultiAssets && change.to_bytes().length * 2 > protocolParameters.max_val_size) {
    const partialChange = CardanoWasm.Value.new(CardanoWasm.BigNum.from_str("0"));

    const partialMultiAssets = CardanoWasm.MultiAsset.new();
    const policies = changeMultiAssets.keys();
    const makeSplit = () => {
      for (let j = 0; j < changeMultiAssets.len(); j++) {
        const policy = policies.get(j);
        const policyAssets = changeMultiAssets.get(policy);
        const assetNames = policyAssets.keys();
        const assets = CardanoWasm.Assets.new();
        for (let k = 0; k < assetNames.len(); k++) {
          const policyAsset = assetNames.get(k);
          const quantity = policyAssets.get(policyAsset);
          assets.insert(policyAsset, quantity);
          // Check size
          const checkMultiAssets = CardanoWasm.MultiAsset.from_bytes(partialMultiAssets.to_bytes());
          checkMultiAssets.insert(policy, assets);
          const checkValue = CardanoWasm.Value.new(CardanoWasm.BigNum.from_str("0"));
          checkValue.set_multiasset(checkMultiAssets);

          if (checkValue.to_bytes().length * 2 >= protocolParameters.max_val_size) {
            partialMultiAssets.insert(policy, assets);
            return;
          }
        }
        partialMultiAssets.insert(policy, assets);
      }
    };
    makeSplit();
    partialChange.set_multiasset(partialMultiAssets);
    const minAda = CardanoWasm.min_ada_required(
      partialChange,
      CardanoWasm.BigNum.from_str(protocolParameters.min_utxo)
    );
    partialChange.set_coin(minAda);

    txBuilder.add_output(
      CardanoWasm.TransactionOutput.new(
        changeAddress.to_address(),
        partialChange
      )
    );
  }

  txBuilder.add_change_if_needed(changeAddress.to_address());

  // Build the full transaction
  const txBody = txBuilder.build();
  const tx = CardanoWasm.Transaction.new(
    txBody,
    CardanoWasm.TransactionWitnessSet.from_bytes(
      transactionWitnessSet.to_bytes()
    ),
    aux_data
  );

  // Ensure the transaction size is below the max transaction size for the Cardano Blockchain
  const size = tx.to_bytes().length;
  if (size > protocolParameters.max_tx_size)
    throw new Error(`The maximum transaction size has been reached: ${protocolParameters.max_tx_size} bytes. Please contact us in our discord channel for help`);

  const { signKey: serverSignKey, walletAddress: serverBaseAddress, addressBech32: serverDecodedAddress } = core.getServerAccount();

  let txVKeyWitnesses = await WalletAPI.signTx(tx);
  txVKeyWitnesses = CardanoWasm.TransactionWitnessSet.from_bytes(
    fromHex(txVKeyWitnesses)
  );
  transactionWitnessSet.set_vkeys(txVKeyWitnesses.vkeys());

  // Sign the transaction
  const signedTx = CardanoWasm.Transaction.new(
    tx.body(),
    transactionWitnessSet,
    tx.auxiliary_data()
  );

  // Dump hex to read transactions with cardano-cli text-view decode-cbor
  // console.log(toHex(signedTx.to_bytes()));    
  console.log("Full Tx Size: ", signedTx.to_bytes().length);

  const txHash = await core.submitSignedTransaction(signedTx.to_bytes());
  return txHash;
}

const toBytesNum = (num) => num.toString().split("").map((d) => "3" + d).join("");
const fromAscii = (hex) => Buffer.from(hex).toString("hex");

const assetsToValue = (assets) => {
  const multiAsset = CardanoWasm.MultiAsset.new();
  const lovelace = assets.find((asset) => asset.unit == "lovelace")

  // Get the policy ids off all assets
  const policies = [
    ...new Set(assets.filter((asset) => asset.unit !== "lovelace").map((asset) => asset.unit.slice(0, 56))),
  ];

  // Loop through all policies and get their quantity
  policies.forEach((policy) => {
    const policyAssets = assets.filter((asset) => asset.unit.slice(0, 56) === policy);
    const assetsValue = CardanoWasm.Assets.new();
    policyAssets.forEach((asset) => {
      assetsValue.insert(
        CardanoWasm.AssetName.new(Buffer.from(asset.unit.slice(56), "hex")),
        CardanoWasm.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      CardanoWasm.ScriptHash.from_bytes(Buffer.from(policy, "hex")),
      assetsValue
    )
  });
  const value = CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(lovelace ? lovelace.quantity : "0"));
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);
  return value;
}

const START_DATUM = (startAuctionDetails) => {
  // The code below creates this json format    
  /*
  {
      "constructor": 0,
      "fields": [
          {
          "constructor": 0, // AuctionDetails
          "fields": [
              {
                  "bytes": "67614c1b06ddbb100cb6cbe919594cac31771c25530b6c7f28da242b" // adSeller
              },
              {
                  "bytes": "d6cfdbedd242056674c0e51ead01785497e3a48afbbb146dc72ee1e2" // adCurrency
              },
              {
                  "bytes": "123456" // adToken
              },
              {
                  "int": 1639241530000 // adDealine
              },
              {
                  "int": 1639241130000 // adStartTime
              },
              {
                  "int": 8000000 // adMinBid
              },
              {
                  "int": 10 // adMarketplacePercent (this is 1%)
              },
              {
                  "bytes": "67614c1b06ddbb100cb6cbe919594cac31771c25530b6c7f28da242b" // adMarketplaceAddress
              },
          ]
          },
          {
              "constructor": 1,
              "fields": [
              ]
          }
      ]
  }
  */

  const { adSeller, adCurrency, adToken, adDeadline, adStartTime, adMinBid, adMarketplacePercent, adMarketplaceAddress } = startAuctionDetails;

  // Construct Cardano Json
  const auctionDetailsFields = CardanoWasm.PlutusList.new();
  auctionDetailsFields.add(CardanoWasm.PlutusData.new_bytes(fromHex(adSeller)))
  auctionDetailsFields.add(CardanoWasm.PlutusData.new_bytes(fromHex(adCurrency)))
  auctionDetailsFields.add(CardanoWasm.PlutusData.new_bytes(fromHex(adToken)))
  auctionDetailsFields.add(CardanoWasm.PlutusData.new_integer(CardanoWasm.BigInt.from_str(adDeadline)))
  auctionDetailsFields.add(CardanoWasm.PlutusData.new_integer(CardanoWasm.BigInt.from_str(adStartTime)))
  auctionDetailsFields.add(CardanoWasm.PlutusData.new_integer(CardanoWasm.BigInt.from_str(adMinBid)))
  auctionDetailsFields.add(CardanoWasm.PlutusData.new_integer(CardanoWasm.BigInt.from_str(adMarketplacePercent)))
  auctionDetailsFields.add(CardanoWasm.PlutusData.new_bytes(fromHex(adMarketplaceAddress)))

  const auctionDetails = CardanoWasm.PlutusData.new_constr_plutus_data(
    CardanoWasm.ConstrPlutusData.new(
      CardanoWasm.Int.new_i32(0),
      auctionDetailsFields,
    )
  )

  const bidDetailsFields = CardanoWasm.PlutusList.new();
  const bidDetails = CardanoWasm.PlutusData.new_constr_plutus_data(
    CardanoWasm.ConstrPlutusData.new(
      CardanoWasm.Int.new_i32(1),
      bidDetailsFields,
    )
  )

  const datumFields = CardanoWasm.PlutusList.new();
  datumFields.add(auctionDetails);
  datumFields.add(bidDetails);

  const datum = CardanoWasm.PlutusData.new_constr_plutus_data(
    CardanoWasm.ConstrPlutusData.new(
      CardanoWasm.Int.new_i32(0),
      datumFields,
    )
  )

  return datum;
}

const start = async (auctionDetails) => {
  // Build the auction datum and initialize transaction data
  const datum = START_DATUM(auctionDetails);
  const { txBuilder, datums, metadata, outputs } = await initializeTransaction();

  // Get the connected wallet address and utxos to ensure they have enough ADA and the proper NFT to auction
  const { walletAddress: serverBaseAddress, addressBech32: serverDecodedAddress } = core.getServerAccount();
  const utxos = await getAddressUtxos(addressBech32);

  // The contract receives a blob NFT as an output
  outputs.add(
    createOutput(
      CONTRACT_ADDRESS(),
      assetsToValue([
        {
          unit: auctionDetails.adCurrency + auctionDetails.adToken,
          quantity: "1",
        }
      ]),
      {
        index: 0,
        datum: datum,
        metadata: metadata,
        sellerAddress: walletAddress,
      }
    )
  )

  datums.add(datum);

  // Set the required transaction signers
  const requiredSigners = CardanoWasm.Ed25519KeyHashes.new();
  requiredSigners.add(walletAddress.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  // Finish building and submitting the transaction!
  const txHash = await finalizeTransaction({
    txBuilder,
    changeAddress: walletAddress,
    utxos,
    outputs,
    datums,
    metadata,
    scriptUtxo: null,
    action: null,
  });
  return txHash;
}

const getBaseAddressFromAddressString = async (addressBech32) => {
  const addressObject = CardanoWasm.Address.from_bech32(addressBech32);
  const baseAddress = CardanoWasm.BaseAddress.from_address(addressObject);
  return baseAddress;
}

const submitStartTransaction = async () => {
  try {
    const fifteenMinutes = 1000 * 60 * 15;
    const startDateTime = new Date();
    const newEndDateTime = new Date(startDateTime.getTime() + fifteenMinutes);
    // Increment the given end time by 15 minutes to allow for 15 minute time to live when transactions are submitted (ttl)
    const { walletAddress: serverBaseAddress } = core.getServerAccount();
    const marketplaceAddress = await getBaseAddressFromAddressString(process.env.MARKETPLACE_ADDRESS)
    const adCurrency = ''; // Policy Id
    const adToken = ''; // Asset Name
    const adSeller = toHex(walletAddress.payment_cred().to_keyhash().to_bytes())
    const adDeadline = newEndDateTime.getTime().toString();
    const adStartTime = startDateTime.getTime().toString();
    const adMinBid = (10 * 1000000).toString();
    const adMarketplacePercent = 10; // Corresponds to 1%
    const adMarketplaceAddress = toHex(marketplaceAddress.payment_cred().to_keyhash().to_bytes())
    const auctionDetails = { adSeller, adCurrency, adToken, adDeadline, adStartTime, adMinBid, adMarketplacePercent, adMarketplaceAddress }
    const txHash = await start(auctionDetails);
    console.log(txHash);
  }
  catch (error) {
    console.log(error);
  }
}

submitStartTransaction();