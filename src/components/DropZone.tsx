import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  isProcessing: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped, isProcessing }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const glbFiles: File[] = [];
      
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const item = e.dataTransfer.items[i];
          if (item.kind === 'file' && (item.type === 'model/gltf-binary' || item.getAsFile()?.name.endsWith('.glb'))) {
            const file = item.getAsFile();
            if (file) glbFiles.push(file);
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          if (file.type === 'model/gltf-binary' || file.name.endsWith('.glb')) {
            glbFiles.push(file);
          }
        }
      }

      if (glbFiles.length > 0) {
        onFilesDropped(glbFiles);
      }
    },
    [onFilesDropped]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const glbFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'model/gltf-binary' || file.name.endsWith('.glb')) {
          glbFiles.push(file);
        }
      }

      if (glbFiles.length > 0) {
        onFilesDropped(glbFiles);
      }

      // Reset input value so the same file can be selected again
      e.target.value = '';
    },
    [onFilesDropped]
  );

  return (
    <div
      className={`w-full p-8 border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center rounded-lg cursor-pointer ${
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept=".glb"
        multiple
        onChange={handleFileInputChange}
      />
      <label htmlFor="fileInput" className="w-full h-full cursor-pointer flex flex-col items-center">
        <Upload
          className={`w-16 h-16 mb-4 ${
            isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        />
        <div className="text-center">
          <p className="text-lg font-medium mb-1">
            {isProcessing ? 'Processing...' : 'Drop GLB files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isProcessing 
              ? 'Please wait while we process your models' 
              : 'Drag & drop GLB files or click to select'}
          </p>
        </div>
      </label>
    </div>
  );
};

export default DropZone;