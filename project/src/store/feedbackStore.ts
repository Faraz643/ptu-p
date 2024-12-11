import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Feedback {
  id: string;
  rating: number;
  category: string;
  feedback: string;
  timestamp: string;
}

interface FeedbackState {
  feedbacks: Feedback[];
  isSubmitting: boolean;
  error: string | null;
  addFeedback: (feedback: Feedback) => Promise<void>;
  setError: (error: string | null) => void;
  setSubmitting: (isSubmitting: boolean) => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  devtools((set) => ({
    feedbacks: [],
    isSubmitting: false,
    error: null,
    addFeedback: async (feedback) => {
      set({ isSubmitting: true, error: null });
      try {
        const response = await fetch('http://localhost:3000/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedback),
        });

        if (!response.ok) {
          throw new Error('Failed to submit feedback');
        }

        set((state) => ({
          feedbacks: [...state.feedbacks, feedback],
          isSubmitting: false,
        }));
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to submit feedback',
          isSubmitting: false,
        });
      }
    },
    setError: (error) => set({ error }),
    setSubmitting: (isSubmitting) => set({ isSubmitting }),
  }))
);