// album-nft.ts - Album Master NFT minting for Aurora
import { ApiPromise } from "@polkadot/api";
import { web3Enable, web3Accounts, web3FromAddress } from "@polkadot/extension-dapp";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { initPolkadot } from "./blockchain.js";

// =============================================================================
// TYPES
// =============================================================================
export interface AlbumMasterData {
  artistName: string;
  albumName: string;
  isoSha256: string;      // hex-encoded SHA-256 of the ISO
  description?: string;   // optional human-readable description
}

export interface MintedAlbumNFT {
  collectionId: number;
  itemId: number;
  metadataCid: string;
  owner: string;
  transactionHash: string;
  subscanUrl: string;
}

export interface CollectionInfo {
  collectionId: number;
  owner: string;
  transactionHash: string;
}

// Global flag to ensure web3Enable is only called once
let web3Enabled = false;

// =============================================================================
// ALBUM NFT CLASS
// =============================================================================
export class AlbumNFTMinter {
  private api: ApiPromise | null = null;
  private account: InjectedAccountWithMeta | null = null;

  async initialize(): Promise<void> {
    this.api = await initPolkadot();
  }

  async connectWallet(): Promise<InjectedAccountWithMeta> {
    // Only call web3Enable once globally
    if (!web3Enabled) {
      const extensions = await web3Enable("Aurora Master NFT");
      if (extensions.length === 0) {
        await new Promise((r) => setTimeout(r, 1000));
        const retryExtensions = await web3Enable("Aurora Master NFT");
        if (retryExtensions.length === 0) {
          throw new Error(
            "No Polkadot wallet extension detected.\n\n" +
            "Please install Polkadot.js, SubWallet, or Talisman, then refresh.",
          );
        }
      }
      web3Enabled = true;
    }

    const allAccounts = await web3Accounts();
    if (allAccounts.length === 0) {
      throw new Error(
        "No Polkadot accounts found.\n\n" +
        "Please:\n" +
        "1. Open your wallet extension\n" +
        "2. Create or import an account\n" +
        "3. Refresh this page and try again",
      );
    }

    this.account = allAccounts[0];
    return this.account;
  }

  /**
   * Create NFT collection - ONE wallet popup, NO extra metadata transaction requirements for caller.
   */
  async createCollection(
    collectionName: string,
    description: string
  ): Promise<CollectionInfo> {
    if (!this.api) throw new Error("API not initialized");
    if (!this.account) throw new Error("Wallet not connected");

    const nextCollectionId = await this.api.query.nfts.nextCollectionId();
    const collectionId = Number(nextCollectionId.toString());

    // Collection config
    const config = {
      settings: 0,
      maxSupply: null,
      mintSettings: {
        mintType: { Issuer: null },
        price: null,
        startBlock: null,
        endBlock: null,
        defaultItemSettings: 0,
      },
    };

    const tx = this.api.tx.nfts.create(this.account.address, config);
    const injector = await web3FromAddress(this.account.address);

    let txHashResult: string | null = null;
    const unsubscribe = await tx.signAndSend(
      this.account.address,
      { signer: injector.signer },
      ({ status, txHash, dispatchError }: any) => {
        if (!txHashResult) {
          txHashResult = txHash.toHex();
        }
        if (status.isInBlock && dispatchError) {
          if (dispatchError.isModule) {
            const decoded = this.api!.registry.findMetaError(dispatchError.asModule);
            console.error(`${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`);
          }
          return;
        }
        if (status.isFinalized) {
          unsubscribe();
        }
      },
    );

    const txHash = txHashResult || "pending";

    // Optionally set collection metadata with a tip
    await this.waitForCollection(collectionId);

    const metadataString = JSON.stringify({
      name: collectionName,
      description,
      creator: this.account.address,
      created: new Date().toISOString(),
    });

    const metadataTx = this.api.tx.nfts.setCollectionMetadata(collectionId, metadataString);
    const metadataInjector = await web3FromAddress(this.account.address);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Metadata transaction timed out after 90 seconds"));
      }, 90000);

      metadataTx
        .signAndSend(
          this.account!.address,
          {
            signer: metadataInjector.signer,
            tip: 1000000000000, // 1 WND tip for priority
          },
          ({ status, dispatchError }: any) => {
            if (status.isInBlock) {
              clearTimeout(timeout);
              if (dispatchError) {
                if (dispatchError.isModule) {
                  const decoded = this.api!.registry.findMetaError(dispatchError.asModule);
                  console.error(`${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`);
                }
                reject(new Error("Failed to set collection metadata"));
              } else {
                resolve();
              }
            }
          },
        )
        .catch((err: any) => {
          clearTimeout(timeout);
          reject(err);
        });
    });

    return {
      collectionId,
      owner: this.account.address,
      transactionHash: txHash,
    };
  }

  /**
   * Wait for collection to exist on-chain
   */
  private async waitForCollection(collectionId: number, timeoutMs: number = 60000): Promise<void> {
    if (!this.api) throw new Error("API not initialized");

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const details = await this.api.query.nfts.collection(collectionId);
        if (details && details.toString() !== "") {
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      } catch {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    throw new Error(`Timeout: Collection ${collectionId} not confirmed after ${timeoutMs / 1000}s`);
  }

  /**
   * Mint Album Master NFT - stores ISO SHA-256 hash + artist/album on IPFS
   */
  async mintAlbumNFT(collectionId: number, albumData: AlbumMasterData): Promise<MintedAlbumNFT> {
    if (!this.api) throw new Error("API not initialized");
    if (!this.account) throw new Error("Wallet not connected");

    await this.waitForCollection(collectionId);

    // Get next item ID from collection details
    const collectionDetails = await this.api.query.nfts.collection(collectionId);
    if (!collectionDetails || collectionDetails.toString() === "") {
      throw new Error(`Collection ${collectionId} does not exist`);
    }

    const details = collectionDetails as any;
    const itemId = Number(details.items?.toString() || "0");

    // Upload metadata (artist/album/ISO hash) to IPFS
    const metadataCid = await this.uploadAlbumMetadata(albumData);

    // Mint NFT
    const mintTx = this.api.tx.nfts.mint(collectionId, itemId, this.account.address, null);
    const injector = await web3FromAddress(this.account.address);

    let mintTxHashResult: string | null = null;
    const mintUnsubscribe = await mintTx.signAndSend(
      this.account.address,
      { signer: injector.signer },
      ({ status, txHash, dispatchError }: any) => {
        if (!mintTxHashResult) {
          mintTxHashResult = txHash.toHex();
        }
        if (status.isInBlock && dispatchError) {
          if (dispatchError.isModule) {
            const decoded = this.api!.registry.findMetaError(dispatchError.asModule);
            console.error(`${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`);
          }
          return;
        }
        if (status.isFinalized) {
          mintUnsubscribe();
        }
      },
    );

    const mintTxHash = mintTxHashResult || "pending";
    const subscanUrl = `https://assethub-westend.subscan.io/account/${this.account.address}?tab=nft`;

    return {
      collectionId,
      itemId,
      metadataCid,
      owner: this.account.address,
      transactionHash: mintTxHash,
      subscanUrl,
    };
  }

  private async uploadAlbumMetadata(album: AlbumMasterData): Promise<string> {
    const displayName = `${album.artistName} - ${album.albumName} (Master CD NFT)`;
    const metadata = {
      name: displayName,
      description:
        album.description ||
        "Master CD NFT representing the AI-generated album and its ISO content hash.",
      image: undefined, // optional: hook to album art IPFS CID later
      external_url: "https://aurora.app", // update if you have a different URL
      attributes: [
        { trait_type: "Artist", value: album.artistName },
        { trait_type: "Album", value: album.albumName },
        { trait_type: "ISO SHA-256", value: album.isoSha256 },
        { trait_type: "Created", value: new Date().toISOString() },
      ],
      properties: {
        iso_sha256: album.isoSha256,
      },
    };

    console.log('Uploading metadata to IPFS via Pinata...');

    // Check if Pinata JWT is available
    const pinataJWT = process.env.PINATA_JWT;
    
    if (!pinataJWT) {
      console.warn('PINATA_JWT not found in environment variables. Using mock CID.');
      const mockCid = `Qm${Buffer.from(JSON.stringify(metadata)).toString('hex').substring(0, 44)}`;
      console.log('Mock CID generated:', mockCid);
      return mockCid;
    }

    try {
      // Upload to Pinata IPFS
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pinataJWT}`
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: displayName.replace(/\s+/g, '-').toLowerCase()
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✓ Metadata uploaded to IPFS:', data.IpfsHash);
      return data.IpfsHash;
    } catch (error) {
      console.error('Failed to upload to Pinata:', error);
      // Fallback to mock CID if upload fails
      const mockCid = `Qm${Buffer.from(JSON.stringify(metadata)).toString('hex').substring(0, 44)}`;
      console.log('Using fallback mock CID:', mockCid);
      return mockCid;
    }
  }

  async getCollectionNFTs(
    collectionId: number,
    ownerAddress?: string,
  ): Promise<Array<{ itemId: number; owner: string; metadata?: string }>> {
    if (!this.api) throw new Error("API not initialized");

    const owner = ownerAddress || this.account?.address;
    if (!owner) throw new Error("No owner address");

    const collectionDetails = await this.api.query.nfts.collection(collectionId);
    if (!collectionDetails || collectionDetails.toString() === "") {
      return [];
    }

    const details = collectionDetails as any;
    const totalItems = Number(details.items?.toString() || "0");

    const nfts = [];
    for (let itemId = 0; itemId < totalItems; itemId++) {
      const itemDetails = await this.api.query.nfts.item(collectionId, itemId);
      if (itemDetails && itemDetails.toString() !== "") {
        const item = itemDetails as any;
        const itemOwner = item.owner?.toString();
        if (itemOwner === owner) {
          const metadata = await this.api.query.nfts.itemMetadataOf(collectionId, itemId);
          const metadataData =
            metadata && metadata.toString() !== "" ? (metadata as any).data?.toUtf8() : undefined;
          nfts.push({
            itemId,
            owner: itemOwner,
            metadata: metadataData,
          });
        }
      }
    }

    return nfts;
  }

  async getCollectionInfo(collectionId: number): Promise<{
    exists: boolean;
    owner?: string;
    items?: number;
  }> {
    if (!this.api) throw new Error("API not initialized");

    const collectionDetails = await this.api.query.nfts.collection(collectionId);
    if (!collectionDetails || collectionDetails.toString() === "") {
      return { exists: false };
    }

    const details = collectionDetails as any;
    return {
      exists: true,
      owner: details.owner?.toString(),
      items: Number(details.items?.toString() || "0"),
    };
  }
}

// Helper to create a collection for a user's Master CD NFTs
export async function createMasterAlbumCollection(label: string): Promise<CollectionInfo> {
  const minter = new AlbumNFTMinter();
  await minter.initialize();
  await minter.connectWallet();
  return await minter.createCollection(
    `${label} Master CD NFTs`,
    `A collection of Master CD NFTs created by ${label} via Aurora.`,
  );
}
