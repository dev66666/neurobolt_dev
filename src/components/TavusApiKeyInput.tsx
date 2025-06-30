import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key, Check, X } from 'lucide-react';
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

  return (
    <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Tavus API Key (Optional)
        </Label>
      </div>

      {!hasCustomKey ? (
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your Tavus API key for priority access"
              value={apiKey}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              className="pr-10 bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
              disabled={disabled}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim() || disabled}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="h-3 w-3 mr-1" />
              Save Key
            </Button>
          </div>

          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 Your API key gets priority and unlimited usage. Get yours at{' '}
            <a 
              href="https://platform.tavus.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-800 dark:hover:text-blue-300"
            >
              platform.tavus.io
            </a>
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Custom API Key Active
              </span>
            </div>
            <Button
              onClick={handleRemoveApiKey}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
            ✅ Your API key: ****{apiKey.slice(-4)} (Priority access enabled)
          </div>
        </div>
      )}
    </div>
  );
};

export default TavusApiKeyInput;