import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

type NotificationType = 'success' | 'error';

interface NotificationMessageProps {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

const NotificationMessage: React.FC<NotificationMessageProps> = ({
  type,
  message,
  isVisible,
  onDismiss,
  autoDismiss = true,
  duration = 5000
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isVisible && autoDismiss) {
      timer = setTimeout(() => {
        onDismiss();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, autoDismiss, duration, onDismiss]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800'
  };

  const Icon = type === 'success' ? CheckCircle : AlertTriangle;
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md animate-fade-in ${
        typeStyles[type]
      } border-l-4 p-4 rounded shadow-lg`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`${iconColor} h-5 w-5`} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            type="button"
            className={`${
              type === 'success' ? 'text-green-500' : 'text-red-500'
            } hover:opacity-75 focus:outline-none`}
            onClick={onDismiss}
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationMessage;