/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const fs = require('fs').promises;
const config = require('../config/walletConfig');
const { WalletServer } = require('cardano-wallet-js');
const CardanoCli = require('cardanocli-js');

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readFileFromPath(path) {
    const data = await fs.readFile(path, 'binary');
    return Buffer.from(data);
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

const createTransaction = (tx, onlyAda = false) => {
    // Create raw transaction
    let raw = cardano.transactionBuildRaw(tx);

    // Calculate fee
    let fee = 0;
    if (!onlyAda) {
        fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw,
        });
    } else {
        fee = cardano.transactionCalculateMinFee({
            ...tx,
            txBody: raw,
            witnessCount: 1,
        });
    }

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

// ** Utxo **

const getUtxo = async (address) => {
    const utxo = await cardano.queryUtxo(address);
    return utxo;
};

const getBalance = (address) => {
    const utxos = cardano.queryUtxo(address);
    const value = {};
    utxos.forEach((utxo) => {
        Object.keys(utxo.value).forEach((asset) => {
            if (!value[asset]) value[asset] = 0;
            value[asset] += utxo.value[asset];
        });
    });

    return { utxo: utxos, value };
};

// ** End utxo **

const waitForSyncOnChain = async (wallet, ASSET_ID, currentTokenAmount) => {
    let newTokenAmount;
    do {
        await sleep(2000);
        newTokenAmount = wallet.balance().value[ASSET_ID] || 0;
    } while (newTokenAmount == currentTokenAmount);
    return;
};

const waitForSyncOnChainWithAddress = async (address, currentLovelace, currentTokenAmount = -1, ASSET_ID = '') => {
    if (currentTokenAmount == -1) {
        let newLovelace;
        do {
            await sleep(2000);
            newLovelace = getBalance(address).value.lovelace || 0;
        } while (newLovelace == currentLovelace);
    } else {
        let newTokenAmount;
        do {
            await sleep(2000);
            newTokenAmount = getBalance(address).value[ASSET_ID] || 0;
        } while (newTokenAmount == currentTokenAmount);
    }
    return;
};

const getTransferAdaRawTransaction = async (address, receivers, amounts) => {
    if (receivers.length != amounts.length) {
        throw new Error('receivers and amounts are not match');
    }

    // Define variables
    const totalTransfer = receivers.length;
    const NUMBER_OF_TRANSFER_PER_GROUP = 100;
    const numberOfGroupTransfer = Math.ceil(totalTransfer / NUMBER_OF_TRANSFER_PER_GROUP);

    let rawTxs = [];

    for (let groupId = 0; groupId < numberOfGroupTransfer; ++i) {
        // Get wallet
        const wallet = getBalance(address);

        const numberOfTransfer = Math.min(
            totalTransfer - groupId * NUMBER_OF_TRANSFER_PER_GROUP,
            NUMBER_OF_TRANSFER_PER_GROUP
        );

        // Wait for sync
        if (groupId != 0) {
            let currentLovelace = wallet.value.lovelace || 0;
            await waitForSyncOnChainWithAddress(address, currentLovelace);
        }

        // Query an utxo
        wallet = getBalance(wallet);
        let utxo = wallet.utxo;
        utxo.forEach((tx) => {
            delete tx.value.undefined;
        });

        // Define tx
        let tx = {
            txIn: utxo,
            txOut: [
                {
                    address: address,
                    value: {
                        ...wallet.value,
                        undefined: undefined,
                    },
                },
            ],
        };

        let numberOfLovelaces = 0;

        for (let i = 0; i < numberOfTransfer; ++i) {
            const amount = amounts[groupId * NUMBER_OF_TRANSFER_PER_GROUP + id];
            amount = cardano.toLovelace(amount);
            numberOfLovelaces += amount;
            txInfo.txOut[id + 1] = {
                address: receivers[groupId * NUMBER_OF_TRANSFER_PER_GROUP + id],
                value: {
                    lovelace: amount,
                },
            };
        }

        tx.txOut[0].value.lovelace -= numberOfLovelaces;

        tx = JSON.parse(JSON.stringify(tx));

        // Build transaction
        const raw = createTransaction(tx, true);
        if (raw == -1) {
            throw new Error('The rest of lovelaces less than the number of lovelaces to send to user wallet.');
        }

        // Read raw tx
        const rawBody = await readFileFromPath(raw);
        rawTxs.push(rawBody);
    }

    return rawTxs;
};

const submitSignedTransaction = async (address, signedTransaction) => {
    // Submit transaction
    const txId = cardano.transactionSubmit(signedTransaction);
    return txId;
};

// ** Metadata **

const getCreateMetadataRawTransaction = async (address, rawMetadata) => {
    // Get wallet
    const wallet = getBalance(address);

    // Define metadata
    const metadata = {
        0: rawMetadata,
    };

    // Query utxo
    const utxo = wallet.utxo;
    utxo.forEach((tx) => {
        delete tx.value.undefined;
    });

    // Define transaction
    let tx = {
        txIn: utxo,
        txOut: [
            {
                address: address,
                value: {
                    ...wallet.value,
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

    // Read raw tx
    const rawBody = await readFileFromPath(raw);
    return rawBody;
};

const addMetadata = async (rawMetadata) => {
    // Get wallet
    const wallet = cardano.wallet(WALLET_NAME);

    // Define metadata
    const metadata = {
        0: rawMetadata,
    };

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
    // Get wallet
    const wallet = cardano.wallet(WALLET_NAME);

    // Define mint script
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
    // Get wallet
    const wallet = cardano.wallet(WALLET_NAME);

    // Create ASSET_NAME
    const ASSET_NAME = Buffer.from(asset_name).toString('hex');

    // Create ASSET_ID
    const ASSET_ID = policyId + '.' + ASSET_NAME;

    // Query utxo
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
    // Get wallet
    const wallet = cardano.wallet(WALLET_NAME);

    // Create ASSET_NAME
    const ASSET_NAME = Buffer.from(asset_name).toString('hex');

    // Create ASSET_ID
    const ASSET_ID = policyId + '.' + ASSET_NAME;

    // Define variables
    const totalTransfer = receivers.length;
    const NUMBER_OF_TRANSFER_PER_GROUP = 100;
    const numberOfGroupTransfer = Math.ceil(totalTransfer / NUMBER_OF_TRANSFER_PER_GROUP);

    let txHashes = [];

    for (let groupId = 0; groupId < numberOfGroupTransfer; ++i) {
        const numberOfTransfer = Math.min(
            totalTransfer - groupId * NUMBER_OF_TRANSFER_PER_GROUP,
            NUMBER_OF_TRANSFER_PER_GROUP
        );

        // Wait for sync
        if (groupId != 0) {
            let currentTokenAmount = wallet.balance().value[ASSET_ID] || 0;
            await waitForSyncOnChain(wallet, ASSET_ID, currentTokenAmount);
        }

        // Query utxo
        let utxo = wallet.balance().utxo;
        utxo.forEach((tx) => {
            delete tx.value.undefined;
        });

        // Define tx
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
        if (raw == -1) {
            throw new Error('The rest of lovelaces less than the number of lovelaces to send to user wallet.');
        }

        // Sign transaction
        const signed = signTransaction(wallet, raw);

        // Submit transaction
        const txId = cardano.transactionSubmit(signed);
        txHashes.push(txId);
    }

    return txHashes;
};

const getTransferTokenRawTransaction = async (address, policy_id, asset_name, receivers, quantities) => {
    if (receivers.length != quantities.length) {
        throw new Error('receivers and quantities are not match');
    }

    // Create ASSET_NAME
    const ASSET_NAME = Buffer.from(asset_name).toString('hex');

    // Create ASSET_ID
    const ASSET_ID = policy_id + '.' + ASSET_NAME;

    // Define variables
    const totalTransfer = receivers.length;
    const NUMBER_OF_TRANSFER_PER_GROUP = 100;
    const numberOfGroupTransfer = Math.ceil(totalTransfer / NUMBER_OF_TRANSFER_PER_GROUP);

    let rawTxs = [];

    for (let groupId = 0; groupId < numberOfGroupTransfer; ++i) {
        // Get wallet
        const wallet = getBalance(address);

        const numberOfTransfer = Math.min(
            totalTransfer - groupId * NUMBER_OF_TRANSFER_PER_GROUP,
            NUMBER_OF_TRANSFER_PER_GROUP
        );

        // Wait for sync
        if (groupId != 0) {
            let currentTokenAmount = wallet.value[ASSET_ID] || 0;
            await waitForSyncOnChainWithAddress(address, -1, currentTokenAmount, ASSET_ID);
        }

        // Query an utxo
        wallet = getBalance(address);
        let utxo = wallet.utxo;
        utxo.forEach((tx) => {
            delete tx.value.undefined;
        });

        // Define tx
        let tx = {
            txIn: utxo,
            txOut: [
                {
                    address: address,
                    value: {
                        ...wallet.value,
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
        if (raw == -1) {
            throw new Error('The rest of lovelaces less than the number of lovelaces to send to user wallet.');
        }

        // Read raw tx
        const rawBody = await readFileFromPath(raw);
        rawTxs.push(rawBody);
    }

    return rawTxs;
};

module.exports = {
    getUtxo,
    submitSignedTransaction,
    getTransferAdaRawTransaction,
    getCreateMetadataRawTransaction,
    addMetadata,
    fetchMetadata,
    addNFT,
    fetchNFTById,
    transferNFTById,
    getTransferTokenRawTransaction,
    airdropById,
};
