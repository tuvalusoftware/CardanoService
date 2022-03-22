/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const core = require('../../core');

module.exports = {
    add: async (req, res, next) => {
        const { metadata, asset_name } = req.body;
        if (!asset_name || !metadata) {
            return res.sendStatus(200);
        }
        let tx_hash;
        try {
            tx_hash = await core.addNFT(asset_name, metadata);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { tx_hash } });
    },
    transferById: async (req, res, next) => {
        const { asset_id, receiver } = req.params;
        const [policyId, asset_name] = asset_id.split('.');
        let tx_hash;
        try {
            tx_hash = await core.transferNFTById(policyId, asset_name, receiver);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { tx_hash } });
    },
    fetchById: async (req, res, next) => {
        const { asset_id } = req.params;
        const [policyId, asset_name] = asset_id.split('.');
        let nft;
        try {
            nft = await core.fetchNFTById(policyId, asset_name);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: nft });
    },
};
