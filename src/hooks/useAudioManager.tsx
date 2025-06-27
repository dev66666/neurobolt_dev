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
    selectedVoice,
    currentAudio,
    isAudioProcessing,
    setSelectedVoice,
    handlePlayLatestResponse,
    handlePauseAudio,
    stopCurrentAudio
  } = useTTSAudio(user, messages, playBackgroundMusic, stopBackgroundMusic);

  return {
    // TTS Audio exports
    isPlaying,
    selectedVoice,
    currentAudio,
    isAudioProcessing,
    setSelectedVoice,
    handlePlayLatestResponse,
    handlePauseAudio,
    stopCurrentAudio,
    
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