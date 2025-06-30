import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Video, ExternalLink, AlertCircle, CheckCircle, Play, Pause, Maximize2, X } from 'lucide-react';
import { toast } from 'sonner';

const TAVUS_API_KEY = '865e9baf7257454898dd07cdf0243282';
const REPLICA_ID = 'rca8a38779a8';

interface VideoGeneratorProps {
  latestAIResponse?: string | null;
  disabled?: boolean;
}

interface GeneratedVideo {
  id: string;
  url: string;
  name: string;
  createdAt: Date;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ 
  latestAIResponse, 
  disabled = false 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Calculate if button should be disabled
  const isButtonDisabled = disabled || !latestAIResponse || isGenerating;

  const handleGenerateVideo = async () => {
    if (!latestAIResponse) {
      toast.error('No AI response available to generate video. Please get an AI response first.');
      return;
    }

    console.log('Starting video generation with script:', latestAIResponse.substring(0, 100) + '...');
    
    // IMMEDIATELY show the popup player when button is clicked
    setShowVideoPlayer(true);
    setIsGenerating(true);
    setProgress(0);
    setElapsedTime(0);
    setCurrentVideoUrl(null);
    setStatus('Initializing video generation...');

    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      setStatus('Sending script to Tavus API...');

      const response = await fetch('https://tavusapi.com/v2/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY
        },
        body: JSON.stringify({
          replica_id: REPLICA_ID,
          script: latestAIResponse,
          video_name: `Meditation_${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Tavus API error:', response.status, errorData);
        
        // Handle specific error cases
        if (response.status === 400) {
          if (errorData.includes('script')) {
            throw new Error('Script content not accepted by Tavus. Please try a different meditation script.');
          } else if (errorData.includes('replica_id')) {
            throw new Error('Invalid replica ID. Please check the configuration.');
          }
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check the Tavus API configuration.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Tavus API response:', data);

      if (data.video_id) {
        setStatus('🎥 Video generation started! This may take 5–90 minutes...');
        toast.success('Video generation started! Check back in a few minutes.');
        pollVideoStatus(data.video_id);
      } else {
        throw new Error('No video ID returned from Tavus API');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      
      // Provide helpful error messages
      if (error.message.includes('script')) {
        toast.error('Script content issue. Please try generating a different meditation script.');
      } else if (error.message.includes('CORS')) {
        toast.error('Network error: Unable to connect to video generation service.');
      } else {
        toast.error(`Video generation failed: ${error.message}`);
      }
      
      setIsGenerating(false);
      setStatus('Generation failed. Please try again.');
      // Keep popup open to show error
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const startTime = Date.now();
    const maxDuration = 90 * 60 * 1000; // 90 minutes
    const pollInterval = 15000; // 15 seconds

    const poll = async () => {
      try {
        const elapsed = Date.now() - startTime;
        const progressPercentage = Math.min((elapsed / maxDuration) * 100, 100);
        const elapsedMinutes = Math.floor(elapsed / 60000);
        
        setProgress(progressPercentage);
        setElapsedTime(elapsedMinutes);

        const response = await fetch(`https://tavusapi.com/v2/videos/${videoId}`, {
          headers: { 'x-api-key': TAVUS_API_KEY }
        });

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Video status:', data.status);

        if (data.status === 'completed' && data.hosted_url) {
          setStatus('✅ Video generation completed!');
          setCurrentVideoUrl(data.hosted_url);
          
          // Add to generated videos list
          const newVideo: GeneratedVideo = {
            id: videoId,
            url: data.hosted_url,
            name: `Meditation Video ${generatedVideos.length + 1}`,
            createdAt: new Date()
          };
          setGeneratedVideos(prev => [newVideo, ...prev]);
          
          setIsGenerating(false);
          toast.success('🎬 Your meditation video is ready!');
          return;
        } else if (data.status === 'failed') {
          setStatus('❌ Video generation failed');
          setIsGenerating(false);
          toast.error('Video generation failed. Please try again.');
          return;
        } else {
          // Update status based on current state
          const statusMessages = {
            'queued': '⏳ Video queued for processing...',
            'processing': '🎬 Video is being processed...',
            'rendering': '🎨 Video is being rendered...',
            'uploading': '📤 Video is being uploaded...'
          };
          setStatus(statusMessages[data.status] || `🎥 Video status: ${data.status}`);
        }

        // Continue polling if within time limit
        if (elapsed < maxDuration) {
          setTimeout(poll, pollInterval);
        } else {
          setStatus('⚠️ Video generation timed out. Please try again.');
          setIsGenerating(false);
          toast.error('Video generation timed out after 90 minutes.');
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        setStatus('❌ Error checking video status');
        setIsGenerating(false);
        toast.error('Error checking video status. Please try again.');
      }
    };

    poll();
  };

  const openVideoInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleVideoPlayback = () => {
    const video = document.getElementById('meditation-video') as HTMLVideoElement;
    if (video) {
      if (isVideoPlaying) {
        video.pause();
        setIsVideoPlaying(false);
      } else {
        video.play();
        setIsVideoPlaying(true);
      }
    }
  };

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setIsGenerating(false);
    setCurrentVideoUrl(null);
    setStatus('');
    setProgress(0);
    setElapsedTime(0);
  };

  return (
    <div className="space-y-3">
      {/* Generate Video Button */}
      <Button
        onClick={handleGenerateVideo}
        disabled={isButtonDisabled}
        variant="outline"
        size="sm"
        className={`w-full flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 ${
          isGenerating ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' : ''
        } ${
          !isButtonDisabled ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700' : ''
        }`}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Video className="h-4 w-4" />
        )}
        <span>{isGenerating ? 'Generating...' : 'Generate Video'}</span>
      </Button>

      {/* Small YouTube-style Video Player Popup (3x3 inches equivalent) */}
      {showVideoPlayer && (
        <div className="bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-lg shadow-xl overflow-hidden" 
             style={{ width: '240px', minHeight: '180px' }}>
          
          {/* Player Header */}
          <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2">
              <Video className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                {currentVideoUrl ? 'Video Ready' : 'Generating...'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {currentVideoUrl && (
                <Button
                  onClick={() => openVideoInNewTab(currentVideoUrl)}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-purple-200 dark:hover:bg-purple-800"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                </Button>
              )}
              <Button
                onClick={closeVideoPlayer}
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-red-200 dark:hover:bg-red-800"
                title="Close player"
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>

          {/* Video Player Area */}
          <div className="p-2">
            {currentVideoUrl ? (
              <div className="space-y-2">
                {/* Video Element - Small YouTube-style */}
                <div className="relative bg-black rounded overflow-hidden" style={{ aspectRatio: '16/9', height: '120px' }}>
                  <video
                    id="meditation-video"
                    src={currentVideoUrl}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onEnded={() => setIsVideoPlaying(false)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Mini Controls */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={toggleVideoPlayback}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    {isVideoPlaying ? (
                      <Pause className="h-2.5 w-2.5 mr-1" />
                    ) : (
                      <Play className="h-2.5 w-2.5 mr-1" />
                    )}
                    {isVideoPlaying ? 'Pause' : 'Play'}
                  </Button>

                  <Button
                    onClick={() => openVideoInNewTab(currentVideoUrl)}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Maximize2 className="h-2.5 w-2.5 mr-1" />
                    Full
                  </Button>
                </div>

                {/* Active status */}
                <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-1 rounded text-center">
                  <CheckCircle className="h-2.5 w-2.5 inline mr-1" />
                  Link stays active
                </div>
              </div>
            ) : (
              /* Progress Section - Compact */
              <div className="space-y-2">
                <div className="text-xs text-purple-700 dark:text-purple-300 text-center">
                  {status}
                </div>
                <div className="space-y-1">
                  <Progress value={progress} className="h-1.5" />
                  <div className="text-xs text-purple-600 dark:text-purple-400 text-center">
                    {elapsedTime}min • up to 90min
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instruction when no AI response */}
      {!latestAIResponse && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
          <AlertCircle className="h-3 w-3" />
          Get an AI response first to generate video
        </div>
      )}

      {/* AI response ready indicator */}
      {latestAIResponse && !showVideoPlayer && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
          <CheckCircle className="h-3 w-3" />
          AI script ready for video generation
        </div>
      )}

      {/* Generated Videos History - Compact */}
      {generatedVideos.length > 0 && !showVideoPlayer && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Video className="h-4 w-4" />
            Previous Videos ({generatedVideos.length})
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {generatedVideos.slice(0, 3).map((video, index) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    Video {generatedVideos.length - index}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {video.createdAt.toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  onClick={() => openVideoInNewTab(video.url)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                  title="Open video"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;