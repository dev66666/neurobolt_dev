import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

const DEFAULT_MUSIC_URL = 'https://obgbnrasiyozdnmoixxx.supabase.co/storage/v1/object/public/music//piano.mp3';
const DEFAULT_MUSIC_NAME = 'Default Piano Music';

export const useBackgroundMusic = () => {
  const [musicName, setMusicName] = useState<string | undefined>(DEFAULT_MUSIC_NAME);
  const [musicVolume, setMusicVolume] = useState<number>(0.3);
  const [isCustomMusic, setIsCustomMusic] = useState<boolean>(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Load saved volume from localStorage on mount
  useEffect(() => {
    const savedVolume = localStorage.getItem('backgroundMusicVolume');
    if (savedVolume) {
      const volume = parseFloat(savedVolume);
      setMusicVolume(volume);
    }
    
    // Initialize default piano music
    initializeDefaultMusic();
  }, []);

  const initializeDefaultMusic = async () => {
    try {
      console.log('Initializing default piano music...');
      
      // Create audio element for default music
      const audio = new Audio(DEFAULT_MUSIC_URL);
      audio.loop = true;
      audio.volume = musicVolume;
      
      // Add error handling for default music
      audio.onerror = (error) => {
        console.warn('Default piano music failed to load:', error);
        // Don't show error toast for default music failure
        setMusicName(undefined);
      };

      audio.onloadeddata = () => {
        console.log('Default piano music loaded successfully');
      };

      // Test if the audio can be loaded
      audio.oncanplaythrough = () => {
        console.log('Default piano music is ready to play');
      };
      
      backgroundMusicRef.current = audio;
      setMusicName(DEFAULT_MUSIC_NAME);
      setIsCustomMusic(false);
      
    } catch (error) {
      console.warn('Error initializing default music:', error);
      setMusicName(undefined);
    }
  };

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

      // Create new audio element for custom music
      const audioBlob = new Blob([file], { type: file.type });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.loop = true;
      audio.volume = musicVolume;
      
      // Add error handling
      audio.onerror = () => {
        toast.error('Failed to load audio file');
        URL.revokeObjectURL(audioUrl);
        // Revert to default music on error
        initializeDefaultMusic();
      };

      audio.onloadeddata = () => {
        console.log('Custom background music loaded successfully:', file.name);
      };
      
      backgroundMusicRef.current = audio;
      setMusicName(file.name);
      setIsCustomMusic(true);
      
      toast.success('Background music uploaded successfully');
    } catch (error) {
      console.error('Error uploading background music:', error);
      toast.error('Failed to upload background music');
      // Revert to default music on error
      initializeDefaultMusic();
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
      }
      
      // Reset to default piano music instead of removing completely
      initializeDefaultMusic();
      toast.success('Reset to default piano music');
    } catch (error) {
      console.error('Error removing background music:', error);
      toast.error('Failed to remove background music');
    }
  };

  const playBackgroundMusic = async () => {
    if (backgroundMusicRef.current && musicName) {
      try {
        await backgroundMusicRef.current.play();
        console.log(`Background music started playing: ${isCustomMusic ? 'Custom' : 'Default'} - ${musicName}`);
      } catch (error) {
        console.error('Error playing background music:', error);
        // If default music fails, try to reinitialize
        if (!isCustomMusic) {
          console.log('Attempting to reinitialize default music...');
          initializeDefaultMusic();
        }
      }
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      console.log(`Background music stopped: ${isCustomMusic ? 'Custom' : 'Default'} - ${musicName}`);
    }
  };

  const pauseBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      console.log(`Background music paused: ${isCustomMusic ? 'Custom' : 'Default'} - ${musicName}`);
    }
  };

  const resumeBackgroundMusic = async () => {
    if (backgroundMusicRef.current && musicName) {
      try {
        await backgroundMusicRef.current.play();
        console.log(`Background music resumed: ${isCustomMusic ? 'Custom' : 'Default'} - ${musicName}`);
      } catch (error) {
        console.error('Error resuming background music:', error);
      }
    }
  };

  return {
    musicName,
    musicVolume,
    isCustomMusic,
    handleMusicUpload,
    handleRemoveMusic,
    handleVolumeChange,
    playBackgroundMusic,
    stopBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic
  };
};