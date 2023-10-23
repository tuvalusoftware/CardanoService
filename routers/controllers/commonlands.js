import * as L from "../../core/lucid";

export async function MintNftForEachHash(req, res, next) {
    try {
        const { data, config: Config } = req.body;

        /*
        {
            data: [
                [
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                ],
                [
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                ],
            ],
            config: {},
        }
        */

        const { paymentCredential } = L.lucid.utils.getAddressDetails(
            await L.lucid.wallet.address(),
        );

        const utxos = await L.lucid.wallet.getUtxos();

        let tx = L.lucid.newTx();
        // tx = tx.collectFrom(utxos);

        let mintToken = [];
        let policies = [];
        const metadata = {};
        const config = {};

        for (let i = 0; i < data.length; ++i) {
            const hashes = data[i];

            const timeToLive = L.lucid.utils.unixTimeToSlot(new Date()) + 3153600000 + Math.floor(Math.random() * 100000);

            let policy = L.lucid.utils.nativeScriptFromJson({
                type: "all",
                scripts: [
                    { type: "sig", keyHash: paymentCredential.hash },
                    {
                        type: "before",
                        slot: timeToLive,
                    },
                ],
            });

            policy.ttl = timeToLive;
            policy.id = L.lucid.utils.mintingPolicyToId(policy);

            policies.push(policy);

            for (let j = 0; j < hashes.length; ++j) {
                const assetName = hashes[j];

                let Policy = JSON.parse(JSON.stringify(policy));

                if (Config[assetName]) {
                    Policy = Config[assetName];
                    policies.push(Policy);
                }

                config[assetName] = Policy;

                const asset = `${Policy.id}${assetName}`;

                mintToken.push({
                    [asset]: (Policy?.burn === true) ? -1n : 1n,
                });

                metadata[Policy.id] = metadata[Policy.id] || {};
                metadata[Policy.id][assetName] = {
                    type: "document",
                    timestamp: new Date().toISOString(),
                };
            }
        }

        tx = tx.attachMetadataWithConversion(721, {
            ...metadata,
            version: 2,
        });

        const address = await L.lucid.wallet.address();

        for (let i = 0; i < policies.length; ++i) {
            tx = tx.attachMintingPolicy(policies[i]);
        }

        for (let i = 0; i < mintToken.length; ++i) {
            tx = tx.mintAssets(mintToken[i]);
            tx = tx.payToAddress(address, mintToken[i]);
        }

        const timeToLive = L.lucid.utils.unixTimeToSlot(new Date()) + 3153600000;

        tx = tx.validTo(L.lucid.utils.slotToUnixTime(timeToLive));

        tx = await tx.complete({
            coinSelection: true,
            nativeUplc: false,
        });

        const signedTx = await tx.sign().complete();

        let txHash = await signedTx.submit();
        txHash = txHash.replace(/['"]+/g, '');

        return res.json({
            status: 0,
            statusText: "OK",
            statusCode: 200,
            data: {
                txHash,
                config,
            },
        });
    } catch (error) {
        console.error(error);

        return res.json({
            status: 1,
            statusText: "FAILED",
            statusCode: 400,
        });
    }
}

export async function MintNftForEachCredential(req, res, next) {
    try {
        const { data, config: Config } = req.body;

        /*
        {
            data: [
                [
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                ],
                [
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                    "11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987",
                ],
            ],
            config: {},
        }
        */

        const { paymentCredential } = L.lucid.utils.getAddressDetails(
            await L.lucid.wallet.address(),
        );

        let tx = L.lucid.newTx();

        let mintToken = [];
        let policies = [];
        const metadata = {};
        const config = {};

        for (let i = 0; i < data.length; ++i) {
            const hashes = data[i];

            const timeToLive = L.lucid.utils.unixTimeToSlot(new Date()) + 3153600000 + Math.floor(Math.random() * 100000);

            let policy = L.lucid.utils.nativeScriptFromJson({
                type: "all",
                scripts: [
                    { type: "sig", keyHash: paymentCredential.hash },
                    {
                        type: "before",
                        slot: timeToLive,
                    },
                ],
            });

            policy.ttl = timeToLive;
            policy.id = L.lucid.utils.mintingPolicyToId(policy);

            policies.push(policy);

            for (let j = 0; j < hashes.length; ++j) {
                const assetName = hashes[j];

                let Policy = JSON.parse(JSON.stringify(policy));

                if (Config[assetName]) {
                    Policy = Config[assetName];
                    policies.push(Policy);
                }

                config[assetName] = Policy;

                const asset = `${Policy.id}${assetName}`;

                mintToken.push({
                    [asset]: (Policy?.burn === true) ? -1n : 1n,
                });

                metadata[Policy.id] = metadata[Policy.id] || {};
                metadata[Policy.id][assetName] = {
                    type: "credential",
                    timestamp: new Date().toISOString(),
                };
            }
        }

        tx = tx.attachMetadataWithConversion(721, {
            ...metadata,
            version: 2,
        });

        const address = await L.lucid.wallet.address();

        for (let i = 0; i < policies.length; ++i) {
            tx = tx.attachMintingPolicy(policies[i]);
        }

        for (let i = 0; i < mintToken.length; ++i) {
            tx = tx.mintAssets(mintToken[i]);
            tx = tx.payToAddress(address, mintToken[i]);
        }

        const timeToLive = L.lucid.utils.unixTimeToSlot(new Date()) + 3153600000;

        tx = tx.validTo(L.lucid.utils.slotToUnixTime(timeToLive));

        tx = await tx.complete({
            coinSelection: true,
            nativeUplc: false,
        });

        const signedTx = await tx.sign().complete();

        let txHash = await signedTx.submit();
        txHash = txHash.replace(/['"]+/g, '');

        return res.json({
            status: 0,
            statusText: "OK",
            statusCode: 200,
            data: {
                txHash,
                config,
            },
        });
    } catch (error) {
        console.error(error);

        return res.json({
            status: 1,
            statusText: "FAILED",
            statusCode: 400,
        });
    }
}