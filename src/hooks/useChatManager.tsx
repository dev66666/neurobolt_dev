import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateSuggestedQuestions } from '@/utils/questionGenerator';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  is_article: boolean;
  created_at: string;
  updated_at: string;
}

export const useChatManager = (user: any, hasAgreed: boolean) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
    }
  }, [currentChatId]);

  const loadChatMessages = async (chatId: string) => {
    if (!user) return;

    try {
      console.log('Loading messages for chat:', chatId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', chatId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat messages:', error);
        toast.error('Failed to load chat messages');
        return;
      }

      const loadedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.is_user,
        timestamp: new Date(msg.created_at)
      }));

      console.log('Loaded messages:', loadedMessages);
      setMessages(loadedMessages);

      if (loadedMessages.length > 0) {
        const lastAiMessage = loadedMessages
          .filter(msg => !msg.isUser)
          .pop();
        
        if (lastAiMessage) {
          const questions = generateSuggestedQuestions(lastAiMessage.text);
          setSuggestedQuestions(questions);
          setShowSuggestions(true);
        }
      }

    } catch (error) {
      console.error('Error in loadChatMessages:', error);
      toast.error('Failed to load chat messages');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!user || !hasAgreed) return;

    console.log('=== STARTING MESSAGE SEND ===');
    console.log('Sending message:', text);
    console.log('Current messages before send:', messages.length);
    
    setIsLoading(true);
    setShowSuggestions(false);

    // Create user message with unique timestamp-based ID
    const userMessageId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userMessage: Message = {
      id: userMessageId,
      text,
      isUser: true,
      timestamp: new Date()
    };

    console.log('Created user message:', userMessage);

    // CRITICAL FIX: Add user message to state immediately using functional update
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, userMessage];
      console.log('Updated messages state - Previous count:', prevMessages.length, 'New count:', newMessages.length);
      console.log('New messages array:', newMessages.map(m => ({ id: m.id, text: m.text.substring(0, 50), isUser: m.isUser })));
      return newMessages;
    });

    try {
      let chatId = currentChatId;

      // Create new chat if needed
      if (!chatId) {
        const chatTitle = text.length > 50 ? text.substring(0, 50) + '...' : text;
        
        console.log('Creating new chat session with title:', chatTitle);
        const { data: newChat, error: chatError } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user.id,
            title: chatTitle,
            is_article: false
          })
          .select()
          .single();

        if (chatError) {
          console.error('Error creating chat session:', chatError);
          toast.error('Failed to create chat session');
          setIsLoading(false);
          // Keep the user message in UI even if chat creation fails
          return;
        }

        chatId = newChat.id;
        setCurrentChatId(chatId);
        console.log('Created new chat session:', chatId);
      }

      // Save user message to database (async, non-blocking for UI)
      console.log('Saving user message to database...');
      const { data: savedUserMessage, error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatId,
          user_id: user.id,
          content: text,
          is_user: true
        })
        .select()
        .single();

      if (userMsgError) {
        console.error('Error saving user message:', userMsgError);
        toast.error('Failed to save message');
        // Don't remove the message from UI, just log the error
      } else {
        console.log('User message saved successfully:', savedUserMessage);
        
        // Update the user message with the actual database ID and timestamp
        setMessages(prevMessages => {
          const updatedMessages = prevMessages.map(msg => 
            msg.id === userMessageId 
              ? { 
                  ...msg, 
                  id: savedUserMessage.id, 
                  timestamp: new Date(savedUserMessage.created_at) 
                }
              : msg
          );
          console.log('Updated user message with DB ID:', savedUserMessage.id);
          return updatedMessages;
        });
      }

      console.log('Calling webhook handler...');
      // Call AI service
      const { data, error } = await supabase.functions.invoke('webhook-handler', {
        body: {
          question: text,
          chatId: chatId,
          userId: user.id
        }
      });

      if (error) {
        console.error('Webhook error:', error);
        throw new Error(`Failed to get AI response: ${error.message}`);
      }

      console.log('Webhook response received');
      
      const aiResponseText = data.response || data.answer || 'Sorry, I could not generate a response.';
      
      // Create AI message with unique ID
      const aiMessageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const aiMessage: Message = {
        id: aiMessageId,
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      // Add AI message to UI immediately using functional update
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, aiMessage];
        console.log('Added AI message to UI. Total messages:', newMessages.length);
        return newMessages;
      });

      // Save AI message to database (async, non-blocking)
      console.log('Saving AI message to database...');
      const { data: savedAiMessage, error: aiMsgError } = await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: chatId,
          user_id: user.id,
          content: aiResponseText,
          is_user: false
        })
        .select()
        .single();

      if (aiMsgError) {
        console.error('Error saving AI message:', aiMsgError);
        toast.error('Failed to save AI response');
      } else {
        console.log('AI message saved successfully to database:', savedAiMessage);
        
        // Update the AI message with the actual database ID and timestamp
        setMessages(prevMessages => {
          const updatedMessages = prevMessages.map(msg => 
            msg.id === aiMessageId 
              ? { 
                  ...msg, 
                  id: savedAiMessage.id, 
                  timestamp: new Date(savedAiMessage.created_at) 
                }
              : msg
          );
          return updatedMessages;
        });
      }

      // Generate suggested questions
      const questions = generateSuggestedQuestions(aiResponseText);
      setSuggestedQuestions(questions);
      setShowSuggestions(true);

      // Update chat session timestamp (async, non-blocking)
      try {
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId);
      } catch (updateError) {
        console.error('Error updating chat session timestamp:', updateError);
      }

    } catch (error) {
      console.error('Error handling message:', error);
      toast.error(`Failed to send message: ${error.message}`);
      
      // IMPORTANT: Don't remove the user message from UI even on error
      console.log('Keeping user message in UI despite error');
    } finally {
      setIsLoading(false);
      console.log('=== MESSAGE SEND COMPLETED ===');
    }
  };

  const handleSuggestionClick = (question: string) => {
    console.log('Suggestion clicked:', question);
    setShowSuggestions(false);
    handleSendMessage(question);
  };

  const handleNewChat = () => {
    console.log('Starting new chat - clearing messages');
    setCurrentChatId(null);
    setMessages([]);
    setSuggestedQuestions([]);
    setShowSuggestions(false);
    console.log('New chat started - messages cleared');
  };

  const handleChatSelect = (chatId: string) => {
    if (chatId !== currentChatId) {
      console.log('Selecting chat:', chatId, 'Previous chat:', currentChatId);
      setCurrentChatId(chatId);
      setShowSuggestions(false);
      console.log('Chat selected');
    }
  };

  return {
    messages,
    currentChatId,
    isLoading,
    suggestedQuestions,
    showSuggestions,
    handleSendMessage,
    handleSuggestionClick,
    handleNewChat,
    handleChatSelect,
    setShowSuggestions
  };
};