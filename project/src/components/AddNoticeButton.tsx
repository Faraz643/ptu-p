import React from 'react';
import { Plus } from 'lucide-react';

export default function AddNoticeButton() {
  return (
    <button
      className="fixed right-8 bottom-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
      onClick={() => {}}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}