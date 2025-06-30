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

  // Upload audio to a public hosting service (using file.io for temporary hosting)
  const uploadAudioToPublicHost = async (audioBlob: Blob): Promise<string> => {
    try {
      console.log('Uploading audio to public host...');
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.mp3');
      
      // Use file.io for temporary public hosting (24 hours)
      const response = await fetch('https://file.io', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.link) {
        throw new Error('Upload service did not return a valid link');
      }
      
      console.log('Audio uploaded successfully:', data.link);
      return data.link;
      
    } catch (error) {
      console.error('Error uploading to file.io, trying alternative method:', error);
      
      // Fallback: Try using tmpfiles.org
      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.mp3');
        
        const response = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Fallback upload failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data && data.data.url) {
          console.log('Audio uploaded to fallback service:', data.data.url);
          return data.data.url;
        }
        
        throw new Error('Fallback service did not return a valid URL');
        
      } catch (fallbackError) {
        console.error('Fallback upload also failed:', fallbackError);
        
        // Final fallback: Use a blob URL and warn the user
        const blobUrl = URL.createObjectURL(audioBlob);
        console.warn('Using blob URL as final fallback:', blobUrl);
        toast.error('Could not upload audio to public host. Video generation may not work.');
        return blobUrl;
      }
    }
  };

  // Enhanced TTS function with public hosting
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

    // Upload to public hosting service
    const publicUrl = await uploadAudioToPublicHost(audioBlob);
    
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