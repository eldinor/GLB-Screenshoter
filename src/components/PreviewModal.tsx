import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import ModelViewer from './ModelViewer';
import { ModelFile, ScreenshotDimensions } from '../types';

const HEADER_HEIGHT = 72; // px

interface PreviewModalProps {
  model: ModelFile | null;
  onClose: () => void;
  onScreenshotTaken: (modelId: string, screenshotUrl: string) => void;
  backgroundColor: { hex: string; alpha: number };
  screenshotDimensions: ScreenshotDimensions;
  allModelsUploaded?: boolean; // Indicates if all models are uploaded
  setProgress?: (progress: number) => void; // Function to update loading progress
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  model,
  onClose,
  onScreenshotTaken,
  backgroundColor,
  screenshotDimensions,
  allModelsUploaded = true, // Default to true for backward compatibility
  setProgress,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  // Store a reference to the engine's resize function
  const engineResizeRef = useRef<(() => void) | null>(null);

  // Callback to be passed to ModelViewer so it can register its engine.resize function
  const registerEngineResize = useCallback((resizeFn: (() => void) | null) => {
    engineResizeRef.current = resizeFn;
  }, []);

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
  };

  // ResizeObserver to watch modal size changes and call engine.resize()
  useEffect(() => {
    if (!modalRef.current) return;
    const node = modalRef.current;

    const handleResize = () => {
      if (engineResizeRef.current) {
        engineResizeRef.current();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, [modalRef]);

  // Disable body scroll when modal is open and all models are uploaded
  useEffect(() => {
    if (model && allModelsUploaded) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [model, allModelsUploaded]);

  // Listen for model loading state from ModelViewer
  const handleModelLoadingChange = (loading: boolean) => {
    setIsModelLoading(loading);
  };

  if (!model) return null;

  // Hide modal overlay with CSS while model is loading
  const modalHidden = isModelLoading ? 'hidden' : '';

  const isPreview = !model.isLoading;

  return (
    <div 
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'} ${modalHidden}`}
      onClick={handleClickOutside}
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden relative ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-4xl max-h-[90vh]'
        }`}
      >
        <div className={`flex items-center justify-between p-4 border-b dark:border-gray-700 ${
          isFullscreen 
            ? 'fixed top-0 left-0 right-0 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm'
            : ''
        }`} style={isFullscreen ? { height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT } : undefined}>
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
        
        <div className={`flex-1 ${isFullscreen ? `pt-[${HEADER_HEIGHT}px]` : 'min-h-[400px] p-4'}`}>
          <ModelViewer 
            model={model} 
            onScreenshotTaken={onScreenshotTaken}
            isPreview={isPreview}
            backgroundColor={backgroundColor}
            screenshotDimensions={screenshotDimensions}
            registerEngineResize={registerEngineResize}
            setProgress={setProgress}
            onModelLoadingChange={handleModelLoadingChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
