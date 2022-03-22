/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 */

const core = require('../../core');

module.exports = {
    airdropById: async (req, res, next) => {
        const { asset_id } = req.params;
        const { receivers, quantities } = req.body;
        const [policyId, asset_name] = asset_id.split('.');
        let tx_hashes;
        try {
            tx_hashes = await core.airdropById(policyId, asset_name, receivers, quantities);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { tx_hashes } });
    },
};
