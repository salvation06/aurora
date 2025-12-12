import { AlbumNFTMinter } from '../blockchain/album-nft.js';
export class NFTMinterAgent {
    async execute(artistName, albumName, isoSha256, collectionId, description) {
        console.log(`Minting NFT for ${artistName} - ${albumName}`);
        console.log(`ISO SHA-256: ${isoSha256}`);
        try {
            // Initialize the Album NFT Minter
            const minter = new AlbumNFTMinter();
            await minter.initialize();
            // Connect wallet (requires Polkadot.js extension)
            const account = await minter.connectWallet();
            console.log(`Connected wallet: ${account.address}`);
            // Create or use existing collection
            let finalCollectionId = collectionId;
            if (!finalCollectionId) {
                console.log('Creating new NFT collection...');
                const collectionInfo = await minter.createCollection(`${artistName} Master CD NFTs`, `A collection of Master CD NFTs created by ${artistName} via Aurora.`);
                finalCollectionId = collectionInfo.collectionId;
                console.log(`Created collection ID: ${finalCollectionId}`);
            }
            // Prepare album metadata
            const albumData = {
                artistName,
                albumName,
                isoSha256,
                description: description || `Master CD NFT for ${albumName} by ${artistName}`
            };
            // Mint the NFT
            console.log('Minting Album NFT on Polkadot Asset Hub...');
            const nftResult = await minter.mintAlbumNFT(finalCollectionId, albumData);
            console.log(`NFT minted successfully!`);
            console.log(`Collection ID: ${nftResult.collectionId}`);
            console.log(`Item ID: ${nftResult.itemId}`);
            console.log(`Metadata CID: ${nftResult.metadataCid}`);
            console.log(`Transaction: ${nftResult.transactionHash}`);
            return nftResult;
        }
        catch (error) {
            console.error('NFT minting failed:', error);
            throw new Error(`NFT minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
