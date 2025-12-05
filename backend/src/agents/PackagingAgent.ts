import { ContentBundle, ArtistProfile, AlbumProfile, TrackList, LinerNotes, CoverArtDesign, PromoStoryboard } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export class PackagingAgent {
  async execute(
    artistProfile: ArtistProfile,
    albumProfile: AlbumProfile,
    trackList: TrackList,
    linerNotes: LinerNotes,
    coverArtDesign: CoverArtDesign,
    promoStoryboard: PromoStoryboard
  ): Promise<ContentBundle> {
    const files = [
      ...trackList.tracks.map(track => ({
        path: `audio/${String(track.trackNo).padStart(2, '0')}_${track.title.replace(/\s+/g, '_')}.${track.mediaType === 'audio' ? 'mp3' : 'mp4'}`,
        sourcePath: track.filePath
      })),
      {
        path: 'artwork/front_cover.jpg',
        sourcePath: coverArtDesign.frontCoverUrl || ''
      },
      {
        path: 'artwork/back_cover.jpg',
        sourcePath: coverArtDesign.backCoverUrl || ''
      },
      {
        path: 'liner_notes.pdf',
        sourcePath: '/tmp/liner_notes.pdf'
      },
      {
        path: 'promo_storyboard.json',
        sourcePath: '/tmp/promo_storyboard.json'
      }
    ];

    return {
      bundleId: uuidv4(),
      files,
      volumeLabel: `${artistProfile.artistName}_${albumProfile.albumName}`.replace(/\s+/g, '_').substring(0, 32)
    };
  }
}
