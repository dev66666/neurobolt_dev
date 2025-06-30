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

  // Upload audio to Supabase storage and return public URL
  const uploadAudioToSupabase = async (audioBlob: Blob): Promise<string> => {
    try {
      console.log('Starting audio upload to Supabase...');
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const fileName = `tts_audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading audio file:', filePath, 'Size:', audioBlob.size);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('music')
        .upload(filePath, audioBlob, {
          contentType: 'audio/mpeg',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Failed to upload audio: ${error.message}`);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('music')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      // Verify the URL is accessible
      try {
        const testResponse = await fetch(publicUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          console.warn('Public URL not immediately accessible:', testResponse.status);
        }
      } catch (testError) {
        console.warn('Could not verify public URL accessibility:', testError);
      }

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadAudioToSupabase:', error);
      throw error;
    }
  };

  // Enhanced TTS function with better error handling
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

    // Upload to Supabase and get public URL
    const publicUrl = await uploadAudioToSupabase(audioBlob);
    
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