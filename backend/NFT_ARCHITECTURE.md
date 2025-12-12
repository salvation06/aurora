# NFT Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AURORA FRONTEND                          │
│  (React + TypeScript)                                           │
│                                                                  │
│  User uploads tracks → Fills artist/album info → Clicks submit │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP POST /api/aurora/start
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AURORA BACKEND (Node.js)                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    FLOW EXECUTOR                          │  │
│  │                                                            │  │
│  │  1. MediaIngestionAgent      → Process tracks            │  │
│  │  2. ArtistPersonaAgent       → Generate persona          │  │
│  │  3. AlbumIdentityAgent       → Create album concept      │  │
│  │  4. LinerNotesAgent          → Write liner notes         │  │
│  │  5. CoverArtAgent            → Design cover art          │  │
│  │  6. PromoStoryboardAgent     → Create promo              │  │
│  │  7. PackagingAgent           → Bundle content            │  │
│  │  8. CDWriterAgent            → Create ISO + SHA-256      │  │
│  │  9. NFTMinterAgent           → Mint NFT ◄────────────┐   │  │
│  └──────────────────────────────────────────────────────┼───┘  │
│                                                          │       │
└──────────────────────────────────────────────────────────┼──────┘
                                                           │
                                                           │
                    ┌──────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN INTEGRATION                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              AlbumNFTMinter Class                       │    │
│  │                                                          │    │
│  │  • initialize()        → Connect to Polkadot API       │    │
│  │  • connectWallet()     → Connect browser extension     │    │
│  │  • createCollection()  → Create NFT collection         │    │
│  │  • mintAlbumNFT()      → Mint NFT with ISO hash        │    │
│  │  • uploadMetadata()    → Upload to IPFS                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└────────┬─────────────────────────────────────────┬──────────────┘
         │                                         │
         │                                         │
         ▼                                         ▼
┌──────────────────────┐              ┌──────────────────────────┐
│  POLKADOT WALLET     │              │   POLKADOT ASSET HUB     │
│  (Browser Extension) │              │   (Blockchain)           │
│                      │              │                          │
│  • Polkadot.js       │◄────────────►│  • NFT Collection        │
│  • SubWallet         │  Sign Txs    │  • NFT Items             │
│  • Talisman          │              │  • Metadata              │
│                      │              │  • ISO SHA-256 Hash      │
└──────────────────────┘              └──────────────────────────┘
                                                   │
                                                   │
                                                   ▼
                                      ┌──────────────────────────┐
                                      │   IPFS / PINATA          │
                                      │   (Metadata Storage)     │
                                      │                          │
                                      │  • Album metadata JSON   │
                                      │  • Artist info           │
                                      │  • ISO hash              │
                                      │  • Cover art (optional)  │
                                      └──────────────────────────┘
```

## Data Flow

### 1. ISO Creation Flow
```
User Input
    ↓
Agents Process
    ↓
PackagingAgent → ContentBundle
    ↓
CDWriterAgent
    ↓
Create ISO File
    ↓
Calculate SHA-256 Hash
    ↓
Return: { isoPath, isoSha256 }
```

### 2. NFT Minting Flow
```
ISO SHA-256 Hash
    ↓
NFTMinterAgent.execute()
    ↓
AlbumNFTMinter.initialize()
    ↓
Connect to Polkadot API
    ↓
AlbumNFTMinter.connectWallet()
    ↓
User approves in wallet extension
    ↓
AlbumNFTMinter.createCollection() [if needed]
    ↓
User signs collection creation tx
    ↓
Wait for on-chain confirmation
    ↓
AlbumNFTMinter.uploadAlbumMetadata()
    ↓
Upload metadata to IPFS → Get CID
    ↓
AlbumNFTMinter.mintAlbumNFT()
    ↓
User signs mint transaction
    ↓
NFT minted on Asset Hub
    ↓
Return: { collectionId, itemId, metadataCid, txHash, subscanUrl }
```

## Component Responsibilities

### NFTMinterAgent
- **Purpose**: Orchestrate NFT minting process
- **Input**: Artist name, album name, ISO SHA-256 hash
- **Output**: NFT result with transaction details
- **Dependencies**: AlbumNFTMinter

### AlbumNFTMinter
- **Purpose**: Low-level blockchain operations
- **Responsibilities**:
  - Polkadot API connection
  - Wallet integration
  - Collection management
  - NFT minting
  - Metadata preparation
- **Dependencies**: @polkadot/api, @polkadot/extension-dapp

### blockchain.ts
- **Purpose**: Polkadot API singleton
- **Responsibilities**:
  - Initialize WebSocket connection
  - Manage API instance lifecycle
  - Provide connection to Asset Hub

## Transaction Flow

### Collection Creation
```
1. Query next collection ID
2. Create collection transaction
3. User signs in wallet
4. Wait for block inclusion
5. Set collection metadata
6. User signs metadata tx
7. Return collection info
```

### NFT Minting
```
1. Verify collection exists
2. Get next item ID
3. Upload metadata to IPFS
4. Create mint transaction
5. User signs in wallet
6. Wait for block inclusion
7. Return NFT info
```

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Browser Extension                             │
│  • Private keys never leave extension                   │
│  • User must approve each transaction                   │
│  • Password protected                                   │
│                                                          │
│  Layer 2: Transaction Signing                           │
│  • All transactions require user signature              │
│  • Transaction details shown before signing             │
│  • Can reject any transaction                           │
│                                                          │
│  Layer 3: Blockchain Validation                         │
│  • Polkadot validators verify transactions              │
│  • Immutable once confirmed                             │
│  • Transparent on-chain history                         │
│                                                          │
│  Layer 4: IPFS Storage                                  │
│  • Decentralized metadata storage                       │
│  • Content-addressed (CID)                              │
│  • Permanent and tamper-proof                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Network Configuration

### Testnet (Current)
- **Network**: Westend Asset Hub
- **RPC**: wss://westend-asset-hub-rpc.polkadot.io
- **Explorer**: https://assethub-westend.subscan.io/
- **Token**: WND (free from faucet)
- **Purpose**: Testing and development

### Mainnet (Production)
- **Network**: Polkadot Asset Hub
- **RPC**: wss://polkadot-asset-hub-rpc.polkadot.io
- **Explorer**: https://assethub.subscan.io/
- **Token**: DOT (real value)
- **Purpose**: Production NFTs

## Error Handling

```
┌─────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Connection Errors                                      │
│  • Retry with exponential backoff                       │
│  • Fallback to alternative RPC                          │
│  • Clear error messages to user                         │
│                                                          │
│  Wallet Errors                                          │
│  • Detect missing extension                             │
│  • Detect missing accounts                              │
│  • Handle user rejection                                │
│                                                          │
│  Transaction Errors                                     │
│  • Parse blockchain error codes                         │
│  • Check balance before transaction                     │
│  • Timeout handling (90s max)                           │
│                                                          │
│  Metadata Errors                                        │
│  • Validate JSON structure                              │
│  • Handle IPFS upload failures                          │
│  • Retry failed uploads                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Timing
- **Collection Creation**: ~30-60 seconds (2 transactions)
- **NFT Minting**: ~15-30 seconds (1 transaction)
- **Total per album**: ~45-90 seconds

### Optimization
- Reuse collections for multiple albums
- Batch metadata uploads
- Cache API connections
- Parallel transaction preparation

### Scalability
- One collection can hold unlimited NFTs
- Each artist can have their own collection
- Collections can be shared across albums
- No limit on number of collections per account

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic NFT minting
- ✅ ISO hash storage
- ✅ Collection management
- ✅ Wallet integration

### Phase 2 (Next)
- [ ] Real IPFS upload via Pinata
- [ ] Cover art in NFT metadata
- [ ] Batch minting support
- [ ] Collection customization

### Phase 3 (Future)
- [ ] NFT marketplace integration
- [ ] Royalty configuration
- [ ] Transfer functionality
- [ ] Burn/destroy NFTs
- [ ] Collection analytics

### Phase 4 (Advanced)
- [ ] Multi-chain support
- [ ] Cross-chain bridges
- [ ] Fractional ownership
- [ ] Smart contract integration
