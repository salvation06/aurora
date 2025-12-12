# Polkadot NFT Setup Guide for Aurora

This guide will help you set up the Polkadot blockchain integration for minting Album Master NFTs.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **A Polkadot wallet extension** (one of the following):
   - [Polkadot.js Extension](https://polkadot.js.org/extension/)
   - [SubWallet](https://subwallet.app/)
   - [Talisman](https://talisman.xyz/)

## Installation Steps

### 1. Install Dependencies

Navigate to the backend directory and install the Polkadot packages:

```bash
cd backend
npm install
```

This will install:
- `@polkadot/api` - Core Polkadot API
- `@polkadot/extension-dapp` - Browser extension integration
- `@polkadot/extension-inject` - Type definitions for extensions

### 2. Install a Wallet Extension

Choose one of the wallet extensions and install it in your browser:

#### Polkadot.js Extension
- Chrome: https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/

#### SubWallet
- Website: https://subwallet.app/download.html
- Supports Chrome, Firefox, Brave, and mobile

#### Talisman
- Website: https://talisman.xyz/
- Supports Chrome and Firefox

### 3. Create a Wallet Account

1. Open your installed wallet extension
2. Click "Create new account" or "Import account"
3. Follow the prompts to create/import your account
4. **IMPORTANT**: Save your seed phrase securely!
5. Set a strong password for the extension

### 4. Get Testnet Tokens (WND)

To mint NFTs on the Westend testnet, you need WND tokens:

1. Visit the Westend Faucet: https://faucet.polkadot.io/
2. Select "Westend" network
3. Enter your wallet address (copy from extension)
4. Complete the verification (GitHub or email)
5. Receive 1 WND (should arrive within a few minutes)

### 5. Transfer Tokens to Asset Hub

NFTs are minted on Asset Hub, so you need to transfer some WND there:

1. Visit Polkadot.js Apps: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/accounts
2. Connect your wallet extension
3. Go to "Network" → "Parachains" → "Teleport"
4. Select:
   - From: Westend Relay Chain
   - To: Asset Hub (Westend)
   - Amount: 0.5 WND (keep some for relay chain fees)
5. Sign and submit the transaction
6. Wait for confirmation (~12 seconds)

### 6. Verify Asset Hub Balance

1. Switch to Asset Hub: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-asset-hub-rpc.polkadot.io#/accounts
2. Check that your account shows the transferred WND balance
3. You're ready to mint NFTs!

## Testing the Integration

### Option 1: Run the Backend Server

```bash
cd backend
npm run dev
```

Then use the frontend to:
1. Upload tracks
2. Fill in artist/album details
3. Enable "Create ISO and burn CD"
4. Click "Generate CD Package"
5. The NFT will be minted automatically after ISO creation

### Option 2: Run Example Script

```bash
cd backend
npx tsx src/blockchain/example.ts
```

Edit `example.ts` to uncomment the example you want to run.

## Configuration

### Network Settings

The integration is configured for **Westend Asset Hub** (testnet) by default.

To switch to **mainnet** (Polkadot Asset Hub):

1. Edit `backend/src/blockchain/blockchain.ts`:
```typescript
// Change from:
const wsProvider = new WsProvider("wss://westend-asset-hub-rpc.polkadot.io");

// To:
const wsProvider = new WsProvider("wss://polkadot-asset-hub-rpc.polkadot.io");
```

2. Update Subscan URLs in `backend/src/blockchain/album-nft.ts`:
```typescript
// Change from:
subscanUrl: `https://assethub-westend.subscan.io/account/${this.account.address}?tab=nft`

// To:
subscanUrl: `https://assethub.subscan.io/account/${this.account.address}?tab=nft`
```

3. **Get DOT tokens** instead of WND (mainnet costs real money!)

### IPFS Configuration

Currently, the metadata upload returns a mock CID. To enable real IPFS uploads:

1. Sign up for Pinata: https://pinata.cloud/
2. Get your API JWT token
3. Update `uploadAlbumMetadata` in `backend/src/blockchain/album-nft.ts`:

```typescript
private async uploadAlbumMetadata(album: AlbumMasterData): Promise<string> {
  const displayName = `${album.artistName} - ${album.albumName} (Master CD NFT)`;
  const metadata = { /* ... */ };

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PINATA_JWT}`
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: displayName }
    })
  });

  const data = await response.json();
  return data.IpfsHash;
}
```

4. Add `PINATA_JWT` to your environment variables

## Troubleshooting

### "No Polkadot wallet extension detected"
- Install one of the supported wallet extensions
- Refresh the page after installation
- Make sure the extension is enabled

### "No Polkadot accounts found"
- Create or import an account in your wallet extension
- Make sure the account is not locked
- Grant permission to the Aurora app when prompted

### "Insufficient balance" or transaction fails
- Check your WND balance on Asset Hub
- Get more WND from the faucet
- Make sure you transferred tokens to Asset Hub (not just relay chain)

### "Collection does not exist"
- Wait a few seconds for the collection to be confirmed on-chain
- The system automatically waits up to 60 seconds
- Check the collection ID is correct

### Connection issues
- Check your internet connection
- Try a different RPC endpoint
- Wait a moment and retry (RPC nodes can be temporarily busy)

## Cost Estimates

### Testnet (Westend)
- Create Collection: ~0.01 WND
- Mint NFT: ~0.005 WND per NFT
- Set Metadata: ~0.005 WND
- **Total per album**: ~0.02 WND (FREE from faucet)

### Mainnet (Polkadot)
- Create Collection: ~0.1 DOT (~$0.70 USD)
- Mint NFT: ~0.05 DOT (~$0.35 USD) per NFT
- Set Metadata: ~0.05 DOT (~$0.35 USD)
- **Total per album**: ~0.2 DOT (~$1.40 USD)

*Prices are approximate and vary with network congestion and DOT price*

## Security Notes

1. **Never share your seed phrase** - Anyone with your seed phrase can steal your funds
2. **Use testnet first** - Always test on Westend before using mainnet
3. **Keep small amounts** - Only keep what you need for minting in your hot wallet
4. **Verify transactions** - Always check transaction details before signing
5. **Backup your wallet** - Store your seed phrase securely offline

## Resources

- Polkadot.js Apps: https://polkadot.js.org/apps/
- Westend Faucet: https://faucet.polkadot.io/
- Asset Hub Subscan: https://assethub-westend.subscan.io/
- Polkadot Wiki: https://wiki.polkadot.network/
- NFT Pallet Docs: https://docs.rs/pallet-nfts/

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Check your wallet extension for pending transactions
4. Verify your balance on Subscan
5. Try again after a few minutes (blockchain can be slow sometimes)
