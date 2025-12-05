import { LinerNotes, ArtistProfile, AlbumProfile, TrackList } from '../types.js';

export class LinerNotesAgent {
  async execute(
    artistProfile: ArtistProfile,
    albumProfile: AlbumProfile,
    trackList: TrackList
  ): Promise<LinerNotes> {
    const trackNotes: Record<string, string> = {};
    trackList.tracks.forEach(track => {
      trackNotes[track.title] = `A journey through ${albumProfile.themes[track.trackNo % albumProfile.themes.length]}.`;
    });

    return {
      intro: `Welcome to "${albumProfile.albumName}" by ${artistProfile.artistName}.`,
      artistStory: artistProfile.originStory,
      albumStory: albumProfile.albumConcept,
      trackNotes,
      thankYous: 'Special thanks to the AI generation pioneers.',
      credits: `All tracks AI-generated. Album concept by ${artistProfile.artistName}.`
    };
  }
}
