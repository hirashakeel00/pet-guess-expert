
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUploadResult } from '@/hooks/useImageUpload';
import { Camera, Upload } from 'lucide-react';

interface UploadFormProps {
  onImageUpload: (file: File) => void;
  imageData: ImageUploadResult;
  isLoading: boolean;
  onAnalyze: () => void;
  onReset: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({
  onImageUpload,
  imageData,
  isLoading,
  onAnalyze,
  onReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImageUpload(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-xl mx-auto bg-white shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold text-center">Upload Your Pet's Photo</h2>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!imageData.imageUrl ? (
            <div 
              className="w-full h-64 border-2 border-dashed rounded-lg border-primary/40 flex flex-col items-center justify-center cursor-pointer p-4 transition-colors hover:bg-primary/5"
              onClick={handleBrowseClick}
            >
              <Upload className="h-12 w-12 text-primary/70 mb-2" />
              <p className="text-center text-muted-foreground mb-1">
                Drag and drop your image here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WEBP (max 10MB)
              </p>
            </div>
          ) : (
            <div className="w-full">
              <div className="relative w-full h-64 overflow-hidden rounded-lg">
                <img 
                  src={imageData.imageUrl} 
                  alt="Uploaded pet" 
                  className="w-full h-full object-contain" 
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={onReset}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3 w-full mt-2">
            <Button 
              onClick={handleBrowseClick} 
              variant="outline" 
              className="flex-1"
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Browse
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                if (navigator.mediaDevices) {
                  navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                      const tracks = stream.getTracks();
                      tracks.forEach(track => track.stop());
                      
                      // For simplicity, we're just opening the file dialog
                      // In a real app, you'd implement a camera capture UI
                      handleBrowseClick();
                    })
                    .catch(err => {
                      console.error("Camera access error:", err);
                      handleBrowseClick();
                    });
                } else {
                  handleBrowseClick();
                }
              }}
              disabled={isLoading}
            >
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </Button>
          </div>

          <Button 
            onClick={onAnalyze} 
            className="w-full" 
            disabled={!imageData.imageUrl || isLoading}
          >
            {isLoading ? 
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span> 
              : 'Detect Breed'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadForm;
