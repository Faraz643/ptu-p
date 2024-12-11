import React, { useEffect, useState } from 'react';
import NoticeCard from './NoticeCard';
import type { Notice } from '../types';

interface NoticeListProps {
  notices: Notice[];
  viewMode: 'board' | 'list';
  onDeleteNotice: (id: string) => void;
}

export default function NoticeList({ notices, viewMode, onDeleteNotice }: NoticeListProps) {
  const [sortedNotices, setSortedNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const pinnedNotices = JSON.parse(localStorage.getItem('pinnedNotices') || '[]');
    
    // Sort notices with pinned items at the top
    const sorted = [...notices].sort((a, b) => {
      const aIsPinned = pinnedNotices.includes(a.id);
      const bIsPinned = pinnedNotices.includes(b.id);
      
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      
      // If both are pinned or both are not pinned, sort by date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setSortedNotices(sorted);
  }, [notices]);

  return (
    <div className={`
      grid gap-3 sm:gap-4 md:gap-6
      ${viewMode === 'board' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
        : 'grid-cols-1'
      }
    `}>
      {sortedNotices.map((notice) => (
        <NoticeCard 
          key={notice.id} 
          notice={notice} 
          viewMode={viewMode}
          onDelete={onDeleteNotice}
        />
      ))}
    </div>
  );
}