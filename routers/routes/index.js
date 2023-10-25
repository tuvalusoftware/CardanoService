import express from "express";
import * as C from "../controllers";
import * as AUTH from "../controllers/auth";

const router = express.Router();

router.get("/", C.HelloWorld);

router.post("/hash", C.StoreHash);
router.put("/hash", [AUTH.ensureAuthenticated], C.UpdateHash);
router.delete("/hash", [AUTH.ensureAuthenticated], C.RevokeHash);

router.post("/hash-random", [AUTH.ensureAuthenticated], C.StoreHashRandom);
router.post("/credential-random", [AUTH.ensureAuthenticated], C.StoreCredentialRandom);

router.post("/credential", [AUTH.ensureAuthenticated], C.StoreCredential);
router.delete("/credential", [AUTH.ensureAuthenticated], C.RevokeCredential);

router.post("/fetch/nft", C.FetchNFT);
router.post("/verify/signature", [AUTH.ensureAuthenticated], C.VerifySignature);

export { router };