import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Trash2, Palette, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

const BackgroundCustomizer = ({ 
  currentBackground, 
  onBackgroundChange, 
  onRemoveBackground, 
  onClose 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewBackground, setPreviewBackground] = useState(currentBackground);
  const [showCropTool, setShowCropTool] = useState(false);
  const [cropData, setCropData] = useState({
    scale: 1,
    x: 0,
    y: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const imageRef = useRef(null);

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
        setPreviewBackground(e.target.result);
        setShowCropTool(true);
        setCropData({ scale: 1, x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Crop functionality
  const handleZoomIn = () => {
    setCropData(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }));
  };

  const handleZoomOut = () => {
    setCropData(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.5) }));
  };

  const handleResetCrop = () => {
    setCropData({ scale: 1, x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropData.x, y: e.clientY - cropData.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setCropData(prev => ({ ...prev, x: newX, y: newY }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const applyCrop = () => {
    if (!imageRef.current || !cropCanvasRef.current) return;

    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Set canvas size to match preview area (16:9 aspect ratio)
    const canvasWidth = 400;
    const canvasHeight = 225;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Calculate image dimensions to maintain aspect ratio
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspect > canvasAspect) {
      // Image is wider than canvas
      drawHeight = canvasHeight;
      drawWidth = drawHeight * imgAspect;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller than canvas
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgAspect;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    }

    // Apply crop transformations
    const scaledWidth = drawWidth * cropData.scale;
    const scaledHeight = drawHeight * cropData.scale;
    const scaledOffsetX = offsetX + cropData.x;
    const scaledOffsetY = offsetY + cropData.y;

    // Draw the cropped image
    ctx.drawImage(
      img,
      scaledOffsetX, scaledOffsetY, scaledWidth, scaledHeight,
      0, 0, canvasWidth, canvasHeight
    );

    // Convert to data URL and update preview
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewBackground(croppedDataUrl);
    setShowCropTool(false);
  };

  const cancelCrop = () => {
    setShowCropTool(false);
    setCropData({ scale: 1, x: 0, y: 0 });
  };

  // Add mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const presetBackgrounds = [
    {
      name: 'Light Grey',
      url: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      type: 'gradient'
    },
    {
      name: 'Gradient Blue',
      url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      type: 'gradient'
    },
    {
      name: 'Gradient Pink',
      url: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      type: 'gradient'
    },
    {
      name: 'Gradient Purple',
      url: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
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

  const handlePresetClick = (preset) => {
    setPreviewBackground(preset.url);
  };

  const handleConfirm = () => {
    onBackgroundChange(previewBackground);
    onClose();
  };

  const handleCancel = () => {
    setPreviewBackground(currentBackground);
    onClose();
  };

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
                  onClick={() => handlePresetClick(preset)}
                  className={`relative group rounded-xl overflow-hidden h-24 border-2 transition-all ${
                    previewBackground === preset.url 
                      ? 'border-blue-400 bg-blue-400/20' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
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

          {/* Crop Tool */}
          {showCropTool && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Crop & Adjust Image</h3>
              
              {/* Crop Controls */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                
                <span className="text-white text-sm font-medium">
                  {Math.round(cropData.scale * 100)}%
                </span>
                
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                
                <div className="w-px h-6 bg-white/20"></div>
                
                <button
                  onClick={handleResetCrop}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                
                <div className="flex-1"></div>
                
                <button
                  onClick={cancelCrop}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCrop}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  Apply Crop
                </button>
              </div>

              {/* Crop Preview Area */}
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden border-2 border-white/30 bg-black/20" style={{ aspectRatio: '16/9' }}>
                  <img
                    ref={imageRef}
                    src={previewBackground}
                    alt="Crop preview"
                    className="absolute inset-0 w-full h-full object-cover cursor-move select-none"
                    style={{
                      transform: `scale(${cropData.scale}) translate(${cropData.x / cropData.scale}px, ${cropData.y / cropData.scale}px)`,
                      transformOrigin: 'center center'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    draggable={false}
                  />
                  
                  {/* Crop overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
                    <div className="absolute top-2 left-2 flex items-center gap-2 text-white text-sm">
                      <Move className="w-4 h-4" />
                      <span>Drag to position</span>
                    </div>
                  </div>
                </div>
                
                <canvas ref={cropCanvasRef} className="hidden"></canvas>
              </div>
            </div>
          )}

          {/* Preview Background */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div className="relative rounded-xl overflow-hidden h-32 border border-white/20">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  background: previewBackground.startsWith('linear-gradient') || previewBackground.startsWith('radial-gradient')
                    ? previewBackground
                    : previewBackground.startsWith('data:') || previewBackground.startsWith('http')
                      ? `url(${previewBackground})`
                      : previewBackground,
                  backgroundSize: previewBackground.startsWith('linear-gradient') || previewBackground.startsWith('radial-gradient')
                    ? 'auto'
                    : 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative z-10 flex items-center justify-center h-full">
                <button
                  onClick={() => setPreviewBackground('linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-white font-medium mb-2">Tips for Best Results:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Use high-resolution images for better quality</li>
              <li>• Images with less detail work better as backgrounds</li>
              <li>• Consider using darker images for better text readability</li>
              <li>• Use the crop tool to adjust zoom and position for perfect fit</li>
              <li>• The crop area maintains a 16:9 aspect ratio for optimal display</li>
              <li>• The app will automatically apply a glassmorphism overlay</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-white/20">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all"
            >
              Confirm Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundCustomizer;
