import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import NoticeList from './components/NoticeList';
import Header from './components/Header';
import AddNoticeModal from './components/AddNoticeModal';
import AuthModal from './components/AuthModal';
import CalendarModal from './components/CalendarModal';
import FeedbackModal from './components/FeedbackModal';
import type { Notice } from './types';
import jwt from 'jsonwebtoken'
import * as jose from 'jose';
function App() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'list'>(() => {
    return localStorage.getItem('viewMode') as 'board' | 'list' || 'board';
  });
  
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem('activeCategory') || 'All';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('isSidebarOpen');
    return savedState === null ? window.innerWidth > 768 : savedState !== 'false';
  });
  
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMessage, setAuthMessage] = useState<string>('');
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)

  const isAuthenticated = !!localStorage.getItem('authToken');







  // Fetch notices from the API
  useEffect(() => {
    async function fetchNotices() {
      try {
        const response = await fetch('http://localhost:3000/api/notices');
        if (!response.ok) {
          throw new Error('Failed to fetch notices');
        }
        const data = await response.json();
        setNotices(data);
      } catch (error) {
        console.error('Error fetching notices:', error);
      }
    }

    fetchNotices();
  }, []); // Runs only once on component mount





  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('activeCategory', activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    localStorage.setItem('isSidebarOpen', String(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const handleAddEvent = (event: CalendarEvent) => {
    const newEvents = [...events, event];
    setEvents(newEvents);
  };

  const handleAddNoticeClick = () => {
    setIsAddNoticeOpen(true);
  };

  const handleCalendarClick = () => {
    setIsCalendarOpen(true);
  };

  const handleDeleteNotice = (id: string) => {
    const updatedNotices = notices.filter(notice => notice.id !== id);
    setNotices(updatedNotices);
    
    // Also remove from events if it's an event
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
  };

  const filteredItems = activeCategory === 'Events' 
    ? events.map(event => ({
        id: event.id,
        title: event.title,
        content: event.description,
        category: 'Events',
        priority: 'Medium',
        date: event.date.toString(),
        author: 'Calendar',
      }))
    : notices.filter(notice => {
        const matchesCategory = activeCategory === 'All' || notice.category === activeCategory;
        const matchesSearch = searchQuery === '' || 
          notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notice.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });

  const handleAddNotice = (newNotice: Omit<Notice, 'id' | 'date'>, files: File[]) => {
    const notice: Notice = {
      ...newNotice,
      id: (notices.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
    };
    setNotices([notice, ...notices]);
    setIsAddNoticeOpen(false);
  };

  // Refractored Code
  const secretUint8Array = new TextEncoder().encode('secret');

  const authUserToken = localStorage.getItem('authToken')

  async function verifyUserInfo(){
    try{

      const {payload} = await jose.jwtVerify(authUserToken, secretUint8Array)
      setIsUserAuthenticated(true)
    }catch(e){
      console.log('An error occured in authenticating user')
    }
  }
  if(authUserToken) { verifyUserInfo()}
  // const verifyToken = jwt.verify(userEmail, process.env.JWT_SECRET || 'secret')

  // console.log('this is', process.env)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onAddNotice={handleAddNoticeClick}
        onCalendarClick={handleCalendarClick}
        onFeedbackClick={() => setIsFeedbackOpen(true)}
        eventCount={events.length}
        notices={notices}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          viewMode={viewMode} 
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLoginClick={() => {
            setAuthMessage('');
            setIsAuthModalOpen(true);
          }}
          isAuthenticated={isAuthenticated}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <NoticeList 
            notices={filteredItems} 
            viewMode={viewMode}
            onDeleteNotice={handleDeleteNotice}
          />
        </main>
      </div>
      <AddNoticeModal
        isOpen={isAddNoticeOpen}
        onClose={() => setIsAddNoticeOpen(false)}
        onSubmit={handleAddNotice}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthMessage('');
        }}
        message={authMessage}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onAddEvent={handleAddEvent}
        events={events}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}

export default App;