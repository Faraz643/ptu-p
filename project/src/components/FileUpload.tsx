import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

export default function FileUpload({ onFileSelect, selectedFiles, onRemoveFile }: FileUploadProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    onFileSelect(files);
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFileSelect(files);
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Supports: Images, PDFs, Documents, and more
          </p>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Files:</p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}