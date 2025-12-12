# Polkadot NFT Integration for Aurora

This module implements NFT minting on the Polkadot Asset Hub (Westend testnet) for Aurora's Master CD NFTs.

## Overview

When an ISO file is created for an album, the system:
1. Calculates the SHA-256 hash of the ISO file
2. Connects to the user's Polkadot wallet (via browser extension)
3. Creates or uses an existing NFT collection
4. Uploads album metadata (including ISO hash) to IPFS
5. Mints an NFT on Polkadot Asset Hub with the metadata

## Files

- `blockchain.ts` - Polkadot API initialization and connection management
- `album-nft.ts` - Album NFT minting logic and collection management

## Requirements

### Wallet Extension
Users need one of these Polkadot wallet extensions installed:
- Polkadot.js Extension
- SubWallet
- Talisman

### Testnet Tokens
To mint NFTs on Westend Asset Hub, users need WND (Westend) tokens:
1. Get WND from the [Westend Faucet](https://faucet.polkadot.io/)
2. Transfer some WND to Asset Hub via XCM

### Dependencies
```bash
npm install @polkadot/api @polkadot/extension-dapp @polkadot/extension-inject
```

## Usage

### In NFTMinterAgent

```typescript
import { AlbumNFTMinter, AlbumMasterData } from '../blockchain/album-nft.js';

// Initialize minter
const minter = new AlbumNFTMinter();
await minter.initialize();

// Connect wallet
const account = await minter.connectWallet();

// Create collection (optional, can reuse existing)
const collection = await minter.createCollection(
  "My Artist Master CD NFTs",
  "Collection of Master CD NFTs"
);

// Mint NFT with ISO hash
const albumData: AlbumMasterData = {
  artistName: "AI Artist",
  albumName: "Synthwave Dreams",
  isoSha256: "abc123...", // SHA-256 hash from CDWriterAgent
  description: "Master CD NFT for Synthwave Dreams"
};

const nft = await minter.mintAlbumNFT(collection.collectionId, albumData);
console.log(`NFT minted: ${nft.subscanUrl}`);
```

## NFT Metadata Structure

Each Album NFT includes:
```json
{
  "name": "Artist Name - Album Name (Master CD NFT)",
  "description": "Master CD NFT representing the AI-generated album and its ISO content hash.",
  "external_url": "https://aurora.app",
  "attributes": [
    { "trait_type": "Artist", "value": "Artist Name" },
    { "trait_type": "Album", "value": "Album Name" },
    { "trait_type": "ISO SHA-256", "value": "abc123..." },
    { "trait_type": "Created", "value": "2025-12-06T..." }
  ],
  "properties": {
    "iso_sha256": "abc123..."
  }
}
```

## Network Configuration

Currently configured for **Westend Asset Hub** (testnet):
- RPC: `wss://westend-asset-hub-rpc.polkadot.io`
- Explorer: https://assethub-westend.subscan.io/

To switch to mainnet (Asset Hub on Polkadot):
- Update RPC in `blockchain.ts` to `wss://polkadot-asset-hub-rpc.polkadot.io`
- Update Subscan URLs to `https://assethub.subscan.io/`

## IPFS Integration

The `uploadAlbumMetadata` method currently returns a mock CID. To enable real IPFS uploads:

### Option 1: Pinata API
```typescript
const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PINATA_JWT}`
  },
  body: JSON.stringify({
    pinataContent: metadata,
    pinataMetadata: { name: displayName }
  })
});
const data = await response.json();
return data.IpfsHash;
```

### Option 2: Supabase Edge Function
Create a Supabase Edge Function that proxies to Pinata:
```typescript
const { data } = await supabase.functions.invoke('pinata-upload', {
  body: { metadata, name: displayName }
});
return data.cid;
```

## Error Handling

Common errors:
- **"No Polkadot wallet extension detected"** - User needs to install a wallet extension
- **"No Polkadot accounts found"** - User needs to create/import an account in their wallet
- **"Insufficient balance"** - User needs WND tokens for transaction fees
- **"Collection does not exist"** - Invalid collection ID or collection not yet confirmed on-chain

## Testing

1. Install a Polkadot wallet extension
2. Create a test account
3. Get WND tokens from the faucet
4. Run the Aurora backend
5. Upload tracks and generate a CD package with ISO creation enabled
6. Check the Subscan URL in the response to verify the NFT was minted

## Future Enhancements

- [ ] Implement real IPFS upload via Pinata
- [ ] Add cover art image to NFT metadata
- [ ] Support batch minting for multiple albums
- [ ] Add NFT transfer functionality
- [ ] Implement collection management UI
- [ ] Add support for custom collection settings
- [ ] Integrate with marketplace APIs
