export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  date: string;
  author: string;
  imageUrl?: string;
  isRead?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export const categoryColors: Record<string, { bg: string; text: string; hover: string }> = {
  All: {
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-800 dark:text-gray-100',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-900/30'
  },
  Clubs: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-800 dark:text-purple-100',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
  },
  Academics: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-100',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
  },
  Library: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-800 dark:text-emerald-100',
    hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
  },
  Examinations: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-800 dark:text-amber-100',
    hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
  },
  Events: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-800 dark:text-rose-100',
    hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/30'
  }
};