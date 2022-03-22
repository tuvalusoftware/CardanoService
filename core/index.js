/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const config = require('../config/walletConfig');
const { WalletServer } = require('cardano-wallet-js');
const CardanoCli = require('cardanocli-js');

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const walletServer = WalletServer.init(config.serverURI);

const walletId = config.walletId;
const WALLET_NAME = config.NAME;
const FEE_FOR_ASSET = config.FEE_FOR_ASSET;

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
    return cardano.transactionSign({
        signingKeys: [wallet.payment.skey, wallet.payment.skey],
        txBody: tx,
    });
};

const metadataFormCardanoFormatToJSON = (metadata) => {
    if (metadata?.string) {
        return metadata.string;
    }

    if (metadata?.int) {
        return metadata.int;
    }

    if (metadata?.bytes) {
        return metadata.bytes;
    }

    if (metadata?.list) {
        return metadata.list.map((data) => {
            return metadataFormCardanoFormatToJSON(data);
        });
    }

    if (metadata?.map) {
        let result = {};
        metadata.map.forEach((data) => {
            const k = metadataFormCardanoFormatToJSON(data.k);
            const v = metadataFormCardanoFormatToJSON(data.v);

            result[k] = v;
        });

        return result;
    }

    if (metadata && Object.keys(metadata).length) {
        let result = {};
        Object.keys(metadata).forEach((prop) => {
            result[prop] = metadataFormCardanoFormatToJSON(metadata[prop]);
        });
        return result;
    }

    return metadata;
};

const waitForSyncOnChain = async (wallet, ASSET_ID, currentTokenAmount) => {
    let newTokenAmount;
    do {
        await sleep(2000);
        newTokenAmount = wallet.balance().value[ASSET_ID] || 0;
    } while (newTokenAmount == currentTokenAmount);

    return;
};

// ** Metadata **

const addMetadata = async (rawMetadata) => {
    const wallet = cardano.wallet(WALLET_NAME);

    const metadata = {
        0: rawMetadata,
    };
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

                    undefined: undefined,
                },
            },
        ],
        metadata,
        witnessCount: 2,
    };
    tx = JSON.parse(JSON.stringify(tx));
    // Build transaction
    const raw = createTransaction(tx);
    if (raw == -1) throw new Error('The rest of lovelaces less than the number of lovelaces to send to user wallet.');
    // Sign transaction
    const signed = signTransaction(wallet, raw);
    // Submit transaction
    const txId = cardano.transactionSubmit(signed);
    return txId;
};

// Can only fetch metadata which create by wallet
const fetchMetadata = async () => {
    let wallet = await walletServer.getShelleyWallet(walletId);
    let transactions = await wallet.getTransactions();
    return transactions
        .filter((transaction) => {
            return transaction?.metadata;
        })
        .map((transaction) => {
            return {
                tx_hash: transaction.id,
                metadata: metadataFormCardanoFormatToJSON(transaction.metadata),
            };
        });
};

// ** NFT **

const addNFT = async (asset_name, rawMetadata) => {
    const wallet = cardano.wallet(WALLET_NAME);
    const mintScript = {
        type: 'all',
        scripts: [
            {
                type: 'before',
                slot: cardano.queryTip().slot + 10000,
            },
            {
                type: 'sig',
                keyHash: cardano.addressKeyHash(wallet.name),
            },
        ],
    };
    // Create POLICY_Id
    const POLICY_Id = cardano.transactionPolicyid(mintScript);
    // Define ASSET_NAME
    const ASSET_NAME = Buffer.from(asset_name).toString('hex');
    // Create ASSET_ID
    const ASSET_ID = POLICY_Id + '.' + ASSET_NAME;
    // An NFT Metadata
    const metadata = {
        721: {
            [POLICY_Id]: {
                [asset_name]: rawMetadata,
            },
        },
    };
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
                    [ASSET_ID]: (wallet.balance().value[ASSET_ID] || 0) + 1,
                    undefined: undefined,
                },
            },
        ],
        mint: [{ action: 'mint', quantity: 1, asset: ASSET_ID, script: mintScript }],
        metadata,
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

// Can only fetch metadata of NFT which mint by wallet
const fetchNFTById = async (policyId, asset_name) => {
    let wallet = await walletServer.getShelleyWallet(walletId);
    let transactions = await wallet.getTransactions();

    /**
     *    metadata = {
     *      721: {
     *        [policyId]: {
     *          [asset_name]: Metadata,
     *        },
     *      },
     *    };
     */

    let result = transactions
        .filter((transaction) => {
            return (
                transaction?.metadata?.['721']?.map?.[0]?.k?.string === policyId &&
                transaction?.metadata?.['721']?.map?.[0]?.v?.map?.[0]?.k?.string === asset_name
            );
        })
        .map((transaction) => {
            return {
                tx_hash: transaction.id,
                metadata: metadataFormCardanoFormatToJSON(transaction.metadata),
            };
        });

    return result.length ? result[0] : {};
};

// Can only transfer NFT which is owned by wallet
const transferNFTById = async (policyId, asset_name, receiver) => {
    const wallet = cardano.wallet(WALLET_NAME);

    // Create ASSET_NAME
    const ASSET_NAME = Buffer.from(asset_name).toString('hex');
    // Create ASSET_ID
    const ASSET_ID = policyId + '.' + ASSET_NAME;

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
                    [ASSET_ID]: Math.max(0, (wallet.balance().value[ASSET_ID] || 0) - 1),
                    undefined: undefined,
                },
            },
            {
                address: receiver,
                value: {
                    lovelace: FEE_FOR_ASSET,
                    [ASSET_ID]: 1,
                },
            },
        ],
        witnessCount: 2,
    };
    tx.txOut[0].value.lovelace -= FEE_FOR_ASSET;
    tx = JSON.parse(JSON.stringify(tx));
    console.log(JSON.stringify(tx));
    // Build transaction
    const raw = createTransaction(tx);
    if (raw == -1) throw new Error('The rest of lovelaces less than the number of lovelaces to send to user wallet.');
    // Sign transaction
    const signed = signTransaction(wallet, raw);
    // Submit transaction
    const txId = cardano.transactionSubmit(signed);
    return txId;
};

// ** Native Tokens **

// Can only airdrop token which is owned by wallet
const airdropById = async (policyId, asset_name, receivers, quantities) => {
    if (receivers.length != quantities.length) {
        throw new Error('receivers and quantities are not match');
    }
    const wallet = cardano.wallet(WALLET_NAME);

    // Create ASSET_NAME
    const ASSET_NAME = Buffer.from(asset_name).toString('hex');
    // Create ASSET_ID
    const ASSET_ID = policyId + '.' + ASSET_NAME;

    const totalTransfer = receivers.length;
    const NUMBER_OF_TRANSFER_PER_GROUP = 100;
    const numberOfGroupTransfer = Math.ceil(totalTransfer / NUMBER_OF_TRANSFER_PER_GROUP);

    let txHashes = [];

    for (let groupId = 0; groupId < numberOfGroupTransfer; ++i) {
        const numberOfTransfer = Math.min(
            totalTransfer - groupId * NUMBER_OF_TRANSFER_PER_GROUP,
            NUMBER_OF_TRANSFER_PER_GROUP
        );

        if (groupId != 0) {
            let currentTokenAmount = sender.balance().value[ASSET_ID] || 0;
            await waitForSyncOnChain(wallet, ASSET_ID, currentTokenAmount);
        }
        let utxo = wallet.balance().utxo;
        utxo.forEach((tx) => {
            delete tx.value.undefined;
        });

        let tx = {
            txIn: utxo,
            txOut: [
                {
                    address: wallet.paymentAddr,
                    value: {
                        ...sender.balance().value,
                        undefined: undefined,
                    },
                },
            ],
            witnessCount: 2,
        };

        tx.txOut[0].value.lovelace -= FEE_FOR_ASSET * numberOfTransfer;

        let numberOfToken = 0;

        for (let i = 0; i < numberOfTransfer; ++i) {
            const quantity = quantities[groupId * NUMBER_OF_TRANSFER_PER_GROUP + id];
            numberOfToken += quantity;
            txInfo.txOut[id + 1] = {
                address: receivers[groupId * NUMBER_OF_TRANSFER_PER_GROUP + id],
                value: {
                    lovelace: FEE_FOR_ASSET,
                    [ASSET_ID]: quantity,
                },
            };
        }

        tx.txOut[0].value[ASSET_ID] -= numberOfToken;

        tx.txOut[0].value[ASSET_ID] = Math.max(0, tx.txOut[0].value[ASSET_ID]);

        tx = JSON.parse(JSON.stringify(tx));

        // Build transaction
        const raw = createTransaction(tx);
        if (raw == -1)
            throw new Error('The rest of lovelaces less than the number of lovelaces to send to user wallet.');
        // Sign transaction
        const signed = signTransaction(wallet, raw);
        // Submit transaction
        const txId = cardano.transactionSubmit(signed);
        txHashes.push(txId);
    }

    return txHashes;
};

module.exports = {
    addMetadata,
    fetchMetadata,
    addNFT,
    fetchNFTById,
    transferNFTById,
    airdropById,
};
