import { CoverArtDesign, ArtistProfile, AlbumProfile } from '../types.js';

export class CoverArtAgent {
  async execute(
    artistProfile: ArtistProfile,
    albumProfile: AlbumProfile
  ): Promise<CoverArtDesign> {
    const baseStyle = `${artistProfile.visualIdentityTags.join(', ')}, ${albumProfile.colorPalette.join(' and ')} color scheme`;
    
    const frontCoverPrompt = `Album cover for "${albumProfile.albumName}" by ${artistProfile.artistName}. ${baseStyle}. ${albumProfile.coverArtDirection}. Professional album art, square format, high quality.`;
    const backCoverPrompt = `Back cover with track listing for "${albumProfile.albumName}". Minimalist design, ${baseStyle}. Professional album art.`;
    
    // Generate actual images using Pollinations AI (free, no API key needed)
    const frontCoverUrl = await this.generateImage(frontCoverPrompt);
    const backCoverUrl = await this.generateImage(backCoverPrompt);
    
    const artistPortraitPrompts = [
      `Portrait of ${artistProfile.artistName}, ${artistProfile.tone} lighting, ${baseStyle}`,
      `${artistProfile.artistName} in a futuristic studio, ${baseStyle}`
    ];
    
    const portraitUrls = await Promise.all(
      artistPortraitPrompts.map(prompt => this.generateImage(prompt))
    );
    
    return {
      frontCoverPrompt,
      backCoverPrompt,
      artistPortraitPrompts,
      frontCoverUrl,
      backCoverUrl,
      portraitUrls
    };
  }

  private async generateImage(prompt: string): Promise<string> {
    // Using Pollinations AI - free image generation API
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&seed=${seed}&nologo=true&enhance=true`;
    
    console.log('Generating image with prompt:', prompt);
    console.log('Image URL:', url);
    
    return url;
  }
}
