import React, { useState, useRef } from 'react';
import { Creator } from '../types';
import { MapPin, Instagram, Music2, Play, Pause, Mic, Volume2 } from 'lucide-react';

interface CreatorCardProps {
  creator: Creator;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fallback avatar
  const avatarUrl = creator.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=ff5f33&color=fff`;
  
  // Use first video as background or thumbnail if available
  const videoUrl = creator.sample_videos && creator.sample_videos.length > 0 ? creator.sample_videos[0] : null;
  
  // Get specific thumbnail for this video if it exists
  const thumbnailPoster = videoUrl && creator.video_thumbnails ? creator.video_thumbnails[videoUrl] : undefined;

  const toggleSound = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlayingSound) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingSound(!isPlayingSound);
    }
  };

  return (
    <div className="group relative bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 hover:border-primary-500/50 hover:shadow-primary-500/10 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      {/* Audio Element */}
      {creator.voice_sample_url && (
        <audio 
          ref={audioRef} 
          src={creator.voice_sample_url} 
          onEnded={() => setIsPlayingSound(false)} 
        />
      )}

      {/* Media Header */}
      <div className="relative aspect-[9/16] bg-slate-950 overflow-hidden">
        {videoUrl ? (
          <video 
            src={videoUrl}
            poster={thumbnailPoster}
            className={`w-full h-full object-cover transition-all duration-700 ${thumbnailPoster ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'} group-hover:scale-105`}
            muted
            loop
            playsInline
            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center">
               <Music2 size={24} />
            </div>
            <span className="text-xs font-medium">No Video</span>
          </div>
        )}
        
        {/* Overlay Gradient (slightly stronger if no poster to ensure text contrast) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/90 pointer-events-none" />

        {/* Play Icon Hint (Video) - Only show if not playing sound */}
        {!isPlayingSound && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
              <Play className="w-8 h-8 text-white fill-current" />
            </div>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-slate-950/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm">
            {creator.niche}
          </span>
          {creator.is_verified && (
             <span className="bg-blue-500/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm flex items-center gap-1">
               Verified
             </span>
          )}
        </div>
        
        {/* Sound Toggle Button */}
        {creator.voice_sample_url && (
          <button 
            onClick={toggleSound}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-20 ${
              isPlayingSound 
                ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(255,95,51,0.5)]' 
                : 'bg-black/40 text-white hover:bg-primary-500 hover:text-white border border-white/10'
            }`}
            title="Play Voice Sample"
          >
             {isPlayingSound ? <Volume2 size={16} className="animate-pulse" /> : <Mic size={16} />}
          </button>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex flex-col flex-grow relative bg-slate-900 -mt-6 rounded-t-2xl z-10 border-t border-white/5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
             <img 
              src={avatarUrl} 
              alt={creator.name} 
              className="w-12 h-12 rounded-full border-2 border-slate-800 shadow-md object-cover bg-slate-800"
            />
            <div>
              <h3 className="font-bold text-slate-100 leading-tight text-lg">{creator.name}</h3>
              {creator.alias && <p className="text-xs text-primary-400 font-medium">@{creator.alias}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center text-xs text-slate-400 mb-4 gap-1 ml-1">
          <MapPin size={14} className="text-primary-500" />
          {creator.city}, {creator.country}
        </div>

        <p className="text-sm text-slate-300 line-clamp-2 mb-5 flex-grow font-light leading-relaxed">
          {creator.bio || "No bio provided."}
        </p>

        {/* Platforms */}
        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-800">
          {creator.platforms.map((p, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 rounded-lg text-xs font-medium text-slate-300 border border-slate-700/50">
              {p.platform.toLowerCase().includes('instagram') ? (
                <Instagram size={12} className="text-pink-500" />
              ) : p.platform.toLowerCase().includes('tiktok') ? (
                <Music2 size={12} className="text-white" />
              ) : (
                <span className="w-3 h-3 bg-slate-400 rounded-full" />
              )}
              {p.followers > 1000 ? `${(p.followers / 1000).toFixed(1)}k` : p.followers}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
