import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, RotateCcw, Zap, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

interface ProcessedImage {
  original: string;
  processed: string;
  name: string;
}

function App() {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setProcessing(true);
    
    try {
      // Create URL for original image
      const originalUrl = URL.createObjectURL(file);
      
      // Actually remove the background using the library
      const imageBlob = await removeBackground(file);
      const processedUrl = URL.createObjectURL(imageBlob);
      
      setProcessedImage({
        original: originalUrl,
        processed: processedUrl,
        name: file.name
      });
    } catch (err) {
      console.error('Background removal failed:', err);
      setError('Failed to remove background. Please try again with a different image.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setProcessedImage(null);
    setProcessing(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage.processed;
      link.download = `bg-removed-${processedImage.name.replace(/\.[^/.]+$/, '')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Background Remover
              </h1>
              <p className="text-sm text-gray-600">Remove backgrounds instantly with AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {!processedImage && !processing ? (
          /* Upload Section */
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Remove Image Backgrounds in Seconds
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your image and watch as our AI instantly removes the background, 
              giving you a clean, professional result.
            </p>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50 scale-105'
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/30'
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
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full mb-6">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Drop your image here
                </h3>
                <p className="text-gray-600 mb-4">
                  or <span className="text-blue-600 font-medium">click to browse</span>
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, WEBP up to 10MB
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">Process images in seconds with our advanced AI technology</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
                <p className="text-gray-600 text-sm">Maintain image quality with precise edge detection</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-600 text-sm">No signup required. Just upload and download your result</p>
              </div>
            </div>
          </div>
        ) : processing ? (
          /* Processing Section */
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-spin"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Image</h3>
              <p className="text-gray-600">Our AI is removing the background...</p>
              <div className="mt-6">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Background Removed Successfully!</h2>
              <p className="text-gray-600">Compare the before and after results below</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Original Image */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Original Image
                </h3>
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden">
                  <img
                    src={processedImage.original}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Processed Image */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Background Removed
                </h3>
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden relative">
                  {/* Checkered background pattern */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(45deg, #ccc 25%, transparent 25%),
                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                      linear-gradient(-45deg, transparent 75%, #ccc 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}></div>
                  <img
                    src={processedImage.processed}
                    alt="Processed"
                    className="w-full h-full object-contain relative z-10"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownload}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                Download Result
              </button>
              <button
                onClick={handleReset}
                className="bg-white text-gray-700 px-8 py-3 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 justify-center shadow-sm hover:shadow-md"
              >
                <RotateCcw className="w-5 h-5" />
                Process Another Image
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">
            Powered by advanced AI technology for professional background removal
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;