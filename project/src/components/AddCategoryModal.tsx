import React, { useState } from 'react';
import { X, Folder, GraduationCap, Library, BookOpen, Users, Calendar, Bell, Bookmark } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: { label: string; icon: string }) => void;
}

const availableIcons = [
  { icon: Folder, name: 'Folder' },
  { icon: GraduationCap, name: 'GraduationCap' },
  { icon: Library, name: 'Library' },
  { icon: BookOpen, name: 'BookOpen' },
  { icon: Users, name: 'Users' },
  { icon: Calendar, name: 'Calendar' },
  { icon: Bell, name: 'Bell' },
  { icon: Bookmark, name: 'Bookmark' },
];

export default function AddCategoryModal({ isOpen, onClose, onAdd }: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAdd({
        label: categoryName.trim(),
        icon: selectedIcon,
      });
      setCategoryName('');
      setSelectedIcon('Folder');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Category</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter category name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableIcons.map(({ icon: Icon, name }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={`p-3 rounded-lg flex items-center justify-center ${
                    selectedIcon === name
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'hover:bg-gray-50 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
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
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}