import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Volume2, User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  };
  onCopy: (text: string) => void;
  onSpeak: (text: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onCopy, onSpeak }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // Check if it's today
    const isToday = messageDate.toDateString() === now.toDateString();
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `Today ${formatTime(messageDate)}`;
    } else if (isYesterday) {
      return `Yesterday ${formatTime(messageDate)}`;
    } else {
      // Format as "May 29, 2025 11:12am"
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' ' + messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
    }
  };

  // Handle speaker button click - play this specific message's text
  const handleSpeakClick = () => {
    onSpeak(message.text);
  };

  return (
    <div className={`group flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div className={`flex max-w-[85%] lg:max-w-[70%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'} gap-3 transform transition-all duration-300 ease-out`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
          message.isUser 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}>
          {message.isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </div>

        {/* Message Content */}
        <div className={`transition-all duration-300 ease-out transform hover:scale-[1.01] ${
          message.isUser 
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md shadow-lg hover:shadow-xl' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-md shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
        } px-4 py-3 relative`}>
          
          {/* Timestamp - Always visible at top */}
          <div className={`text-xs mb-2 ${
            message.isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formatDateTime(message.timestamp)}
          </div>

          {/* Message Text */}
          <div className="mb-2">
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
              message.isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {message.text}
            </p>
          </div>

          {/* Actions - Show on hover */}
          <div className={`flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            <Button
              onClick={() => onCopy(message.text)}
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 rounded-md transition-all duration-200 hover:scale-110 ${
                message.isUser 
                  ? 'hover:bg-blue-500 text-blue-100 hover:text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Copy className="h-3 w-3" />
            </Button>
            
            {!message.isUser && (
              <Button
                onClick={handleSpeakClick}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-md transition-all duration-200 hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Volume2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;