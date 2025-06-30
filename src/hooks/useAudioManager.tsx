import { useBackgroundMusic } from './useBackgroundMusic';
import { useTTSAudio } from './useTTSAudio';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const useAudioManager = (user: any, messages: Message[]) => {
  // Background music functionality
  const {
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
  } = useBackgroundMusic();

  // TTS audio functionality with background music integration
  const {
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
  } = useTTSAudio(user, messages, playBackgroundMusic, stopBackgroundMusic);

  return {
    // TTS Audio exports
    isPlaying,
    isAudioProcessing,
    selectedVoice,
    currentAudio,
    lastGeneratedAudioUrl, // Make sure this is exported
    setSelectedVoice,
    handlePlayLatestResponse,
    handlePauseAudio,
    stopCurrentAudio,
    playSpecificText,
    
    // Background Music exports
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