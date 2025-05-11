import React from 'react';
import { ModelFile } from '../types';
import ModelCard from './ModelCard';
import { Download, FileText, Trash2 } from 'lucide-react';
import JSZip from 'jszip';

interface ModelGalleryProps {
  models: ModelFile[];
  onRemoveModel: (id: string) => void;
  onPreviewModel: (model: ModelFile) => void;
  onClearAll: () => void;
}

const ModelGallery: React.FC<ModelGalleryProps> = ({ models, onRemoveModel, onPreviewModel, onClearAll }) => {
  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    
    // Add all screenshots to the zip
    const downloadPromises = models
      .filter(model => model.screenshotUrl && !model.isLoading)
      .map(async model => {
        try {
          const response = await fetch(model.screenshotUrl!);
          const blob = await response.blob();
          const fileName = `${model.name.replace('.glb', '')}_screenshot.png`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Failed to add ${model.name} to zip:`, error);
        }
      });

    // Wait for all downloads to complete
    await Promise.all(downloadPromises);

    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model_screenshots.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const reportContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>3D Models Report</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              max-width: 1200px;
              margin: 0 auto;
              padding: 2rem;
              background: #f8f9fa;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #2563eb;
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 2px solid #e5e7eb;
            }
            .timestamp {
              text-align: center;
              color: #6b7280;
              margin-bottom: 2rem;
              font-size: 0.875rem;
            }
            .models-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 2rem;
            }
            .model-card {
              background: white;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              transition: transform 0.2s;
            }
            .model-card:hover {
              transform: translateY(-2px);
            }
            .model-image {
              width: 100%;
              height: 200px;
              object-fit: cover;
              border-bottom: 1px solid #e5e7eb;
            }
            .model-info {
              padding: 1rem;
            }
            .model-name {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 0.25rem;
              display: flex;
              justify-content: space-between;
              align-items: baseline;
            }
            .model-size {
              font-size: 0.75rem;
              color: #6b7280;
              font-weight: normal;
            }
            .no-screenshot {
              height: 200px;
              background: #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #6b7280;
              font-size: 0.875rem;
            }
            .save-pdf-button {
              position: fixed;
              bottom: 2rem;
              right: 2rem;
              background: #2563eb;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-weight: 500;
              cursor: pointer;
              border: none;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              transition: all 0.2s;
            }
            .save-pdf-button:hover {
              background: #1d4ed8;
              transform: translateY(-1px);
            }
            .credit {
              position: fixed;
              bottom: 2rem;
              left: 2rem;
              font-size: 0.875rem;
              color: #6b7280;
            }
            .credit a {
              color: #2563eb;
              text-decoration: none;
              font-weight: 500;
            }
            .credit a:hover {
              text-decoration: underline;
            }
            @media print {
              body {
                background: white;
              }
              .model-card {
                break-inside: avoid;
                page-break-inside: avoid;
              }
              .save-pdf-button {
                display: none;
              }
              .credit {
                position: static;
                text-align: center;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #e5e7eb;
              }
            }
          </style>
        </head>
        <body>
          <h1>3D Models Report</h1>
          <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
          <div class="models-grid">
            ${models.map(model => `
              <div class="model-card">
                ${model.screenshotUrl 
                  ? `<img src="${model.screenshotUrl}" alt="${model.name}" class="model-image">`
                  : `<div class="no-screenshot">No preview available</div>`
                }
                <div class="model-info">
                  <div class="model-name">
                    ${model.name}
                    <span class="model-size">${formatFileSize(model.file.size)}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button class="save-pdf-button" onclick="window.print()">Save as PDF</button>
          <div class="credit">Created by <a href="https://babylonpress.org/" target="_blank" rel="noopener noreferrer">BabylonPress</a></div>
        </body>
      </html>
    `;

    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (models.length === 0) {
    return null;
  }

  const hasScreenshots = models.some(model => model.screenshotUrl && !model.isLoading);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Uploaded Models</h2>
        <div className="flex gap-3">
          <button
            onClick={onClearAll}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </button>
          <button
            onClick={generateReport}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            <FileText className="w-4 h-4 mr-2" />
            Download Report
          </button>
          {hasScreenshots && (
            <button
              onClick={handleDownloadAll}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All Screenshots
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {models.map((model) => (
          <ModelCard 
            key={model.id} 
            model={model} 
            onRemove={onRemoveModel}
            onPreview={onPreviewModel}
          />
        ))}
      </div>
    </div>
  );
};

export default ModelGallery;