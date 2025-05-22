import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { ModelFile, ScreenshotDimensions } from '../types';

interface PreviewModalProps {
  model: ModelFile | null;
  onClose: () => void;
  onScreenshotTaken: (modelId: string, screenshotUrl: string) => void;
  backgroundColor: { hex: string; alpha: number };
  screenshotDimensions: ScreenshotDimensions;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  model,
  onClose,
  onScreenshotTaken,
  backgroundColor,
  screenshotDimensions
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  
  // Function to show header and set timeout to hide it
  const showHeaderTemporarily = () => {
    setHeaderVisible(true);
    
    if (isFullscreen) {
      // Clear any existing timeout
      if (window.headerTimeout) {
        clearTimeout(window.headerTimeout);
      }
      
      // Set new timeout
      window.headerTimeout = setTimeout(() => {
        setHeaderVisible(false);
      }, 3000);
    }
  };
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isFullscreen]);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === e.currentTarget && !isFullscreen) {
      onClose();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setHeaderVisible(true);
    
    // Clear any existing timeout when toggling fullscreen
    if (window.headerTimeout) {
      clearTimeout(window.headerTimeout);
      window.headerTimeout = undefined;
    }
  };

  // Handle mouse movement to show/hide header
  useEffect(() => {
    if (!isFullscreen) {
      setHeaderVisible(true);
      return;
    }
    
    const handleMouseMove = () => {
      showHeaderTemporarily();
    };
    
    const handleClick = () => {
      showHeaderTemporarily();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      
      if (window.headerTimeout) {
        clearTimeout(window.headerTimeout);
        window.headerTimeout = undefined;
      }
    };
  }, [isFullscreen]);

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (window.headerTimeout) {
        clearTimeout(window.headerTimeout);
        window.headerTimeout = undefined;
      }
    };
  }, []);

  if (!model) return null;

  const isPreview = !model.isLoading;

  return (
    <div 
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}
      onClick={handleClickOutside}
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-4xl max-h-[90vh]'
        }`}
      >
        {/* Fullscreen container with relative positioning */}
        <div className={`${isFullscreen ? 'relative w-full h-full' : 'flex-1 flex flex-col'}`}>
          {/* Header */}
          <div 
            className={`flex items-center justify-between p-4 border-b dark:border-gray-700 ${
              isFullscreen 
                ? 'absolute top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-opacity duration-300' 
                : ''
            } ${isFullscreen && !headerVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <h3 className="font-medium text-lg text-gray-900 dark:text-white truncate pr-4">
              {model.name}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleFullscreen}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-6 h-6" />
                ) : (
                  <Maximize2 className="w-6 h-6" />
                )}
              </button>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Canvas container */}
          <div 
            className={`${
              isFullscreen 
                ? 'absolute inset-0' 
                : 'flex-1 min-h-[400px] p-4'
            }`}
            onClick={isFullscreen ? showHeaderTemporarily : undefined}
          >
            <ModelViewer 
              model={model} 
              onScreenshotTaken={onScreenshotTaken}
              isPreview={isPreview}
              backgroundColor={backgroundColor}
              screenshotDimensions={screenshotDimensions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this to global.d.ts or directly extend the Window interface
declare global {
  interface Window {
    headerTimeout?: NodeJS.Timeout;
  }
}

export default PreviewModal;
