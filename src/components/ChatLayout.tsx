import React from 'react';
import ChatBot from '@/components/ChatBot';
import ChatSidebar from '@/components/ChatSidebar';
import LoadingIndicator from '@/components/LoadingIndicator';
import SuggestedQuestions from '@/components/SuggestedQuestions';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatLayoutProps {
  // Chat props
  messages: Message[];
  currentChatId: string | null;
  isLoading: boolean;
  suggestedQuestions: string[];
  showSuggestions: boolean;
  onSendMessage: (text: string) => void;
  onSuggestionClick: (question: string) => void;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  
  // Audio props
  isPlaying: boolean;
  isAudioProcessing?: boolean;
  selectedVoice: 'James' | 'Cassidy' | 'Drew' | 'Lavender';
  onPlayLatestResponse: () => void;
  onPauseAudio: () => void;
  onVoiceChange: (voice: 'James' | 'Cassidy' | 'Drew' | 'Lavender') => void;
  lastGeneratedAudioUrl?: string;
  
  // Background music props
  musicName?: string;
  musicVolume?: number;
  isCustomMusic?: boolean;
  onMusicUpload?: (file: File) => void;
  onRemoveMusic?: () => void;
  onVolumeChange?: (volume: number) => void;
  
  // UI props
  onCopy: (text: string) => void;
  onSpeak: (text: string) => void;
  onSignOut: () => void;
  
  // Mobile props
  isMobile: boolean;
  isMobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  
  // User props
  userEmail?: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  messages,
  currentChatId,
  isLoading,
  suggestedQuestions,
  showSuggestions,
  onSendMessage,
  onSuggestionClick,
  onChatSelect,
  onNewChat,
  isPlaying,
  isAudioProcessing,
  selectedVoice,
  onPlayLatestResponse,
  onPauseAudio,
  onVoiceChange,
  lastGeneratedAudioUrl,
  musicName,
  musicVolume,
  isCustomMusic,
  onMusicUpload,
  onRemoveMusic,
  onVolumeChange,
  onCopy,
  onSpeak,
  onSignOut,
  isMobile,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
  userEmail
}) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop/Tablet Sidebar - Hidden on mobile */}
      <div className={`${isMobile ? 'hidden' : 'block'}`}>
        <ChatSidebar
          currentChatId={currentChatId}
          onChatSelect={onChatSelect}
          onNewChat={onNewChat}
          onSignOut={onSignOut}
          userEmail={userEmail}
          messages={messages}
          onPlayLatestResponse={onPlayLatestResponse}
          onPauseAudio={onPauseAudio}
          selectedVoice={selectedVoice}
          onVoiceChange={onVoiceChange}
          isPlaying={isPlaying}
          isAudioProcessing={isAudioProcessing}
          lastGeneratedAudioUrl={lastGeneratedAudioUrl}
          musicName={musicName}
          musicVolume={musicVolume}
          isCustomMusic={isCustomMusic}
          onMusicUpload={onMusicUpload}
          onRemoveMusic={onRemoveMusic}
          onVolumeChange={onVolumeChange}
        />
      </div>

      {/* Mobile Sidebar Overlay - Only visible when open on mobile */}
      {isMobile && isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => onToggleMobileSidebar()}
          />
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out">
            <ChatSidebar
              currentChatId={currentChatId}
              onChatSelect={onChatSelect}
              onNewChat={onNewChat}
              onSignOut={onSignOut}
              userEmail={userEmail}
              messages={messages}
              onPlayLatestResponse={onPlayLatestResponse}
              onPauseAudio={onPauseAudio}
              selectedVoice={selectedVoice}
              onVoiceChange={onVoiceChange}
              isPlaying={isPlaying}
              isAudioProcessing={isAudioProcessing}
              lastGeneratedAudioUrl={lastGeneratedAudioUrl}
              musicName={musicName}
              musicVolume={musicVolume}
              isCustomMusic={isCustomMusic}
              onMusicUpload={onMusicUpload}
              onRemoveMusic={onRemoveMusic}
              onVolumeChange={onVolumeChange}
            />
          </div>
        </>
      )}
      
      <div className="flex-1 flex flex-col">
        <ChatBot
          messages={messages}
          onSendMessage={onSendMessage}
          onCopy={onCopy}
          onSpeak={onSpeak}
          isLoading={isLoading}
          loadingIndicator={<LoadingIndicator message="Processing with AI model..." />}
          suggestedQuestions={
            <SuggestedQuestions
              questions={suggestedQuestions}
              onQuestionClick={onSuggestionClick}
              isVisible={showSuggestions}
            />
          }
          onSuggestionClick={onSuggestionClick}
          isMobile={isMobile}
          onToggleMobileSidebar={onToggleMobileSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />
      </div>
    </div>
  );
};

export default ChatLayout;