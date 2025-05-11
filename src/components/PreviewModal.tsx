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

  if (!model) return null;

  const isPreview = !model.isLoading;

  return (
    <div 
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}
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
          isFullscreen ? 'absolute top-0 left-0 right-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm' : ''
        }`}>
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
        
        <div className={`flex-1 ${isFullscreen ? '' : 'min-h-[400px]'} ${isFullscreen ? 'pt-[72px]' : 'p-4'}`}>
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
  );
};

export default PreviewModal;