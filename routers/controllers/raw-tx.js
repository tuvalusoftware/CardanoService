/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
    getMetadataRawTx: async (req, res, next) => {
        const { address } = req.params;
        const { metadata } = req.body;
        if (!metadata || !address) {
            return res.sendStatus(200);
        }
        let raw_tx;
        try {
            raw_tx = await core.getCreateMetadataRawTransaction(address, metadata);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { raw_tx } });
    },
    getAdaRawTx: async (req, res, next) => {
        const { address } = req.params;
        const { to, amounts } = req.body;
        if (!address || !to || !amounts || to.length != amounts.length) {
            return res.sendStatus(200);
        }
        let raw_txs;
        try {
            raw_txs = await core.getTransferAdaRawTransaction(address, to, amounts);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { raw_txs } });
    },
    getTokenRawTx: async (req, res, next) => {
        const { address, token_address } = req.params;
        const [policy_id, asset_name] = token_address.split('.');
        const { to, amounts } = req.body;
        if (!to || !amounts || to.length != amounts.length || !token_address || !policy_id || !asset_name) {
            return res.sendStatus(200);
        }
        let raw_txs;
        try {
            raw_txs = await core.getTransferTokenRawTransaction(address, policy_id, asset_name, to, amounts);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { raw_txs } });
    },
    submitSignedTx: async (req, res, next) => {
        const { address } = req.params;
        const { signedTransaction } = req.body;
        if (!signedTransaction || !address) {
            return res.sendStatus(200);
        }
        let tx_id;
        try {
            tx_id = await core.submitSignedTransaction(address, signedTransaction);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { tx_id } });
    },
};
