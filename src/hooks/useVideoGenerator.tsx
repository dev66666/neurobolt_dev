import { useState, useCallback } from 'react';

interface GeneratedVideo {
  id: string;
  url: string;
  name: string;
  createdAt: Date;
}

export const useVideoGenerator = () => {
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  const addGeneratedVideo = useCallback((video: GeneratedVideo) => {
    setGeneratedVideos(prev => [video, ...prev]);
  }, []);

  const clearVideos = useCallback(() => {
    setGeneratedVideos([]);
  }, []);

  const setAudioUrl = useCallback((url: string | null) => {
    setCurrentAudioUrl(url);
  }, []);

  return {
    generatedVideos,
    isGenerating,
    currentAudioUrl,
    setIsGenerating,
    addGeneratedVideo,
    clearVideos,
    setAudioUrl
  };
};