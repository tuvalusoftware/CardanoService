/**
 *
 * Copyright (c) 2022 - Ferdon Vietnam Limited
 *
 * @author Nguyen Minh Tam / ngmitam@ferdon.io
 * @author Tran Quoc Khang / tkhang@ferdon.io
 */

const fs = require('fs');
var execSync = require('child_process').execSync;
const config = require('../config/walletConfig');

const folderPath = `${process.cwd()}/cardano-cli-js-dir/priv/wallet`;
const walletName = config.NAME;
const walletRecoveryPhrase = config.recoveryPhrase;

const auxPath = `${folderPath}/${walletName}`;
const netWork = config.network;

execSync(`mkdir -p ${auxPath}`);

try {
    fs.writeFileSync(`${auxPath}/${walletName}.phrase`, walletRecoveryPhrase);
} catch (err) {
    console.log(err);
}

execSync(
    `cat ${auxPath}/${walletName}.phrase | cardano-wallet key from-recovery-phrase Shelley > ${auxPath}/${walletName}.root.prv`
);

execSync(
    `cat ${auxPath}/${walletName}.root.prv | cardano-wallet key child 1852H/1815H/0H/0/0 > ${auxPath}/${walletName}.payment.prv`
);

execSync(
    `cat ${auxPath}/${walletName}.payment.prv | cardano-wallet key public --without-chain-code > ${auxPath}/${walletName}.payment.pub`
);

execSync(
    `cardano-cli key convert-cardano-address-key --shelley-payment-key --signing-key-file ${auxPath}/${walletName}.payment.prv --out-file ${auxPath}/${walletName}.payment.skey`
);

execSync(
    `cardano-cli key verification-key --signing-key-file ${auxPath}/${walletName}.payment.skey --verification-key-file ${auxPath}/${walletName}.payment.vkey`
);

execSync(
    `cat ${auxPath}/${walletName}.root.prv | cardano-wallet key child 1852H/1815H/0H/2/0 > ${auxPath}/${walletName}.stake.prv`
);

execSync(
    `cat ${auxPath}/${walletName}.stake.prv | cardano-wallet key public --without-chain-code > ${auxPath}/${walletName}.stake.pub`
);

execSync(
    `cardano-cli key convert-cardano-address-key --shelley-payment-key --signing-key-file ${auxPath}/${walletName}.stake.prv --out-file ${auxPath}/${walletName}.stake.skey`
);

execSync(
    `cardano-cli key verification-key --signing-key-file ${auxPath}/${walletName}.stake.skey --verification-key-file ${auxPath}/${walletName}.stake.vkey`
);

execSync(
    `cardano-cli stake-address build --${netWork} --stake-verification-key-file ${auxPath}/${walletName}.stake.pub --out-file ${auxPath}/${walletName}.stake.addr`
);

execSync(
    `cardano-cli address build --${netWork} --payment-verification-key $(cat ${auxPath}/${walletName}.payment.pub) --stake-verification-key $(cat ${auxPath}/${walletName}.stake.pub) --out-file ${auxPath}/${walletName}.payment.addr`
);
