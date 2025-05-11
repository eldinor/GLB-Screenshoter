import React from 'react';
import { ModelFile } from '../types';
import { Download, Trash2, Eye, Image } from 'lucide-react';

interface ModelCardProps {
  model: ModelFile;
  onRemove: (id: string) => void;
  onPreview: (model: ModelFile) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onRemove, onPreview }) => {
  const handleDownloadScreenshot = () => {
    if (!model.screenshotUrl) return;
    
    const a = document.createElement('a');
    a.href = model.screenshotUrl;
    a.download = `${model.name.replace('.glb', '')}_screenshot.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className="relative group">
        {model.isLoading ? (
          <div className="flex items-center justify-center w-full h-40 bg-gray-100 dark:bg-gray-700">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : model.screenshotUrl ? (
          <>
            <img 
              src={model.screenshotUrl} 
              alt={model.name} 
              className="w-full h-40 object-cover"
            />
            <button
              onClick={() => onPreview(model)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              <Eye className="w-6 h-6 mr-2" />
              Preview Model
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-40 bg-gray-100 dark:bg-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No preview</p>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-medium text-gray-900 dark:text-white truncate" title={model.name}>
            {model.name}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {formatFileSize(model.file.size)}
          </span>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={handleDownloadScreenshot}
            disabled={!model.screenshotUrl || model.isLoading}
            className={`flex items-center text-sm rounded-md px-3 py-1.5 ${
              !model.screenshotUrl || model.isLoading
                ? 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700 cursor-not-allowed'
                : 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50'
            }`}
          >
            <Image className="w-4 h-4 mr-1.5" />
            Screenshot
          </button>
          
          <button
            onClick={() => onRemove(model.id)}
            className="flex items-center text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md px-3 py-1.5 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;