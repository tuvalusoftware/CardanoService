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
        132, 163, 0, 129, 130, 88, 32, 177, 19, 163, 80, 206, 121, 122, 65, 224, 55, 237, 38, 62, 221, 150, 34, 141,
        131, 239, 207, 143, 27, 201, 22, 32, 144, 215, 223, 158, 199, 56, 57, 0, 1, 130, 130, 88, 57, 0, 33, 33, 184,
        12, 215, 9, 207, 33, 110, 88, 153, 121, 99, 61, 228, 143, 211, 108, 119, 132, 0, 152, 225, 134, 236, 209, 214,
        128, 75, 162, 106, 105, 94, 34, 237, 37, 196, 80, 110, 47, 9, 102, 42, 223, 197, 49, 173, 112, 93, 191, 53, 70,
        118, 76, 76, 49, 26, 0, 152, 150, 128, 130, 88, 57, 0, 64, 24, 227, 101, 62, 25, 158, 58, 118, 174, 78, 229,
        208, 217, 111, 140, 14, 231, 210, 73, 85, 221, 92, 84, 16, 146, 200, 231, 249, 44, 21, 45, 80, 239, 71, 217, 86,
        142, 180, 200, 133, 120, 79, 227, 110, 193, 116, 5, 154, 47, 214, 76, 181, 177, 79, 63, 26, 58, 255, 163, 11, 2,
        26, 0, 2, 144, 117, 160, 245, 246,
    ],
};

/*
const wallet = cardano.wallet(WALLET_NAME);
signTransactionFromBuffer(wallet, buff).then((tx) => {
    console.log(tx);
});
*/
