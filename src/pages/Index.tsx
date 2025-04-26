
import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import UploadForm from '@/components/UploadForm';
import BreedResult from '@/components/BreedResult';
import PetHistory, { PetHistoryItem } from '@/components/PetHistory';
import { useImageUpload } from '@/hooks/useImageUpload';
import { detectBreed } from '@/utils/breedDetection';
import { toast } from 'sonner';

const Index = () => {
  const { imageData, isLoading: isUploadLoading, handleImageUpload, resetImage } = useImageUpload();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState<{
    results: Array<{ breed: string; confidence: number }>;
    petType: 'dog' | 'cat';
  } | null>(null);
  const [history, setHistory] = useState<PetHistoryItem[]>([]);

  const handleAnalyze = useCallback(async () => {
    if (!imageData.file) return;

    setIsDetecting(true);
    try {
      const results = await detectBreed(imageData.file);
      setDetectionResults(results);
      
      // Add to history
      const newHistoryItem: PetHistoryItem = {
        id: Date.now().toString(),
        imageUrl: imageData.imageUrl!,
        timestamp: new Date(),
        breed: results.results[0].breed,
        confidence: results.results[0].confidence,
        petType: results.petType
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 7)]);
      
      toast.success(`Identified as ${results.petType}: ${results.results[0].breed}`);
    } catch (error) {
      console.error("Error detecting breed:", error);
      toast.error("Failed to detect pet breed. Please try again.");
    } finally {
      setIsDetecting(false);
    }
  }, [imageData]);

  const handleSelectHistory = (item: PetHistoryItem) => {
    if (imageData.imageUrl && imageData.imageUrl !== item.imageUrl) {
      resetImage();
    }
    
    // Create a new detection result from history item
    setDetectionResults({
      results: [{ breed: item.breed, confidence: item.confidence }],
      petType: item.petType
    });
    
    // Set the image without triggering file upload
    if (imageData.imageUrl !== item.imageUrl) {
      URL.revokeObjectURL(imageData.imageUrl!);
    }
  };

  const handleReset = () => {
    resetImage();
    setDetectionResults(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-primary/5">
      <Header />
      
      <main className="flex-1 container py-8 px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Pet Breed Detector</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a photo of your dog or cat and our AI will identify the breed. 
            Get instant results and save your pet's breed information.
          </p>
        </div>
        
        <div className="space-y-6">
          <UploadForm 
            onImageUpload={handleImageUpload}
            imageData={imageData}
            isLoading={isUploadLoading || isDetecting}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
          />
          
          {detectionResults && imageData.imageUrl && (
            <BreedResult 
              results={detectionResults.results}
              petType={detectionResults.petType}
              imageUrl={imageData.imageUrl}
            />
          )}
          
          <PetHistory 
            history={history} 
            onSelectHistory={handleSelectHistory}
          />
        </div>
      </main>
      
      <footer className="py-6 border-t bg-white">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 PetDetector. Pet breed detection for educational purposes.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
