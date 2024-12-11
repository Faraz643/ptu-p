import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'task' | 'event';
}

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Event) => void;
  events: Event[];
}

export default function CalendarModal({ isOpen, onClose, onAddEvent, events }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'event' as const,
  });

  // Cleanup effect
  useEffect(() => {
    return () => {
      setShowEventForm(false);
      setSelectedDate(null);
    };
  }, []);

  if (!isOpen) return null;

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return selectedDate?.getDate() === day &&
      selectedDate?.getMonth() === currentDate.getMonth() &&
      selectedDate?.getFullYear() === currentDate.getFullYear();
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && newEvent.title) {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        date: selectedDate,
        type: newEvent.type,
      };
      onAddEvent(event);
      setNewEvent({ title: '', description: '', type: 'event' });
      setShowEventForm(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length === 0) {
      setShowEventForm(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calendar</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10" />
            ))}
            {days.map(day => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dateEvents = getEventsForDate(date);
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(date)}
                  className={`
                    h-10 rounded-full flex items-center justify-center text-sm relative
                    ${isToday(day) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200' : ''}
                    ${isSelected(day) ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                    ${dateEvents.length > 0 ? 'font-bold' : ''}
                  `}
                >
                  {day}
                  {dateEvents.length > 0 && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && !showEventForm && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Events for {selectedDate.toLocaleDateString()}
              </h4>
              <button
                onClick={() => setShowEventForm(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <h5 className="font-medium">{event.title}</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                  </div>
                </div>
              ))}
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">No events scheduled</div>
              )}
            </div>
          </div>
        )}

        {showEventForm && selectedDate && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as 'task' | 'event' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="event">Event</option>
                  <option value="task">Task</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}