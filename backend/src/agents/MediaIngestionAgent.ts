import { TrackUpload, TrackList, Track } from '../types.js';

export class MediaIngestionAgent {
  async execute(uploadedTracks: TrackUpload[]): Promise<TrackList> {
    const tracks: Track[] = uploadedTracks.map((upload, index) => ({
      id: upload.id,
      filePath: upload.filePath,
      title: upload.userTitle || `Track ${index + 1}`,
      durationSec: Math.floor(Math.random() * 240) + 120, // Mock: 2-6 min
      mediaType: upload.originalFileName.match(/\.(mp3|wav|flac|m4a)$/i) ? 'audio' : 'video',
      trackNo: index + 1
    }));

    return { tracks };
  }
}
