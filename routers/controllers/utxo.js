/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const core = require('../../core');

module.exports = {
    get: async (req, res, next) => {
        const address = req.params.address;
        if (!address) {
            return res.sendStatus(200);
        }
        let utxo;
        try {
            utxo = await core.getUtxo(address);
        } catch (err) {
            return next(new Error('Failed'));
        }
        return res.json({ data: { utxo } });
    },
};
