import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export const useBackgroundMusic = () => {
  const [musicName, setMusicName] = useState<string | undefined>(undefined);
  const [musicVolume, setMusicVolume] = useState<number>(0.3);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Load saved volume from localStorage on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem('backgroundMusicVolume');
    if (savedVolume) {
      const volume = parseFloat(savedVolume);
      setMusicVolume(volume);
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.volume = volume;
      }
    }
  }, []);

  const handleMusicUpload = (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Audio file size must be less than 50MB');
        return;
      }

      // Clean up previous audio
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        if (backgroundMusicRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(backgroundMusicRef.current.src);
        }
      }

      // Create new audio element
      const audioBlob = new Blob([file], { type: file.type });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.loop = true;
      audio.volume = musicVolume;
      
      // Add error handling
      audio.onerror = () => {
        toast.error('Failed to load audio file');
        URL.revokeObjectURL(audioUrl);
      };

      audio.onloadeddata = () => {
        console.log('Background music loaded successfully:', file.name);
      };
      
      backgroundMusicRef.current = audio;
      setMusicName(file.name);
      
      toast.success('Background music uploaded successfully');
    } catch (error) {
      console.error('Error uploading background music:', error);
      toast.error('Failed to upload background music');
    }
  };

  const handleVolumeChange = (volume: number) => {
    setMusicVolume(volume);
    localStorage.setItem('backgroundMusicVolume', volume.toString());
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = volume;
    }
  };

  const handleRemoveMusic = () => {
    try {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        if (backgroundMusicRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(backgroundMusicRef.current.src);
        }
        backgroundMusicRef.current = null;
      }
      
      setMusicName(undefined);
      toast.success('Background music removed');
    } catch (error) {
      console.error('Error removing background music:', error);
      toast.error('Failed to remove background music');
    }
  };

  const playBackgroundMusic = async () => {
    if (backgroundMusicRef.current && musicName) {
      try {
        await backgroundMusicRef.current.play();
        console.log('Background music started playing');
      } catch (error) {
        console.error('Error playing background music:', error);
      }
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      console.log('Background music stopped');
    }
  };

  const pauseBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      console.log('Background music paused');
    }
  };

  const resumeBackgroundMusic = async () => {
    if (backgroundMusicRef.current && musicName) {
      try {
        await backgroundMusicRef.current.play();
        console.log('Background music resumed');
      } catch (error) {
        console.error('Error resuming background music:', error);
      }
    }
  };

  return {
    musicName,
    musicVolume,
    handleMusicUpload,
    handleRemoveMusic,
    handleVolumeChange,
    playBackgroundMusic,
    stopBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic
  };
};