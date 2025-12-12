// example.ts - Example usage of Album NFT minting
// This file demonstrates how to use the AlbumNFTMinter class
import { AlbumNFTMinter, createMasterAlbumCollection } from './album-nft.js';
/**
 * Example 1: Create a new collection and mint an NFT
 */
async function exampleCreateAndMint() {
    console.log('=== Example 1: Create Collection and Mint NFT ===\n');
    try {
        // Initialize the minter
        const minter = new AlbumNFTMinter();
        await minter.initialize();
        console.log('✓ Polkadot API initialized');
        // Connect wallet (will prompt user to select account)
        const account = await minter.connectWallet();
        console.log(`✓ Wallet connected: ${account.address}`);
        // Create a new collection
        console.log('\nCreating NFT collection...');
        const collection = await minter.createCollection('Aurora Test Collection', 'Test collection for Aurora Master CD NFTs');
        console.log(`✓ Collection created: ID ${collection.collectionId}`);
        console.log(`  Owner: ${collection.owner}`);
        console.log(`  Transaction: ${collection.transactionHash}`);
        // Prepare album data
        const albumData = {
            artistName: 'Synthwave Dreamer',
            albumName: 'Neon Nights',
            isoSha256: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
            description: 'A nostalgic journey through 80s synthwave soundscapes'
        };
        // Mint the NFT
        console.log('\nMinting Album NFT...');
        const nft = await minter.mintAlbumNFT(collection.collectionId, albumData);
        console.log(`✓ NFT minted successfully!`);
        console.log(`  Collection ID: ${nft.collectionId}`);
        console.log(`  Item ID: ${nft.itemId}`);
        console.log(`  Metadata CID: ${nft.metadataCid}`);
        console.log(`  Owner: ${nft.owner}`);
        console.log(`  Transaction: ${nft.transactionHash}`);
        console.log(`  View on Subscan: ${nft.subscanUrl}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
/**
 * Example 2: Mint to an existing collection
 */
async function exampleMintToExisting(collectionId) {
    console.log('\n=== Example 2: Mint to Existing Collection ===\n');
    try {
        const minter = new AlbumNFTMinter();
        await minter.initialize();
        await minter.connectWallet();
        // Check if collection exists
        const collectionInfo = await minter.getCollectionInfo(collectionId);
        if (!collectionInfo.exists) {
            console.error(`Collection ${collectionId} does not exist`);
            return;
        }
        console.log(`✓ Collection ${collectionId} found`);
        console.log(`  Owner: ${collectionInfo.owner}`);
        console.log(`  Items: ${collectionInfo.items}`);
        // Mint another album to the same collection
        const albumData = {
            artistName: 'Synthwave Dreamer',
            albumName: 'Midnight Drive',
            isoSha256: 'b2c3d4e5f6789012345678901234567890123456789012345678901234567890ab',
            description: 'Late night cruising through neon-lit streets'
        };
        const nft = await minter.mintAlbumNFT(collectionId, albumData);
        console.log(`✓ NFT minted to existing collection!`);
        console.log(`  Item ID: ${nft.itemId}`);
        console.log(`  View on Subscan: ${nft.subscanUrl}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
/**
 * Example 3: List all NFTs in a collection owned by user
 */
async function exampleListNFTs(collectionId) {
    console.log('\n=== Example 3: List NFTs in Collection ===\n');
    try {
        const minter = new AlbumNFTMinter();
        await minter.initialize();
        const account = await minter.connectWallet();
        const nfts = await minter.getCollectionNFTs(collectionId);
        console.log(`Found ${nfts.length} NFT(s) owned by ${account.address}:`);
        nfts.forEach((nft, index) => {
            console.log(`\n${index + 1}. Item ID: ${nft.itemId}`);
            console.log(`   Owner: ${nft.owner}`);
            if (nft.metadata) {
                console.log(`   Metadata: ${nft.metadata}`);
            }
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
}
/**
 * Example 4: Use helper function to create collection
 */
async function exampleHelperFunction() {
    console.log('\n=== Example 4: Using Helper Function ===\n');
    try {
        const collection = await createMasterAlbumCollection('My Record Label');
        console.log(`✓ Collection created: ID ${collection.collectionId}`);
        console.log(`  Transaction: ${collection.transactionHash}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// Run examples
// Uncomment the example you want to run:
// exampleCreateAndMint();
// exampleMintToExisting(1000); // Replace with your collection ID
// exampleListNFTs(1000); // Replace with your collection ID
// exampleHelperFunction();
export { exampleCreateAndMint, exampleMintToExisting, exampleListNFTs, exampleHelperFunction };
