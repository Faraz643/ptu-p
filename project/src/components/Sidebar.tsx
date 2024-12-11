import React, { useState, useEffect } from 'react';
import { Home, Calendar, Plus, Folder, GraduationCap, Library, ChevronLeft, CalendarCheck, MessageSquare, BookOpen } from 'lucide-react';
import { categoryColors } from '../types';
import AddCategoryModal from './AddCategoryModal';
import type { Notice } from '../types';
import * as jose from 'jose';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onAddNotice: () => void;
  onCalendarClick: () => void;
  onFeedbackClick: () => void;
  eventCount: number;
  notices: Notice[];
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  count: number;
}

interface Category {
  icon: React.ElementType;
  label: string;
  count: number;
}

const iconMap: Record<string, React.ElementType> = {
  Folder,
  GraduationCap,
  Library,
  BookOpen,
  Home,
  Calendar,
  CalendarCheck,
  MessageSquare,
};

export default function Sidebar({ 
  activeCategory, 
  onCategoryChange, 
  isOpen, 
  onToggle, 
  onAddNotice, 
  onCalendarClick, 
  onFeedbackClick,
  eventCount,
  notices 
}: SidebarProps) {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      const parsedCategories = JSON.parse(saved);
      return parsedCategories.map((cat: any) => ({
        ...cat,
        icon: iconMap[cat.icon] || Folder
      }));
    }
    return [
      { icon: Folder, label: 'Clubs', count: 0 },
      { icon: GraduationCap, label: 'Academics', count: 0 },
      { icon: Library, label: 'Library', count: 0 },
      { icon: BookOpen, label: 'Examinations', count: 0 },
    ];
  });

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));


// refractor code
// ---------------------------

const secretUint8Array = new TextEncoder().encode('secret');

useEffect(() => {
  if (authToken) {
    async function verifyUserInfo() {
      try {
        const { payload } = await jose.jwtVerify(authToken, secretUint8Array);
        setIsUserAuthenticated(true);
      } catch (e) {
        console.log('An error occurred in authenticating user', e);
      }
    }

    // Call the async function to verify the user
    verifyUserInfo();
  }
}, [authToken]); // The effect will now run when authToken changes
// ---------------------------



  // Update category counts based on notices
  useEffect(() => {
    const updatedCategories = categories.map(category => ({
      ...category,
      count: notices.filter(notice => notice.category === category.label).length
    }));
    setCategories(updatedCategories);
  }, [notices]);

  React.useEffect(() => {
    const categoriesToSave = categories.map(cat => ({
      ...cat,
      icon: cat.icon.name
    }));
    localStorage.setItem('categories', JSON.stringify(categoriesToSave));
  }, [categories]);

  const getMenuItemCount = (label: string) => {
    if (label === 'Events') return eventCount;
    if (label === 'All') return notices.length;
    return 0;
  };

  const handleAddCategory = (newCategory: { label: string; icon: string }) => {
    const category = {
      label: newCategory.label,
      icon: iconMap[newCategory.icon] || Folder,
      count: 0,
    };
    setCategories([...categories, category]);
    setIsAddCategoryOpen(false);
  };

  const menuItems: MenuItem[] = [
    { icon: Home, label: 'All', count: getMenuItemCount('All') },
    { icon: CalendarCheck, label: 'Events', count: getMenuItemCount('Events') },
    ...(isUserAuthenticated ? [{ icon: Calendar, label: 'Calendar', count: 0 }] : []), // Conditionally add Calendar item
  ];

  return (
    <div className={`
      ${isOpen ? 'w-64' : 'w-20'} 
      bg-white dark:bg-gray-800 
      border-r border-gray-200 dark:border-gray-700 
      flex flex-col
      transition-all duration-300 ease-in-out
      relative
      h-screen
      shadow-lg
    `}>
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 
          hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
      </button>

      <div className="p-6">
        <h1 className={`text-xl font-bold text-gray-900 dark:text-white ${isOpen ? '' : 'hidden'}`}>
          Dashboard
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        {menuItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => label === 'Calendar' ? onCalendarClick() : onCategoryChange(label)}
            className={`
              w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 hover:scale-105
              ${activeCategory === label
                ? `${categoryColors[label]?.bg || 'bg-blue-50 dark:bg-blue-900/20'} 
                   ${categoryColors[label]?.text || 'text-blue-700 dark:text-blue-100'} 
                   shadow-md`
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
          >
            <Icon className="h-5 w-5" />
            {isOpen && (
              <>
                <span className="ml-3 flex-1 text-left font-medium">{label}</span>
                {getMenuItemCount(label) > 0 && (
                  <span className={`
                    px-2.5 py-1 rounded-full text-xs font-medium
                    ${categoryColors[label]?.bg || 'bg-blue-100 dark:bg-blue-800'} 
                    ${categoryColors[label]?.text || 'text-blue-600 dark:text-blue-100'}
                    shadow-sm
                  `}>
                    {getMenuItemCount(label)}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {isOpen && (
        <div className="px-3 py-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Categories
            </h2>
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:scale-110"
            >
              <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          {categories.map(({ icon: Icon, label, count }) => (
            <button
              key={label}
              onClick={() => onCategoryChange(label)}
              className={`
                w-full flex items-center px-4 py-3 text-sm rounded-xl mb-1.5 transition-all duration-200 hover:scale-105
                ${activeCategory === label
                  ? `${categoryColors[label]?.bg || 'bg-blue-50 dark:bg-blue-900/20'} 
                     ${categoryColors[label]?.text || 'text-blue-700 dark:text-blue-100'} 
                     shadow-md`
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="ml-3 flex-1 text-left font-medium">{label}</span>
              {count > 0 && (
                <span className={`
                  px-2.5 py-1 rounded-full text-xs font-medium
                  ${categoryColors[label]?.bg || 'bg-gray-100 dark:bg-gray-800'} 
                  ${categoryColors[label]?.text || 'text-gray-600 dark:text-gray-300'}
                  shadow-sm
                `}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
        {isUserAuthenticated && 
        <button 
          onClick={onAddNotice}
          className={`
            w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white 
            bg-gradient-to-r from-blue-600 to-indigo-600 
            rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105 
            shadow-md hover:shadow-lg
          `}
        >
          <Plus className="h-5 w-5" />
          {isOpen && <span className="ml-2">Add Notice</span>}
        </button>
        }
        {isOpen && (
          <button 
            onClick={onFeedbackClick}
            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 
              bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 
              transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="ml-2">Feedback</span>
          </button>
        )}
      </div>

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAdd={handleAddCategory}
      />
    </div>
  );
}