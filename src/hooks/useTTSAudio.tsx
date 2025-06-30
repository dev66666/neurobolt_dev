import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { debounce } from 'lodash';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const useTTSAudio = (
  user: any, 
  messages: Message[], 
  playBackgroundMusic: () => Promise<void>,
  stopBackgroundMusic: () => void
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioProcessing, setIsAudioProcessing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'James' | 'Cassidy' | 'Drew' | 'Lavender'>('Drew');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [lastGeneratedAudioUrl, setLastGeneratedAudioUrl] = useState<string | null>(null);

  // Enhanced audio management refs
  const audioLock = useRef(false);
  const audioAbort = useRef<AbortController | null>(null);
  const audioQueue = useRef<Promise<void>>(Promise.resolve());
  const playListener = useRef<(e: Event) => void>();
  const endListener = useRef<(e: Event) => void>();
  const errListener = useRef<(e: Event) => void>();

  // Enhanced audio cleanup function
  const stopCurrentAudio = async () => {
    if (audioAbort.current) {
      audioAbort.current.abort();
      audioAbort.current = null;
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      if (playListener.current) currentAudio.removeEventListener('play', playListener.current);
      if (endListener.current) currentAudio.removeEventListener('ended', endListener.current);
      if (errListener.current) currentAudio.removeEventListener('error', errListener.current);
      if (currentAudio.src.startsWith('blob:')) URL.revokeObjectURL(currentAudio.src);
    }
    setCurrentAudio(null);
    setIsPlaying(false);
    setIsAudioProcessing(false);
    audioLock.current = false;
    
    // Stop background music when TTS stops
    stopBackgroundMusic();
  };

  // Upload audio to GitHub as a public gist using the base64 string directly
  const uploadAudioToGitHub = async (base64Audio: string): Promise<string> => {
    try {
      console.log('Uploading audio to GitHub using provided base64 string...');
      
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `tts_audio_${timestamp}.mp3`;
      
      // Create a GitHub gist with the audio file
      const gistData = {
        description: `TTS Audio - ${new Date().toISOString()}`,
        public: true,
        files: {
          [fileName]: {
            content: base64Audio
          },
          "README.md": {
            content: `# TTS Audio File\n\nGenerated on: ${new Date().toISOString()}\n\nThis is a temporary audio file for text-to-speech functionality.`
          }
        }
      };

      // Use GitHub API to create gist (no auth needed for public gists)
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(gistData)
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const gist = await response.json();
      
      // Get the raw URL for the audio file
      const rawUrl = gist.files[fileName].raw_url;
      
      console.log('Audio uploaded to GitHub successfully:', rawUrl);
      return rawUrl;
      
    } catch (error) {
      console.error('Error uploading to GitHub:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  // Enhanced TTS function with GitHub hosting
  const generateTTSAudio = async (text: string): Promise<{ audioBlob: Blob; publicUrl: string | null }> => {
    console.log('Calling TTS with voice:', selectedVoice, 'and text length:', text.length);
    
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: {
        text: text,
        voice: selectedVoice,
        userId: user?.id
      }
    });

    if (error || !data?.audio) {
      console.error('TTS API error:', error);
      throw new Error(error?.message ?? 'TTS generation failed');
    }

    // Convert base64 to blob for local playback
    const audioBlob = new Blob([
      Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
    ], { type: 'audio/mpeg' });

    console.log('TTS audio generated, size:', audioBlob.size);

    // Try to upload to GitHub for public access
    let publicUrl: string | null = null;
    try {
      publicUrl = await uploadAudioToGitHub(data.audio);
    } catch (error) {
      console.warn('GitHub upload failed, video generation will not be available:', error);
      // Don't throw here - we can still play audio locally
    }
    
    return { audioBlob, publicUrl };
  };

  // Play specific text (for message bubbles)
  const playSpecificText = async (text: string) => {
    if (audioLock.current) return;
    audioLock.current = true;
    
    // Immediately show processing state
    setIsAudioProcessing(true);
    setIsPlaying(false);

    await audioQueue.current;
    audioQueue.current = audioQueue.current.then(async () => {
      await stopCurrentAudio();
      setIsAudioProcessing(true);

      try {
        audioAbort.current = new AbortController();
        
        const { audioBlob, publicUrl } = await generateTTSAudio(text);
        
        if (audioAbort.current?.signal.aborted) {
          return;
        }

        // Set the public URL for video generation (may be null if GitHub upload failed)
        setLastGeneratedAudioUrl(publicUrl);
        console.log('Audio URL set for video generation:', publicUrl);
        
        // Use the blob directly for immediate playback
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        playListener.current = () => {
          setIsPlaying(true);
          setIsAudioProcessing(false);
          // Start background music when TTS starts playing
          playBackgroundMusic();
        };
        
        endListener.current = () => stopCurrentAudio();
        
        errListener.current = () => {
          console.error('Audio playback error');
          toast.error('Playback error');
          stopCurrentAudio();
        };

        audio.addEventListener('play', playListener.current);
        audio.addEventListener('ended', endListener.current);
        audio.addEventListener('error', errListener.current);

        setCurrentAudio(audio);
        await audio.play();
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error playing audio:', error);
          toast.error(`Failed to play audio: ${error.message}`);
          setIsAudioProcessing(false);
          setIsPlaying(false);
          audioLock.current = false;
        }
      }
    });
  };

  // Debounced play function for latest response
  const debouncedPlayLatestResponse = debounce(async () => {
    if (audioLock.current) return;
    audioLock.current = true;
    
    // Immediately show processing state
    setIsAudioProcessing(true);
    setIsPlaying(false);

    await audioQueue.current;
    audioQueue.current = audioQueue.current.then(async () => {
      await stopCurrentAudio();
      setIsAudioProcessing(true);

      const last = messages.filter(m => !m.isUser).pop();
      if (!last) {
        toast.error('No AI response to play');
        setIsAudioProcessing(false);
        audioLock.current = false;
        return;
      }

      try {
        audioAbort.current = new AbortController();
        
        const { audioBlob, publicUrl } = await generateTTSAudio(last.text);

        if (audioAbort.current?.signal.aborted) {
          return;
        }

        // Set the public URL for video generation (may be null if GitHub upload failed)
        setLastGeneratedAudioUrl(publicUrl);
        console.log('Audio URL set for video generation:', publicUrl);
        
        // Use the blob directly for immediate playback
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        playListener.current = () => {
          setIsPlaying(true);
          setIsAudioProcessing(false);
          // Start background music when TTS starts playing
          playBackgroundMusic();
        };
        
        endListener.current = () => stopCurrentAudio();
        
        errListener.current = () => {
          console.error('Audio playback error');
          toast.error('Playback error');
          stopCurrentAudio();
        };

        audio.addEventListener('play', playListener.current);
        audio.addEventListener('ended', endListener.current);
        audio.addEventListener('error', errListener.current);

        setCurrentAudio(audio);
        await audio.play();
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error playing audio:', error);
          toast.error(`Failed to play audio: ${error.message}`);
          setIsAudioProcessing(false);
          setIsPlaying(false);
          audioLock.current = false;
        }
      }
    });
  }, 300);

  const handlePlayLatestResponse = () => {
    debouncedPlayLatestResponse();
  };

  const handlePauseAudio = () => {
    console.log('Pause button pressed');
    stopCurrentAudio();
  };

  return {
    isPlaying,
    isAudioProcessing,
    selectedVoice,
    currentAudio,
    lastGeneratedAudioUrl,
    setSelectedVoice,
    handlePlayLatestResponse,
    handlePauseAudio,
    stopCurrentAudio,
    playSpecificText
  };
};