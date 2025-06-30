import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Video, ExternalLink, AlertCircle, CheckCircle, Play, Pause, Maximize2 } from 'lucide-react';
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
    
    setIsGenerating(true);
    setProgress(0);
    setElapsedTime(0);
    setStatus('Sending request to Tavus API...');
    setShowVideoPlayer(true); // Show player immediately
    setCurrentVideoUrl(null); // Reset video URL

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
      setStatus('');
      setShowVideoPlayer(false);
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

      {/* Video Player Popup - Shows below button when generating or video ready */}
      {showVideoPlayer && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
          {/* Video Player Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentVideoUrl ? 'Meditation Video Ready' : 'Generating Video...'}
              </span>
            </div>
            {currentVideoUrl && (
              <Button
                onClick={() => openVideoInNewTab(currentVideoUrl)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Open in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Video Player or Progress */}
          {currentVideoUrl ? (
            <div className="space-y-3">
              {/* Video Element */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  id="meditation-video"
                  src={currentVideoUrl}
                  className="w-full h-full"
                  controls
                  preload="metadata"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={toggleVideoPlayback}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isVideoPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isVideoPlaying ? 'Pause' : 'Play'}
                </Button>

                <Button
                  onClick={() => openVideoInNewTab(currentVideoUrl)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Maximize2 className="h-4 w-4" />
                  Fullscreen
                </Button>
              </div>

              {/* Video stays active notice */}
              <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Video link remains active indefinitely
              </div>
            </div>
          ) : (
            /* Progress Section */
            <div className="space-y-3">
              <div className="text-sm text-purple-700 dark:text-purple-300">
                {status}
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-purple-600 dark:text-purple-400 text-center">
                  {elapsedTime} min elapsed • Up to 90 min total
                </div>
              </div>
            </div>
          )}
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

      {/* Generated Videos History */}
      {generatedVideos.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Video className="h-4 w-4" />
            Previous Videos
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {generatedVideos.map((video, index) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {video.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {video.createdAt.toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  onClick={() => openVideoInNewTab(video.url)}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                  title="Open video in new tab"
                >
                  <ExternalLink className="h-3 w-3" />
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