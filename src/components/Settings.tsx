import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { ScreenshotDimensions } from '../types';

interface Color {
  hex: string;
  alpha: number;
}

interface SettingsProps {
  backgroundColor: Color;
  onBackgroundColorChange: (color: Color) => void;
  screenshotDimensions: ScreenshotDimensions;
  onScreenshotDimensionsChange: (dimensions: ScreenshotDimensions) => void;
}

const Settings: React.FC<SettingsProps> = ({
  backgroundColor,
  onBackgroundColorChange,
  screenshotDimensions,
  onScreenshotDimensionsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (hex: string) => {
    onBackgroundColorChange({ ...backgroundColor, hex });
  };

  const handleAlphaChange = (alpha: number) => {
    onBackgroundColorChange({ ...backgroundColor, alpha: Math.min(1, Math.max(0, alpha)) });
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onScreenshotDimensionsChange({
        ...screenshotDimensions,
        [dimension]: numValue,
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Settings"
      >
        <Settings2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Settings</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Scene Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={backgroundColor.hex}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor.hex}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded dark:border-gray-600 dark:bg-gray-700"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      title="Hex color code (e.g., #000000)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Opacity: {Math.round(backgroundColor.alpha * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={backgroundColor.alpha * 100}
                      onChange={(e) => handleAlphaChange(Number(e.target.value) / 100)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Screenshot Dimensions
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={screenshotDimensions.width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        min="100"
                        max="3840"
                        className="w-full px-2 py-1 text-sm border rounded dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={screenshotDimensions.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        min="100"
                        max="2160"
                        className="w-full px-2 py-1 text-sm border rounded dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;