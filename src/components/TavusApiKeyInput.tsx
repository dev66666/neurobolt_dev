import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface TavusApiKeyInputProps {
  onApiKeyChange: (apiKey: string | null) => void;
  disabled?: boolean;
}

const TavusApiKeyInput: React.FC<TavusApiKeyInputProps> = ({
  onApiKeyChange,
  disabled = false
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load saved API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('tavus_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setHasCustomKey(true);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid Tavus API key');
      return;
    }

    // Basic validation - Tavus API keys typically start with specific patterns
    if (apiKey.length < 20) {
      toast.error('API key appears to be too short. Please check your key.');
      return;
    }

    try {
      localStorage.setItem('tavus_api_key', apiKey.trim());
      setHasCustomKey(true);
      onApiKeyChange(apiKey.trim());
      setIsExpanded(false); // Collapse after saving
      toast.success('Tavus API key saved! Your key will be used for video generation.');
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    }
  };

  const handleRemoveApiKey = () => {
    try {
      localStorage.removeItem('tavus_api_key');
      setApiKey('');
      setHasCustomKey(false);
      setIsExpanded(false); // Collapse after removing
      onApiKeyChange(null);
      toast.success('API key removed. Using default key.');
    } catch (error) {
      console.error('Error removing API key:', error);
      toast.error('Failed to remove API key');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && apiKey.trim() && !hasCustomKey) {
      handleSaveApiKey();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-1">
      {/* Compact Header - Always Visible (1/4th size) */}
      <Button
        onClick={toggleExpanded}
        variant="ghost"
        size="sm"
        disabled={disabled}
        className="w-full h-6 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-md flex items-center justify-between"
      >
        <div className="flex items-center gap-1">
          <Key className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            {hasCustomKey ? 'Custom Key Active' : 'Tavus API Key'}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        ) : (
          <ChevronDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        )}
      </Button>

      {/* Expanded Content - Only shows when clicked */}
      {isExpanded && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3 animate-in slide-in-from-top-2 duration-200">
          
          {/* Message */}
          <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 p-2 rounded border border-blue-300 dark:border-blue-600">
            💡 Your API key gets priority and unlimited usage. Get yours at{' '}
            <a 
              href="https://platform.tavus.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-900 dark:hover:text-blue-100 font-medium"
            >
              platform.tavus.io
            </a>
          </div>

          {!hasCustomKey ? (
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Tavus API key"
                  value={apiKey}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={disabled}
                  className="pr-10 bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 text-xs h-8"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={disabled}
                >
                  {showApiKey ? (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  ) : (
                    <Eye className="h-3 w-3 text-gray-400" />
                  )}
                </Button>
              </div>

              <Button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim() || disabled}
                size="sm"
                className="w-full h-7 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Save Key
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Priority Access Enabled
                  </span>
                </div>
                <Button
                  onClick={handleRemoveApiKey}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  disabled={disabled}
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </div>

              <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                ✅ Key: ****{apiKey.slice(-4)} (Unlimited usage)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TavusApiKeyInput;