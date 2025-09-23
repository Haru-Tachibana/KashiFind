import React, { useState, useRef } from 'react';
import { X, Upload, Image, Trash2, Palette } from 'lucide-react';

const BackgroundCustomizer = ({ 
  currentBackground, 
  onBackgroundChange, 
  onRemoveBackground, 
  onClose 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onBackgroundChange(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const presetBackgrounds = [
    {
      name: 'Gradient Blue',
      url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      type: 'gradient'
    },
    {
      name: 'Gradient Purple',
      url: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      type: 'gradient'
    },
    {
      name: 'Gradient Sunset',
      url: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      type: 'gradient'
    },
    {
      name: 'Gradient Ocean',
      url: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      type: 'gradient'
    },
    {
      name: 'Gradient Forest',
      url: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
      type: 'gradient'
    },
    {
      name: 'Gradient Night',
      url: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
      type: 'gradient'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Customize Background</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Upload Your Image</h3>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-400/10' 
                  : 'border-white/30 hover:border-white/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <p className="text-white text-lg font-medium">
                    {dragActive ? 'Drop your image here' : 'Drag & drop your image here'}
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    or click to browse files
                  </p>
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>

          {/* Preset Backgrounds */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Preset Backgrounds</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {presetBackgrounds.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => onBackgroundChange(preset.url)}
                  className="relative group rounded-xl overflow-hidden h-24 border-2 border-white/20 hover:border-white/40 transition-all"
                  style={{
                    background: preset.url
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <span className="text-white font-medium text-sm text-center px-2">
                      {preset.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Background Preview */}
          {currentBackground && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Current Background</h3>
              <div className="relative rounded-xl overflow-hidden h-32 border border-white/20">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: currentBackground.startsWith('data:') || currentBackground.startsWith('http')
                      ? `url(${currentBackground})`
                      : currentBackground
                  }}
                ></div>
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 flex items-center justify-center h-full">
                  <button
                    onClick={onRemoveBackground}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Background
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-white font-medium mb-2">Tips for Best Results:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Use high-resolution images for better quality</li>
              <li>• Images with less detail work better as backgrounds</li>
              <li>• Consider using darker images for better text readability</li>
              <li>• The app will automatically apply a glassmorphism overlay</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundCustomizer;
