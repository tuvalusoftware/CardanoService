

await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: "./dist",
  external: ["@emurgo/cardano-message-signing-nodejs", "asn1js"],
  target: "bun",
  format: "esm",
})
