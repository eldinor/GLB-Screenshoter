import React, { useState, useCallback } from 'react';
import { Cuboid as Cube } from 'lucide-react';
import DropZone from './components/DropZone';
import ModelGallery from './components/ModelGallery';
import PreviewModal from './components/PreviewModal';
import Settings from './components/Settings';
import { ModelFile, ScreenshotDimensions } from './types';

function App() {
  const [models, setModels] = useState<ModelFile[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState({ hex: '#000000', alpha: 0 });
  const [screenshotDimensions, setScreenshotDimensions] = useState<ScreenshotDimensions>({
    width: 1920,
    height: 1080,
  });

  const handleFilesDropped = useCallback((files: File[]) => {
    setIsProcessing(true);
    
    const newModels = files.map((file) => ({
      id: `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
  }, []);

  const handleClearAll = useCallback(() => {
    setModels([]);
    setSelectedModel(null);
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
          <DropZone onFilesDropped={handleFilesDropped} isProcessing={isProcessing} />
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