import React from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: Date;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Notice Posted',
    message: 'A new notice has been posted in the Academics section.',
    type: 'info',
    date: new Date(),
    read: false,
  },
  {
    id: '2',
    title: 'Upcoming Event',
    message: 'Don\'t forget about the scheduled event tomorrow.',
    type: 'warning',
    date: new Date(Date.now() - 86400000),
    read: true,
  },
  {
    id: '3',
    title: 'Task Completed',
    message: 'Your assigned task has been marked as complete.',
    type: 'success',
    date: new Date(Date.now() - 172800000),
    read: false,
  },
];

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = React.useState(SAMPLE_NOTIFICATIONS);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-lg z-50">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Bell className="h-12 w-12 mb-2" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${
                    notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {new Date(notification.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}