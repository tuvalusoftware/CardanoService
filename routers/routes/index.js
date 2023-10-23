import express from "express";
import * as C from "../controllers";
// import * as CML from "../controllers/commonlands";
import * as AUTH from "../controllers/auth";

const router = express.Router();

router.get("/", C.HelloWorld);

// router.post("/mint-nft-foreach-hash", CML.MintNftForEachHash);
// router.post("/mint-nft-foreach-credential", CML.MintNftForEachCredential);

router.post("/hash", [AUTH.ensureAuthenticated], C.StoreHash);
router.put("/hash", [AUTH.ensureAuthenticated], C.UpdateHash);
router.delete("/hash", [AUTH.ensureAuthenticated], C.RevokeHash);
// router.post("/hash", [AUTH.ensureAuthenticated], C.StoreHash);

router.post("/hash-random", [AUTH.ensureAuthenticated], C.StoreHashRandom);
router.post("/credential-random", [AUTH.ensureAuthenticated], C.StoreCredentialRandom);

router.post("/credential", [AUTH.ensureAuthenticated], C.StoreCredential);
// router.post("/credentials", [AUTH.ensureAuthenticated], C.StoreCredentials);
router.delete("/credential", [AUTH.ensureAuthenticated], C.RevokeCredential);

router.post("/fetch/nft", C.FetchNFT);
router.post("/verify/signature", [AUTH.ensureAuthenticated], C.VerifySignature);

export { router };