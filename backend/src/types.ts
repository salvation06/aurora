export interface TrackUpload {
  id: string;
  filePath: string;
  originalFileName: string;
  userTitle?: string;
}

export interface Track {
  id: string;
  filePath: string;
  title: string;
  durationSec: number;
  mediaType: 'audio' | 'video';
  trackNo: number;
}

export interface TrackList {
  tracks: Track[];
}

export interface ArtistProfile {
  artistName: string;
  personaSummary: string;
  visualIdentityTags: string[];
  tone: string;
  originStory: string;
}

export interface AlbumProfile {
  albumName: string;
  albumConcept: string;
  themes: string[];
  colorPalette: string[];
  coverArtDirection: string;
}

export interface LinerNotes {
  intro: string;
  artistStory: string;
  albumStory: string;
  trackNotes: Record<string, string>;
  thankYous: string;
  credits: string;
}

export interface CoverArtDesign {
  frontCoverPrompt: string;
  backCoverPrompt: string;
  artistPortraitPrompts: string[];
  frontCoverUrl?: string;
  backCoverUrl?: string;
  portraitUrls?: string[];
}

export interface PromoBeat {
  time: number;
  visual: string;
  text: string;
  audioNote: string;
}

export interface PromoStoryboard {
  lengthSec: number;
  beats: PromoBeat[];
}

export interface ContentFile {
  path: string;
  sourcePath: string;
}

export interface ContentBundle {
  bundleId: string;
  files: ContentFile[];
  volumeLabel: string;
}

export interface BurnResult {
  isoPath: string;
  isoStatus: 'SUCCESS' | 'FAILED';
  isoLog: string;
  isoSha256?: string;
}

export interface NFTResult {
  collectionId: number;
  itemId: number;
  metadataCid: string;
  owner: string;
  transactionHash: string;
  subscanUrl: string;
}

export interface JobState {
  jobId: string;
  state: 'PENDING' | 'RUNNING' | 'FAILED' | 'SUCCEEDED';
  progressMessage?: string;
  error?: string;
  outputs?: {
    artistProfile?: ArtistProfile;
    albumProfile?: AlbumProfile;
    trackList?: TrackList;
    linerNotes?: LinerNotes;
    coverArtDesign?: CoverArtDesign;
    promoStoryboard?: PromoStoryboard;
    contentBundle?: ContentBundle;
    burnResult?: BurnResult;
    nftResult?: NFTResult;
  };
}
