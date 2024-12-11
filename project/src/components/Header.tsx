import React from 'react';
import { Search, LayoutGrid, List, Sun, Moon, UserCircle2, LogOut, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  viewMode: 'board' | 'list';
  onViewModeChange: (mode: 'board' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLoginClick: () => void;
  isAuthenticated: boolean;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ 
  viewMode, 
  onViewModeChange, 
  searchQuery, 
  onSearchChange, 
  onLoginClick,
  isAuthenticated,
  onMenuClick,
  isSidebarOpen
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showSearchResults, setShowSearchResults] = React.useState(false);

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 shadow-sm">
      <div className="max-w-[2000px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden"
          >
            <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <img 
            src="/ptu-logo.png" 
            alt="PTU Logo" 
            className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
          />
          <h1 
            className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            PTU NOTICE BOARD
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            </div>
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="w-40 sm:w-56 md:w-72 pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                bg-white dark:bg-gray-700 
                text-gray-900 dark:text-gray-100
                transition-all duration-200
                hover:border-blue-400 dark:hover:border-blue-500
                group-hover:shadow-md
                text-sm sm:text-base"
            />
            
            {showSearchResults && searchQuery && (
              <div className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Search results for "{searchQuery}"
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
            )}
          </button>

          <div className="hidden sm:flex items-center space-x-2 border dark:border-gray-700 rounded-xl p-1.5 shadow-sm hover:shadow-md transition-all duration-200">
            <button
              onClick={() => onViewModeChange('board')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'board' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 scale-105' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 scale-105' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              <List className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 bg-red-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-red-700 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              <UserCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}