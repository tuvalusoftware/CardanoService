import { getVersion } from "../core";

const ver = await getVersion({
  unit: "5276743ffa5ee4e6d5303504c5ce0cbaad067a998960701892f1df4c74657374313030"
});

console.log(ver);