"use client";

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/lib/service-worker';
import { Button } from './ui/button';
import { X, RefreshCw } from 'lucide-react';

export function ServiceWorkerRegistration() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker({
      onUpdate: (registration) => {
        // New service worker available
        setShowUpdatePrompt(true);
      },
      onSuccess: (registration) => {
        console.log('Service Worker registered successfully');
      }
    });
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Reload the page to activate the new service worker
      window.location.reload();
    } catch (error) {
      console.error('Failed to update service worker:', error);
      setIsUpdating(false);
    }
  };

  const dismissUpdatePrompt = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            New version available
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            A new version of Campaign Master is available. Update to get the latest features.
          </p>
        </div>
        <button
          onClick={dismissUpdatePrompt}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex space-x-2 mt-3">
        <Button
          size="sm"
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex-1"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Now'
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={dismissUpdatePrompt}
        >
          Later
        </Button>
      </div>
    </div>
  );
}
