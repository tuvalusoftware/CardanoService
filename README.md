# Guide

Step 0. Go to root directory, and 

```
npm i
```

Step 1. Create `.env` file in root and copy-paste: 

```
isTestnet=#
blockFrostApiKey=#
mNemonic=#
policyId=#
```

Step 1.1. To get policyId, run (in root dir):

```
npm run policy
```

**You must fill mNemonic, blockFrostApiKey and isTestnet before run.**

Step 2. Go to `https://<localhost>/docs` to read a document.