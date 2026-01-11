import React, { useState, useEffect } from 'react';

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  onReload?: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  onReload 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 max-w-sm flex items-start">
        <div className="flex-1">
          <p className="text-white text-sm">{message}</p>
        </div>
        <div className="ml-4 flex gap-2">
          {onReload && (
            <button
              onClick={onReload}
              className="px-3 py-1 bg-accent-primary text-white text-xs rounded hover:bg-accent-primary/90 transition-colors"
            >
              Reload
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;