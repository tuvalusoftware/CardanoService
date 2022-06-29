// const core = require('../core');
// const CardanoWasm = require('@emurgo/cardano-serialization-lib-nodejs');

// async function f() {
//   const utxos = await core.getAddressUtxos('addr_test1wrjax6x2p8zmtugps68zxjckz7v9jzh6zp23vphs4832lxs540q2e');
//   const utxo = utxos.find(utxo => {
//     return utxo.amount[0].unit === "942bbf3a3992b1ac3373127f82afb993eec587633dae6a3be4e6bcad465549584c4142534e4654434f4e545241435431" 
//     || utxo.amount[1].unit === "942bbf3a3992b1ac3373127f82afb993eec587633dae6a3be4e6bcad465549584c4142534e4654434f4e545241435431";
//   });
//   console.log(utxo.data_hash);
// }

// f();