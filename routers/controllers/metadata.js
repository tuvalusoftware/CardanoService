/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
    add: async (req, res, next) => {
        const { metadata } = req.body;
        if (!metadata) {
            return res.sendStatus(200);
        }
        let tx_hash;
        try {
            tx_hash = await core.addMetadata(metadata);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { tx_hash } });
    },
    update: async (req, res, next) => {
        const { new_metadata, previous_tx_hash } = req.body;
        if (!new_metadata || !previous_tx_hash) {
            return res.sendStatus(200);
        }
        let tx_hash;
        try {
            tx_hash = await core.addMetadata({ ...new_metadata, previous_tx_hash });
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { tx_hash } });
    },
    fetch: async (req, res, next) => {
        let list;
        try {
            list = await core.fetchMetadata();
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: list });
    },
    getRawTx: async (req, res, next) => {
        const { metadata } = req.body;
        if (!metadata) {
            return res.sendStatus(200);
        }
        let raw_tx;
        try {
            raw_tx = await core.getCreateMetadataRawTransaction(metadata);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { raw_tx } });
    },
    getAdaRawTx: async (req, res, next) => {
        const { addresses, amounts } = req.body;
        if (!addresses || !amounts || addresses.length != amounts.length) {
            return res.sendStatus(200);
        }
        let raw_tx;
        try {
            raw_tx = await core.getTransferAdaRawTransaction(addresses, amounts);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { raw_tx } });
    },
    submitSignedTx: async (req, res, next) => {
        const { signedTransaction } = req.body;
        if (!signedTransaction) {
            return res.sendStatus(200);
        }
        let tx_id;
        try {
            tx_id = await core.submitSignedTransaction(signedTransaction);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { tx_id } });
    },
};
