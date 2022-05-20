# Guide

Step 0. Create `.env` file in root and copy-paste: 

```
isTestnet=#
blockFrostApiKey=#
MNEMONIC=#
policyId=#
```

Step 0.1. To get policyId, run:

```
node scripts/generate_policyid.js
```

**You must fill MNEMONIC, blockFrostApiKey and isTestnet before run.**

Step 1. Go to root directory, and 

```
npm i
```

Step 2. Go to `https://<localhost>/docs` to read a document.