import * as S from "@emurgo/cardano-serialization-lib-nodejs";
import * as L from "./core/lucid";
import * as T from "./core/index";
import * as B from "./core/blockfrost";

console.log(B.BlockfrostConfig);
console.log(B.capitalize(B.BlockfrostConfig.network));