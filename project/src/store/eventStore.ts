import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'task' | 'event';
}

interface EventState {
  events: Event[];
  addEvent: (event: Event) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  getEventsForDate: (date: Date) => Event[];
}

export const useEventStore = create<EventState>()(
  devtools(
    persist(
      (set, get) => ({
        events: [],
        addEvent: (event) =>
          set((state) => ({
            events: [...state.events, event],
          })),
        removeEvent: (id) =>
          set((state) => ({
            events: state.events.filter((event) => event.id !== id),
          })),
        updateEvent: (id, updates) =>
          set((state) => ({
            events: state.events.map((event) =>
              event.id === id ? { ...event, ...updates } : event
            ),
          })),
        getEventsForDate: (date) => {
          const { events } = get();
          return events.filter(
            (event) => event.date.toDateString() === date.toDateString()
          );
        },
      }),
      {
        name: 'event-storage',
      }
    )
  )
);