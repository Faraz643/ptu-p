import React, { useEffect, useState } from 'react';
import { X, Upload, AlertCircle, FileText } from 'lucide-react';
import type { Notice } from '../types';

interface AddNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notice: Omit<Notice, 'id' | 'date'>, files: File[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function AddNoticeModal({ isOpen, onClose }: AddNoticeModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Academics',
    priority: 'Medium',
    author: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>('');



  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setFormData((prevData) => ({
        ...prevData,
        author: parsedUser.email, // Set the author to the user's email from localStorage
      }));
    }
  }, []);

  if (!isOpen) return null;




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const noticeData = {
      ...formData,
      imageUrl: previews[0] || '',
    };

    try {
      const response = await fetch('http://localhost:3000/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noticeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add notice');
        return;
      }

      onClose();
      setFormData({
        title: '',
        content: '',
        category: 'Academics',
        priority: 'Medium',
        author: '',
      });
      previews.forEach((preview) => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
      setSelectedFiles([]);
      setPreviews([]);
      setError('');
    } catch (error) {
      setError('An error occurred while adding the notice');
    }
  };











  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} exceeds 10MB limit`);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File ${file.name} is not a supported format`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    try {
      files.forEach(validateFile);
      setSelectedFiles((prev) => [...prev, ...files]);

      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviews((prev) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
          const pdfUrl = URL.createObjectURL(file);
          setPreviews((prev) => [...prev, pdfUrl]);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing files');
    }
  };



  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');

    const files = Array.from(e.dataTransfer.files);
    try {
      files.forEach(validateFile);
      setSelectedFiles(prev => [...prev, ...files]);

      // Generate previews
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
          // Create a temporary URL for the PDF
          const pdfUrl = URL.createObjectURL(file);
          setPreviews(prev => [...prev, pdfUrl]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing files');
    }
  };



  const handleRemoveFile = (index: number) => {
    if (selectedFiles[index].type === 'application/pdf') {
      URL.revokeObjectURL(previews[index]);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Notice</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Clubs">Clubs</option>
                <option value="Academics">Academics</option>
                <option value="Library">Library</option>
                <option value="Examinations">Examinations</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Attachments
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg"
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleFileSelect}
                      accept="image/*,.pdf"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </div>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  {selectedFiles[index].type === 'application/pdf' ? (
                    <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
                      <span className="text-sm text-gray-500 ml-2">{selectedFiles[index].name}</span>
                    </div>
                  ) : (
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}