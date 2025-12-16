import React, { useState, useEffect, useRef } from 'react';
import { Creator, CreatorFormData, VideoThumbnails } from '../types';
import { X, Plus, Trash2, Mic, Upload, Image as ImageIcon, Film, Link as LinkIcon, Loader2, Play, Camera } from 'lucide-react';

interface CreatorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatorFormData) => void;
  initialData?: Creator;
}

const DEFAULT_FORM: CreatorFormData = {
  name: '',
  alias: '',
  bio: '',
  country: 'Algeria',
  city: 'Algiers',
  niche: 'Lifestyle',
  platforms: [{ platform: 'Instagram', followers: 0 }],
  avatar_url: '',
  sample_videos: [],
  voice_sample_url: '',
  is_verified: false,
  video_thumbnails: {},
};

// Internal component for selecting a frame
const VideoFrameSelector: React.FC<{
  videoUrl: string;
  onCapture: (base64: string) => void;
  onCancel: () => void;
}> = ({ videoUrl, onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onCapture(dataUrl);
        } catch (e) {
          console.error(e);
          alert("Cannot capture frame from this video due to browser security restrictions (CORS). Please upload an image file instead.");
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in">
       <div className="w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
             <h3 className="text-white font-bold flex items-center gap-2">
               <Camera size={18} className="text-primary-500" /> Capture Thumbnail
             </h3>
             <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
          </div>
          <div className="flex-grow bg-black relative flex items-center justify-center overflow-hidden">
             <video 
               ref={videoRef}
               src={videoUrl}
               className="max-h-[60vh] w-auto max-w-full"
               controls
               crossOrigin="anonymous"
               playsInline
             />
             <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
             <p className="text-sm text-slate-400">
               Play the video, pause at the desired frame, and click Capture.
             </p>
             <div className="flex gap-3 w-full sm:w-auto">
               <button onClick={onCancel} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                 Cancel
               </button>
               <button onClick={handleCapture} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2">
                 <Camera size={16} /> Capture Frame
               </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export const CreatorFormModal: React.FC<CreatorFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState<CreatorFormData>(DEFAULT_FORM);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoInputType, setVideoInputType] = useState<'url' | 'file'>('url');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs for file inputs
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  
  // State for thumbnail workflows
  const [activeVideoForUpload, setActiveVideoForUpload] = useState<string | null>(null);
  const [activeVideoForCapture, setActiveVideoForCapture] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const { id, created_at, ...rest } = initialData;
      setFormData(rest);
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [initialData, isOpen]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setVideoUrlInput('');
      setVideoInputType('url');
      setIsProcessing(false);
      setActiveVideoForCapture(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePlatformChange = (index: number, field: 'platform' | 'followers', value: string | number) => {
    const newPlatforms = [...formData.platforms];
    newPlatforms[index] = { ...newPlatforms[index], [field]: value };
    setFormData({ ...formData, platforms: newPlatforms });
  };

  const addPlatform = () => {
    setFormData({
      ...formData,
      platforms: [...formData.platforms, { platform: 'Instagram', followers: 0 }]
    });
  };

  const removePlatform = (index: number) => {
    setFormData({
      ...formData,
      platforms: formData.platforms.filter((_, i) => i !== index)
    });
  };

  const addVideoUrl = () => {
    if (videoUrlInput) {
      setFormData({
        ...formData,
        sample_videos: [videoUrlInput, ...formData.sample_videos]
      });
      setVideoUrlInput('');
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (limit to ~10MB for browser storage safety in this demo)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large for this demo (Max 10MB). Please use a URL or a smaller file.");
      return;
    }

    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      setFormData({
        ...formData,
        sample_videos: [base64, ...formData.sample_videos]
      });
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to upload video.");
    } finally {
      setIsProcessing(false);
      if (videoFileRef.current) videoFileRef.current.value = '';
    }
  };

  // Handler for uploading an image file as thumbnail
  const handleThumbnailFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeVideoForUpload) return;

    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      setFormData({
        ...formData,
        video_thumbnails: {
          ...formData.video_thumbnails,
          [activeVideoForUpload]: base64
        }
      });
    } catch (error) {
      console.error("Error reading thumbnail:", error);
    } finally {
      setIsProcessing(false);
      setActiveVideoForUpload(null);
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
    }
  };

  // Handler for capturing frame from video
  const handleThumbnailCapture = (base64Image: string) => {
    if (activeVideoForCapture) {
      setFormData({
        ...formData,
        video_thumbnails: {
          ...formData.video_thumbnails,
          [activeVideoForCapture]: base64Image
        }
      });
    }
    setActiveVideoForCapture(null);
  };

  const triggerUploadThumbnail = (videoUrl: string) => {
    setActiveVideoForUpload(videoUrl);
    setTimeout(() => thumbnailFileRef.current?.click(), 0);
  };

  const removeVideo = (index: number) => {
    const videoToRemove = formData.sample_videos[index];
    const newVideos = formData.sample_videos.filter((_, i) => i !== index);
    
    // Clean up thumbnail if exists
    const newThumbnails = { ...formData.video_thumbnails };
    delete newThumbnails[videoToRemove];

    setFormData({
      ...formData,
      sample_videos: newVideos,
      video_thumbnails: newThumbnails
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Edit Creator' : 'Add New Creator'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Sara Ahmed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Alias (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                  value={formData.alias || ''}
                  onChange={e => setFormData({...formData, alias: e.target.value})}
                  placeholder="e.g. SARA.A"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Country</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">City</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Niche</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  value={formData.niche}
                  onChange={e => setFormData({...formData, niche: e.target.value})}
                >
                  <option>Lifestyle</option>
                  <option>Education</option>
                  <option>Beauty & Cosmetics</option>
                  <option>Home & Decor</option>
                  <option>Tech</option>
                  <option>Food</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Bio</label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all min-h-[100px] placeholder-slate-600"
                value={formData.bio || ''}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about the creator..."
              />
            </div>

            {/* Hidden Inputs for File Uploads */}
            <input 
              type="file" 
              ref={videoFileRef} 
              className="hidden" 
              accept="video/*" 
              onChange={handleVideoFileUpload}
            />
            <input 
              type="file" 
              ref={thumbnailFileRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleThumbnailFileUpload}
            />

            {/* Videos Section */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Film size={16} className="text-primary-500" />
                  Videos & Thumbnails
                </label>
                
                {/* Toggle Upload Type */}
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setVideoInputType('url')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${videoInputType === 'url' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <LinkIcon size={12} className="inline mr-1" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoInputType('file')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${videoInputType === 'file' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Upload size={12} className="inline mr-1" /> Upload
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                {videoInputType === 'url' ? (
                  <>
                    <input
                      type="text"
                      className="flex-grow px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-primary-500 outline-none"
                      value={videoUrlInput}
                      onChange={e => setVideoUrlInput(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                    />
                    <button 
                      type="button" 
                      onClick={addVideoUrl}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
                    >
                      Add
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoFileRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-800 rounded-xl hover:border-primary-500 hover:bg-slate-950/50 transition-all text-slate-400"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> Processing Video...
                      </>
                    ) : (
                      <>
                        <Upload size={20} /> Click to Upload Video File
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Video List */}
              <div className="space-y-3">
                {formData.sample_videos.map((vid, idx) => {
                  const isDataUrl = vid.startsWith('data:');
                  const thumbnail = formData.video_thumbnails[vid];

                  return (
                    <div key={idx} className="flex flex-col gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-800 relative overflow-hidden group">
                            {thumbnail ? (
                              <img src={thumbnail} alt="Thumb" className="w-full h-full object-cover" />
                            ) : (
                              <Film size={20} className="text-slate-600" />
                            )}
                            {/* Overlay for quick action */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                <button type="button" onClick={() => setActiveVideoForCapture(vid)} title="Capture from Video" className="text-white hover:text-primary-500">
                                  <Camera size={14} />
                                </button>
                                <button type="button" onClick={() => triggerUploadThumbnail(vid)} title="Upload Image" className="text-white hover:text-primary-500">
                                  <Upload size={14} />
                                </button>
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-xs text-slate-300 font-medium max-w-[150px] md:max-w-[250px]">
                              {isDataUrl ? `Uploaded Video ${idx + 1}` : vid}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              {thumbnail ? (
                                <span className="text-green-500 flex items-center gap-0.5"><ImageIcon size={10} /> Cover set</span>
                              ) : (
                                'No cover image'
                              )}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Capture Button */}
                          <button 
                            type="button" 
                            onClick={() => setActiveVideoForCapture(vid)}
                            className="p-2 text-xs text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition-colors flex items-center gap-1.5"
                            title="Capture Frame"
                          >
                            <Camera size={14} /> <span className="hidden sm:inline">Capture</span>
                          </button>
                          
                          {/* Upload Button */}
                          <button 
                            type="button" 
                            onClick={() => triggerUploadThumbnail(vid)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Upload Cover Image"
                          >
                            <ImageIcon size={16} />
                          </button>

                          {/* Remove Button */}
                          <button type="button" onClick={() => removeVideo(idx)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voice Sample */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Mic size={16} className="text-primary-500" />
                  Voice/Sound Sample URL
              </label>
              <input
                type="url"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                value={formData.voice_sample_url || ''}
                onChange={e => setFormData({...formData, voice_sample_url: e.target.value})}
                placeholder="https://example.com/sound.mp3"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_verified"
                className="rounded text-primary-500 bg-slate-950 border-slate-700 focus:ring-primary-500 w-4 h-4"
                checked={formData.is_verified}
                onChange={e => setFormData({...formData, is_verified: e.target.checked})}
              />
              <label htmlFor="is_verified" className="text-sm text-slate-300">Mark as Verified Creator</label>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : (initialData ? 'Save Changes' : 'Create Creator')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Video Frame Selector Overlay */}
      {activeVideoForCapture && (
        <VideoFrameSelector 
          videoUrl={activeVideoForCapture}
          onCapture={handleThumbnailCapture}
          onCancel={() => setActiveVideoForCapture(null)}
        />
      )}
    </>
  );
};
