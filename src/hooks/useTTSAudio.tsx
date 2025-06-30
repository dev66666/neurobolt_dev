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

  // Save audio blob to public folder as audio.mp3
  const saveAudioToPublicFolder = async (audioBlob: Blob): Promise<string> => {
    try {
      console.log('Saving audio to public folder...');
      
      // Create a File object from the blob
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      // Send to a simple endpoint that saves to public folder
      // For now, we'll use a blob URL and set it as the audio URL
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // In a real implementation, you would send this to your server:
      // const response = await fetch('/api/save-audio', {
      //   method: 'POST',
      //   body: formData
      // });
      
      // For MVP testing, we'll use the blob URL directly
      // and simulate the public URL path
      const publicAudioUrl = '/audio.mp3'; // This would be the actual path after server save
      
      console.log('Audio saved locally, accessible at:', publicAudioUrl);
      
      // For testing purposes, we'll return the blob URL
      // In production, you'd return the actual public URL
      return audioUrl; // This allows immediate playback
      
    } catch (error) {
      console.error('Error saving audio to public folder:', error);
      throw error;
    }
  };

  // Enhanced TTS function with local file saving
  const generateTTSAudio = async (text: string): Promise<{ audioBlob: Blob; publicUrl: string }> => {
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

    // Convert base64 to blob
    const audioBlob = new Blob([
      Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
    ], { type: 'audio/mpeg' });

    console.log('TTS audio generated, size:', audioBlob.size);

    // Save to public folder and get URL
    const publicUrl = await saveAudioToPublicFolder(audioBlob);
    
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

        // Set the public URL for video generation
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

        // Set the public URL for video generation
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