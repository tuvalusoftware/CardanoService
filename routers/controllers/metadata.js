/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
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
};
