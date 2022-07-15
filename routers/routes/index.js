import express from "express";
import * as C from "../controllers";

const router = express.Router();

router.get("/", C.HelloWorld);

router.post("/hash", C.StoreHash);

router.put("/hash", C.UpdateHash);

router.delete("/hash", C.RevokeHash);

router.post("/hash", C.StoreHash);

router.post("/credential", C.StoreCredential);

router.delete("/credential", C.RevokeCredential);

router.post("/fetch/nft", C.FetchNFT);

router.post("/verify/signature", C.VerifySignature);

export { router };