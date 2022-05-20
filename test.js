const core = require('./core');

async function test() {
  await core.burnNftTransaction('addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur', '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987');
}

test();

async function test2() {
  await core.checkIfNftMinted('11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987');
}

// test2();