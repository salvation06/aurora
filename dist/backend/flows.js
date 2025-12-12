import { MediaIngestionAgent } from './agents/MediaIngestionAgent.js';
import { ArtistPersonaAgent } from './agents/ArtistPersonaAgent.js';
import { AlbumIdentityAgent } from './agents/AlbumIdentityAgent.js';
import { LinerNotesAgent } from './agents/LinerNotesAgent.js';
import { CoverArtAgent } from './agents/CoverArtAgent.js';
import { PromoStoryboardAgent } from './agents/PromoStoryboardAgent.js';
import { PackagingAgent } from './agents/PackagingAgent.js';
import { CDWriterAgent } from './agents/CDWriterAgent.js';
export class FlowExecutor {
    jobs = new Map();
    async executeGenerateCDPackage(jobId, artistName, albumName, albumDescription, uploadedTracks, burnCD, driveId) {
        const job = {
            jobId,
            state: 'RUNNING',
            progressMessage: 'Starting job...',
            outputs: {}
        };
        this.jobs.set(jobId, job);
        try {
            // Step 1: Media Ingestion
            job.progressMessage = 'Ingesting media files...';
            const mediaAgent = new MediaIngestionAgent();
            const trackList = await mediaAgent.execute(uploadedTracks);
            job.outputs.trackList = trackList;
            // Step 2: Artist Persona
            job.progressMessage = 'Generating artist persona...';
            const artistAgent = new ArtistPersonaAgent();
            const artistProfile = await artistAgent.execute(artistName, albumDescription);
            job.outputs.artistProfile = artistProfile;
            // Step 3: Album Identity
            job.progressMessage = 'Creating album identity...';
            const albumAgent = new AlbumIdentityAgent();
            const albumProfile = await albumAgent.execute(albumName, albumDescription, artistProfile);
            job.outputs.albumProfile = albumProfile;
            // Step 4: Liner Notes
            job.progressMessage = 'Writing liner notes...';
            const linerAgent = new LinerNotesAgent();
            const linerNotes = await linerAgent.execute(artistProfile, albumProfile, trackList);
            job.outputs.linerNotes = linerNotes;
            // Step 5: Cover Art
            job.progressMessage = 'Designing cover art...';
            const coverAgent = new CoverArtAgent();
            const coverArtDesign = await coverAgent.execute(artistProfile, albumProfile);
            job.outputs.coverArtDesign = coverArtDesign;
            // Step 6: Promo Storyboard
            job.progressMessage = 'Creating promo storyboard...';
            const promoAgent = new PromoStoryboardAgent();
            const promoStoryboard = await promoAgent.execute(artistProfile, albumProfile, trackList);
            job.outputs.promoStoryboard = promoStoryboard;
            // Step 7: Packaging
            job.progressMessage = 'Packaging content bundle...';
            const packagingAgent = new PackagingAgent();
            const contentBundle = await packagingAgent.execute(artistProfile, albumProfile, trackList, linerNotes, coverArtDesign, promoStoryboard);
            job.outputs.contentBundle = contentBundle;
            // Step 8: ISO Creation (if requested)
            if (burnCD) {
                job.progressMessage = 'Creating ISO file...';
                const cdAgent = new CDWriterAgent();
                const burnResult = await cdAgent.execute(contentBundle);
                job.outputs.burnResult = burnResult;
                // Step 9: NFT Minting (if ISO was created successfully)
                if (burnResult.isoSha256) {
                    job.progressMessage = 'Minting Album NFT...';
                    const { NFTMinterAgent } = await import('./agents/NFTMinterAgent.js');
                    const nftAgent = new NFTMinterAgent();
                    const nftResult = await nftAgent.execute(artistName, albumName, burnResult.isoSha256, undefined, // collectionId - will create new collection if not provided
                    albumDescription // pass album description to NFT metadata
                    );
                    job.outputs.nftResult = nftResult;
                }
            }
            job.state = 'SUCCEEDED';
            job.progressMessage = 'Job completed successfully!';
        }
        catch (error) {
            job.state = 'FAILED';
            job.error = error instanceof Error ? error.message : 'Unknown error';
        }
        this.jobs.set(jobId, job);
    }
    getJobStatus(jobId) {
        return this.jobs.get(jobId);
    }
}
