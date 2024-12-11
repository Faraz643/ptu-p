import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MessageSquare, MoreVertical, Trash2, Share, Pin, Send, Download, Clock } from 'lucide-react';
import type { Notice } from '../types';
import { categoryColors } from '../types';
import PDFViewer from './PDFViewer';
import styles from './NoticeCard.module.css';
import * as jose from 'jose';


interface NoticeCardProps {
  notice: Notice;
  viewMode: 'board' | 'list';
  onDelete: (id: string) => void;
}

export default function NoticeCard({ notice, viewMode, onDelete }: NoticeCardProps) {
  // ... previous state declarations remain the same ...
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem(`comments_${notice.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));

  const [newComment, setNewComment] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    const pinnedNotices = JSON.parse(localStorage.getItem('pinnedNotices') || '[]');
    return pinnedNotices.includes(notice.id);
  });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const isPDF = notice.imageUrl?.toLowerCase().endsWith('.pdf');

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const { date, time } = formatDateTime(notice.date);

  // ... previous useEffects and handlers remain the same ...
  useEffect(() => {
    localStorage.setItem(`comments_${notice.id}`, JSON.stringify(comments));
  }, [comments, notice.id]);

  useEffect(() => {
    if (!notice.imageUrl || isPDF || viewMode === 'list') return;

    const image = imageRef.current;
    const container = containerRef.current;
    
    if (!image || !container) return;

    const checkForScroll = () => {
      if (image.offsetHeight > container.offsetHeight) {
        setShouldAnimate(true);
      }
    };

    if (image.complete) {
      checkForScroll();
    } else {
      image.addEventListener('load', checkForScroll);
    }

    return () => {
      image.removeEventListener('load', checkForScroll);
    };
  }, [notice.imageUrl, isPDF, viewMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!notice.imageUrl) return;

    try {
      setIsDownloading(true);
      const response = await fetch(notice.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notice-${notice.id}${getFileExtension(notice.imageUrl)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePin = () => {
    const pinnedNotices = JSON.parse(localStorage.getItem('pinnedNotices') || '[]');
    let updatedPinnedNotices;
    
    if (isPinned) {
      updatedPinnedNotices = pinnedNotices.filter((id: string) => id !== notice.id);
    } else {
      updatedPinnedNotices = [...pinnedNotices, notice.id];
    }
    
    localStorage.setItem('pinnedNotices', JSON.stringify(updatedPinnedNotices));
    setIsPinned(!isPinned);
    setShowMenu(false);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: notice.title,
          text: notice.content,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(
          `${notice.title}\n\n${notice.content}\n\n${window.location.href}`
        );
        alert('Notice link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
    setShowMenu(false);
  };

  // const handleDelete = async () => {
  //   if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
  //   try {
  //     setIsDeleting(true);
  //     if (isPinned) {
  //       const pinnedNotices = JSON.parse(localStorage.getItem('pinnedNotices') || '[]');
  //       const updatedPinnedNotices = pinnedNotices.filter((id: string) => id !== notice.id);
  //       localStorage.setItem('pinnedNotices', JSON.stringify(updatedPinnedNotices));
  //     }
  //     localStorage.removeItem(`comments_${notice.id}`);
  //     console.log(notice.id)
  //     await onDelete(notice.id);
  //   } catch (error) {
  //     console.error('Error deleting notice:', error);
  //   } finally {
  //     setIsDeleting(false);
  //     setShowMenu(false);
  //   }
  // };





// --------------------------------------------------


  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
  
    try {
      setIsDeleting(true);
      // Remove from pinned notices if applicable
      if (isPinned) {
        const pinnedNotices = JSON.parse(localStorage.getItem('pinnedNotices') || '[]');
        const updatedPinnedNotices = pinnedNotices.filter((id: string) => id !== notice.id);
        localStorage.setItem('pinnedNotices', JSON.stringify(updatedPinnedNotices));
      }
      // Remove related comments from localStorage
      localStorage.removeItem(`comments_${notice.id}`);
  
      console.log(notice.id);
  
      // Delete the notice by calling the API
      const response = await fetch(`http://localhost:3000/api/notices/${notice.id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete notice');
      }
  
      // Trigger the onDelete callback after successful deletion
      await onDelete(notice.id);
  
    } catch (error) {
      console.error('Error deleting notice:', error);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

// --------------------------------------------------



  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: 'Anonymous User',
      date: new Date(),
    };
    
    setComments(prevComments => [...prevComments, comment]);
    setNewComment('');
  };

  const getFileExtension = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    return extension.match(/^(jpg|jpeg|png|gif|pdf|doc|docx)$/) ? `.${extension}` : '';
  };



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



  const renderImage = () => {
    if (!notice.imageUrl) return null;

    if (isPDF) {
      return (
        <div className="w-full h-48 relative">
          <PDFViewer url={notice.imageUrl} className="w-full h-full" />
          <div className="absolute top-2 right-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transform transition-all duration-200 hover:scale-110"
            >
              <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div ref={containerRef} className={styles.scrollContainer}>
        <img
          ref={imageRef}
          src={notice.imageUrl}
          alt={notice.title}
          className={`${styles.scrollImage} ${shouldAnimate ? styles.animate : ''}`}
        />
        <div className={styles.downloadOverlay}>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transform transition-all duration-200 hover:scale-110"
          >
            <Download className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden transform hover:scale-[1.02] ${categoryColors[notice.category]?.bg || 'bg-gray-50'} ${isPinned ? 'border-2 border-blue-500' : ''}`}>
      {renderImage()}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[notice.category]?.bg || 'bg-gray-100'} ${categoryColors[notice.category]?.text || 'text-gray-800'}`}>
              {notice.category}
            </span>
            {isPinned && <Pin className="h-4 w-4 text-blue-500" />}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    onClick={handlePin}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Pin className={`h-4 w-4 mr-2 ${isPinned ? 'text-blue-500' : ''}`} />
                    {isPinned ? 'Unpin Notice' : 'Pin Notice'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share Notice
                  </button>
                  {isUserAuthenticated && 
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Notice'}
                  </button>
}
                </div>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{notice.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{notice.content}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{time}</span>
              </div>
            </div>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center hover:text-gray-700 transition-colors duration-200"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{comments.length}</span>
            </button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{comment.author}</span>
                    <span className="text-gray-500">{new Date(comment.date).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{comment.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="mt-4 flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}