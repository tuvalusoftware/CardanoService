/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const fs = require('fs').promises;
const config = require('../config/walletConfig');
const CardanoCli = require('cardanocli-js');

const WALLET_NAME = config.NAME;

// cardano.wallet is the 1st wallet of ShelleyWallet
const cardano = new CardanoCli({
    network: config.network,
    shelleyGenesisPath: config.shelleyGenesisPath,
    dir: config.cardanoCliDir,
    era: config.era,
});

const createTransaction = (tx) => {
    // Create raw transaction
    let raw = cardano.transactionBuildRaw(tx);

    // Calculate fee
    let fee = cardano.transactionCalculateMinFee({
        ...tx,
        txBody: raw,
    });

    // Pay the fee by subtracting it from the sender utxo
    tx.txOut[0].value.lovelace -= fee;
    if (tx.txOut[0].value.lovelace < 0) {
        return -1;
    }

    // Create final transaction
    return cardano.transactionBuildRaw({ ...tx, fee });
};

const signTransaction = (wallet, tx) => {
    // Sign tx
    return cardano.transactionSign({
        signingKeys: [wallet.payment.skey, wallet.payment.skey],
        txBody: tx,
    });
};

const path = require('path');

const signTransactionFromBuffer = async (wallet, buff) => {
    const original = Buffer.from(buff);
    await fs.writeFile(path.join(config.cardanoCliDir, 'tmp', 'z.raw'), original.toString());
    return signTransaction(wallet, path.join(config.cardanoCliDir, 'tmp', 'z.raw'));
};

const addNativeToken = async (asset_name) => {
    // Get wallet
    const wallet = cardano.wallet(WALLET_NAME);

    // Define mint script
    const mintScript = {
        keyHash: cardano.addressKeyHash(wallet.name),
        type: 'sig',
    };

    // Create POLICY_Id
    const POLICY_Id = cardano.transactionPolicyid(mintScript);

    // Define ASSET_NAME
    const ASSET_NAME = Buffer.from(asset_name).toString('hex');

    // Create ASSET_ID
    const ASSET_ID = POLICY_Id + '.' + ASSET_NAME;

    // Query an utxo
    const utxo = wallet.balance().utxo;
    utxo.forEach((tx) => {
        delete tx.value.undefined;
    });

    // Define transaction
    let tx = {
        txIn: utxo,
        txOut: [
            {
                address: wallet.paymentAddr,
                value: {
                    ...wallet.balance().value,
                    [ASSET_ID]: (wallet.balance().value[ASSET_ID] || 0) + 100000,
                    undefined: undefined,
                },
            },
        ],
        mint: [{ action: 'mint', quantity: 100000, asset: ASSET_ID, script: mintScript }],
        witnessCount: 2,
    };
    tx = JSON.parse(JSON.stringify(tx));

    // Build transaction
    const raw = createTransaction(tx);
    if (raw == -1) throw new Error('The rest of lovelaces less than the number of lovelaces to send to user wallet.');

    // Sign transaction
    const signed = signTransaction(wallet, raw, mintScript);

    // Submit transaction
    const txId = cardano.transactionSubmit(signed);
    return txId;
};

// console.log(addNativeToken('FuixlabsNT'));
// 353e52d1b8f478eb9ba3a30826b9097767f712ebc6ca4ad2df0a2a2ede730c5d

const buff = {
    type: 'Buffer',
    data: [
        123, 10, 32, 32, 32, 32, 34, 116, 121, 112, 101, 34, 58, 32, 34, 84, 120, 66, 111, 100, 121, 65, 108, 111, 110,
        122, 111, 34, 44, 10, 32, 32, 32, 32, 34, 100, 101, 115, 99, 114, 105, 112, 116, 105, 111, 110, 34, 58, 32, 34,
        34, 44, 10, 32, 32, 32, 32, 34, 99, 98, 111, 114, 72, 101, 120, 34, 58, 32, 34, 56, 54, 97, 56, 48, 48, 56, 49,
        56, 50, 53, 56, 50, 48, 56, 102, 51, 98, 98, 57, 49, 51, 97, 50, 49, 57, 101, 102, 50, 100, 99, 52, 53, 97, 49,
        48, 102, 52, 50, 54, 53, 53, 101, 56, 55, 99, 101, 97, 101, 49, 52, 51, 54, 100, 52, 57, 48, 102, 57, 102, 57,
        49, 54, 57, 97, 102, 102, 52, 97, 53, 57, 51, 101, 49, 100, 54, 52, 102, 48, 48, 48, 100, 56, 48, 48, 49, 56,
        49, 56, 50, 53, 56, 51, 57, 48, 48, 52, 102, 102, 51, 48, 55, 52, 49, 102, 102, 54, 56, 52, 54, 52, 101, 55, 49,
        49, 98, 56, 97, 99, 98, 54, 101, 99, 56, 56, 53, 102, 102, 56, 54, 57, 50, 54, 102, 53, 54, 99, 100, 48, 98, 49,
        98, 56, 56, 99, 49, 50, 48, 99, 99, 99, 52, 100, 100, 56, 50, 49, 52, 97, 98, 56, 55, 55, 51, 48, 54, 52, 52,
        50, 101, 48, 54, 48, 52, 100, 101, 50, 101, 53, 49, 54, 100, 56, 97, 100, 53, 51, 52, 54, 53, 97, 48, 50, 49,
        50, 99, 99, 49, 48, 99, 48, 99, 98, 56, 97, 51, 48, 99, 56, 50, 49, 97, 98, 50, 52, 54, 99, 100, 57, 48, 97, 49,
        53, 56, 49, 99, 57, 50, 52, 48, 97, 102, 49, 102, 56, 100, 53, 56, 55, 57, 53, 54, 57, 56, 98, 54, 54, 55, 101,
        56, 102, 48, 57, 101, 57, 54, 101, 56, 53, 53, 48, 56, 99, 100, 55, 51, 51, 57, 102, 56, 102, 98, 100, 102, 98,
        54, 50, 53, 53, 53, 97, 56, 97, 49, 52, 97, 52, 54, 55, 53, 54, 57, 55, 56, 54, 99, 54, 49, 54, 50, 55, 51, 52,
        101, 53, 52, 49, 97, 48, 48, 48, 49, 56, 54, 57, 97, 48, 50, 49, 97, 48, 48, 48, 50, 99, 97, 54, 49, 48, 51, 49,
        97, 48, 51, 52, 100, 50, 102, 102, 54, 48, 56, 48, 48, 48, 101, 56, 48, 48, 55, 53, 56, 50, 48, 100, 97, 98, 99,
        49, 57, 50, 56, 56, 97, 98, 51, 102, 50, 97, 97, 52, 100, 57, 97, 99, 52, 56, 98, 99, 53, 57, 50, 56, 57, 53,
        52, 101, 53, 56, 55, 97, 51, 98, 98, 102, 102, 52, 48, 97, 54, 57, 101, 99, 98, 98, 101, 54, 101, 57, 52, 53,
        98, 100, 101, 51, 57, 98, 55, 57, 102, 102, 102, 56, 48, 56, 48, 102, 53, 100, 57, 48, 49, 48, 51, 97, 49, 48,
        48, 97, 49, 48, 48, 97, 50, 54, 56, 54, 99, 54, 102, 54, 51, 54, 49, 55, 52, 54, 57, 54, 102, 54, 101, 54, 54,
        52, 51, 54, 49, 54, 101, 55, 52, 54, 56, 54, 102, 54, 52, 54, 101, 54, 49, 54, 100, 54, 53, 54, 56, 52, 54, 55,
        53, 54, 57, 55, 56, 54, 99, 54, 49, 54, 50, 55, 51, 34, 10, 125, 10,
    ],
};

/*
const wallet = cardano.wallet(WALLET_NAME);
signTransactionFromBuffer(wallet, buff).then((tx) => {
    console.log(tx);
});
*/
