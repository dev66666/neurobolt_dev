import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Video, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TAVUS_API_KEY = '865e9baf7257454898dd07cdf0243282';
const REPLICA_ID = 'rca8a38779a8';

interface VideoGeneratorProps {
  audioUrl?: string;
  disabled?: boolean;
}

interface GeneratedVideo {
  id: string;
  url: string;
  name: string;
  createdAt: Date;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ 
  audioUrl, 
  disabled = false 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleGenerateVideo = async () => {
    if (!audioUrl) {
      toast.error('No audio available to generate video');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setElapsedTime(0);
    setStatus('Initializing video generation...');

    try {
      console.log('Starting video generation with audio URL:', audioUrl);
      
      const response = await fetch('https://tavusapi.com/v2/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY
        },
        body: JSON.stringify({
          replica_id: REPLICA_ID,
          audio_url: audioUrl,
          video_name: `Generated_${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Tavus API error:', response.status, errorData);
        throw new Error(`Tavus API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Tavus API response:', data);

      if (data.video_id) {
        setStatus('🎥 Video is under generation and may take 5–90 minutes depending on Tavus');
        toast.success('Video generation started!');
        pollVideoStatus(data.video_id);
      } else {
        throw new Error('No video ID returned from Tavus API');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error(`Failed to start video generation: ${error.message}`);
      setIsGenerating(false);
      setStatus('');
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
            name: `Video ${generatedVideos.length + 1}`,
            createdAt: new Date()
          };
          setGeneratedVideos(prev => [newVideo, ...prev]);
          
          setIsGenerating(false);
          setShowVideoDialog(true);
          toast.success('Video is ready!');
          return;
        } else if (data.status === 'failed') {
          setStatus('❌ Video generation failed');
          setIsGenerating(false);
          toast.error('Video generation failed');
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
          setStatus('⚠️ Video not generated from Tavus. Please try again later.');
          setIsGenerating(false);
          toast.error('Video generation timed out');
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        setStatus('❌ Error checking video status');
        setIsGenerating(false);
        toast.error('Error checking video status');
      }
    };

    poll();
  };

  const openVideoInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      {/* Generate Video Button */}
      <Button
        onClick={handleGenerateVideo}
        disabled={disabled || !audioUrl || isGenerating}
        variant="outline"
        size="sm"
        className={`w-full flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 ${
          isGenerating ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' : ''
        }`}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Video className="h-4 w-4" />
        )}
        <span>{isGenerating ? 'Generating...' : 'Generate Video'}</span>
      </Button>

      {/* Status and Progress */}
      {isGenerating && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
          <div className="text-xs text-purple-700 dark:text-purple-300 mb-2">
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

      {/* Status message when not generating */}
      {!isGenerating && status && (
        <div className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
          {status}
        </div>
      )}

      {/* Generated Videos Section */}
      {generatedVideos.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Video className="h-4 w-4" />
            📽️ Generated Videos
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

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>🎬 Your Video is Ready!</DialogTitle>
            <DialogDescription>
              Your meditation video has been successfully generated.
            </DialogDescription>
          </DialogHeader>
          {currentVideoUrl && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={currentVideoUrl}
                  controls
                  className="w-full h-full"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => openVideoInNewTab(currentVideoUrl)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button
                  onClick={() => setShowVideoDialog(false)}
                  variant="default"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoGenerator;