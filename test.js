const core = require('./core');

async function test() {
  await core.burnNftTransaction('addr_test1qq53em6pdpswwc7mmeq50848emp4u7gmhp2dft4ud0lhar54000k46cgk82rmlfjysyxyvh9qkj7vtuc69ulgdypcnssjk3hur', '11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987');
}

// test();

async function test2() {
  await core.checkIfNftMinted('11d456db211d68cc8a6eac5e293422dec669b54812e4975497d7099467335987');
}

// test2();

async function test3() {
  const result = await core.getDatumValueFromDatumHash('7da5e55c6ce62ce83f32613a86b603ddbf30b83c2a6a9cac3941628f22af7098');
  console.log(JSON.stringify(result, undefined, 4));
}

// test3();

async function test4() {
  const result = await core.getAddressUtxos('addr_test1qr9meqtf8qu5v7a2aerf95zpjwuf8jmxpltg3yw6tlcqwhvr0g6943r8kf92qng9t6494rjt4udxppuzdkfuz8xjf4jskepta0');
  console.log(JSON.stringify(result, undefined, 4));
}

// test4();

const a = { randomNumber: 0.9494167384126306, timestamp: 1653451149348 };

console.log(Buffer.from(JSON.stringify(a, undefined, 4)).toString('hex'));