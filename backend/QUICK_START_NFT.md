# Quick Start: NFT Minting

Get your Aurora app minting NFTs in 5 minutes!

## 1. Install Dependencies ✅

Already done! The Polkadot packages are installed.

```bash
cd backend
npm install  # Already completed
```

## 2. Install Wallet Extension (2 minutes)

Choose one and install in your browser:
- **Polkadot.js**: https://polkadot.js.org/extension/
- **SubWallet**: https://subwallet.app/download.html
- **Talisman**: https://talisman.xyz/

## 3. Get Test Tokens (2 minutes)

1. Create account in your wallet extension
2. Copy your wallet address
3. Visit: https://faucet.polkadot.io/
4. Select "Westend" and paste your address
5. Complete verification → Get 1 WND

## 4. Transfer to Asset Hub (1 minute)

1. Visit: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/accounts
2. Go to Network → Parachains → Teleport
3. Send 0.5 WND from Westend to Asset Hub
4. Wait ~12 seconds for confirmation

## 5. Test It!

Start the backend:
```bash
npm run dev
```

Use the frontend to:
1. Upload some tracks
2. Fill in artist/album details  
3. Enable "Create ISO and burn CD"
4. Click "Generate CD Package"

The NFT will be minted automatically! 🎉

## Verify Your NFT

Check your NFT on Subscan:
```
https://assethub-westend.subscan.io/account/YOUR_ADDRESS?tab=nft
```

## What Just Happened?

1. ✅ ISO file created with SHA-256 hash
2. ✅ Wallet connected (you approved it)
3. ✅ NFT collection created (or reused existing)
4. ✅ Metadata uploaded to IPFS
5. ✅ NFT minted on Polkadot Asset Hub
6. ✅ ISO hash stored on-chain forever!

## Next Steps

- **Add more albums** → Mint more NFTs to your collection
- **Configure IPFS** → See `POLKADOT_SETUP.md` for Pinata setup
- **Go to mainnet** → Switch network when ready for production

## Troubleshooting

**"No wallet detected"**
→ Install extension and refresh page

**"No accounts found"**  
→ Create account in wallet extension

**"Insufficient balance"**
→ Get more WND from faucet and transfer to Asset Hub

**Transaction fails**
→ Check balance on Asset Hub (not relay chain)

## Full Documentation

- Setup Guide: `POLKADOT_SETUP.md`
- Implementation Details: `NFT_IMPLEMENTATION.md`
- Technical Docs: `src/blockchain/README.md`
- Code Examples: `src/blockchain/example.ts`

---

**That's it!** You're now minting real NFTs on Polkadot. 🚀
