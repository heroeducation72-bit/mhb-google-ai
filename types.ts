export interface Platform {
  platform: string;
  followers: number;
}

export type VideoThumbnails = Record<string, string>;

export interface Creator {
  id: string;
  name: string;
  alias: string | null;
  bio: string | null;
  country: string;
  city: string;
  niche: string;
  platforms: Platform[];
  avatar_url: string | null;
  sample_videos: string[];
  voice_sample_url: string | null; // New field for audio/sound
  is_verified: boolean;
  created_at: string;
  video_thumbnails: VideoThumbnails;
}

export type CreatorFormData = Omit<Creator, 'id' | 'created_at' | 'video_thumbnails'> & {
  video_thumbnails: VideoThumbnails;
};
