import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Music, Trash2 } from 'lucide-react';

interface BackgroundMusicUploadProps {
  musicName?: string;
  onMusicUpload: (file: File) => void;
  onRemoveMusic: () => void;
  disabled?: boolean;
}

const BackgroundMusicUpload: React.FC<BackgroundMusicUploadProps> = ({
  musicName,
  onMusicUpload,
  onRemoveMusic,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onMusicUpload(file);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const truncateFileName = (name: string, maxLength: number = 25) => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - extension!.length - 4) + '...';
    return `${truncated}.${extension}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Music className="h-4 w-4" />
          Background Music
        </label>
      </div>

      {!musicName ? (
        <Button
          onClick={handleFileSelect}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Audio File
        </Button>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Music className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={musicName}>
                {truncateFileName(musicName)}
              </span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button
                onClick={handleFileSelect}
                disabled={disabled}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Replace music"
              >
                <Upload className="h-3 w-3" />
              </Button>
              <Button
                onClick={onRemoveMusic}
                disabled={disabled}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Remove music"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {!musicName && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supported formats: MP3, WAV, OGG, M4A (Max 50MB)
        </p>
      )}
    </div>
  );
};

export default BackgroundMusicUpload;