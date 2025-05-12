import React, { useState, useCallback } from 'react';
import { Cuboid as Cube } from 'lucide-react';
import DropZone from './components/DropZone';
import ModelGallery from './components/ModelGallery';
import PreviewModal from './components/PreviewModal';
import Settings from './components/Settings';
import { ModelFile, ScreenshotDimensions } from './types';

// ProgressBar component with fixed height to prevent layout shift
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full max-w-lg mx-auto mt-4 mb-4" style={{ minHeight: 32 }}>
    <div
      className={`w-full bg-gray-200 rounded h-4 overflow-hidden transition-opacity duration-200 ${
        progress > 0 && progress < 100 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="bg-blue-600 h-4 transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
    <div
      className={`text-center text-sm text-gray-700 dark:text-gray-300 mt-1 transition-opacity duration-200 ${
        progress > 0 && progress < 100 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ minHeight: 20 }}
    >
      {progress < 100 && progress > 0 ? `Processing: ${progress}%` : '\u00A0'}
    </div>
  </div>
);

function App() {
  const [models, setModels] = useState<ModelFile[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState({ hex: '#000000', alpha: 0 });
  const [screenshotDimensions, setScreenshotDimensions] = useState<ScreenshotDimensions>({
    width: 1920,
    height: 1080,
  });
  const [progress, setProgress] = useState<number>(0);

  const handleFilesDropped = useCallback((files: File[]) => {
    setIsProcessing(true);
    setProgress(0);
    
    const newModels = files.map((file) => ({
      id: `model-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      screenshotUrl: null,
      isLoading: true,
    }));
    
    setModels((prevModels) => [...prevModels, ...newModels]);
    
    if (newModels.length > 0) {
      setSelectedModel(newModels[0]);
    }
    
    setIsProcessing(false);
  }, []);

  const handleScreenshotTaken = useCallback((modelId: string, screenshotUrl: string) => {
    setModels((prevModels) =>
      prevModels.map((model) =>
        model.id === modelId
          ? { ...model, screenshotUrl, isLoading: false }
          : model
      )
    );
    
    if (selectedModel) {
      const currentIndex = models.findIndex(model => model.id === selectedModel.id);
      const nextModel = models[currentIndex + 1];
      
      if (nextModel && nextModel.isLoading) {
        setTimeout(() => {
          setSelectedModel(nextModel);
        }, 300);
      } else {
        setSelectedModel(null);
        setProgress(0); // Reset progress when done
      }
    }
  }, [models, selectedModel]);

  const handleRemoveModel = useCallback((id: string) => {
    setModels((prevModels) => prevModels.filter((model) => model.id !== id));
    
    if (selectedModel && selectedModel.id === id) {
      setSelectedModel(null);
    }
  }, [selectedModel]);

  const handlePreviewModel = useCallback((model: ModelFile) => {
    setSelectedModel(model);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedModel(null);
    setProgress(0);
  }, []);

  const handleClearAll = useCallback(() => {
    setModels([]);
    setSelectedModel(null);
    setProgress(0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Cube className="text-blue-600 dark:text-blue-500 w-8 h-8 mr-3" />
              <h1 className="text-2xl font-bold">GLB ScreenShoter</h1>
            </div>
            <Settings
              backgroundColor={backgroundColor}
              onBackgroundColorChange={setBackgroundColor}
              screenshotDimensions={screenshotDimensions}
              onScreenshotDimensionsChange={setScreenshotDimensions}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-4xl">
            Upload and preview your 3D models. Simply drag and drop GLB files or click to select them. 
            A screenshot will be automatically generated for each model. One may change background color, opacity and screenshot size in Settings.
          </p>
        </header>
        
        <main>
          <ProgressBar progress={progress} />
          <DropZone onFilesDropped={handleFilesDropped} isProcessing={isProcessing || (progress > 0 && progress < 100)} />
          <ModelGallery 
            models={models} 
            onRemoveModel={handleRemoveModel}
            onPreviewModel={handlePreviewModel}
            onClearAll={handleClearAll}
          />
        </main>
        
        <PreviewModal
          model={selectedModel}
          onClose={handleCloseModal}
          onScreenshotTaken={handleScreenshotTaken}
          backgroundColor={backgroundColor}
          screenshotDimensions={screenshotDimensions}
          setProgress={setProgress}
        />

        <footer className="mt-8 text-right">
          <a 
            href="https://babylonpress.org/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Created by BabylonPress
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
