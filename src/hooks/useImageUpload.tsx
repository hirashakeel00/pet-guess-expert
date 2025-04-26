
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ImageUploadResult {
  imageUrl: string | null;
  file: File | null;
}

export const useImageUpload = () => {
  const [imageData, setImageData] = useState<ImageUploadResult>({
    imageUrl: null,
    file: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetImage = useCallback(() => {
    if (imageData.imageUrl) {
      URL.revokeObjectURL(imageData.imageUrl);
    }
    setImageData({ imageUrl: null, file: null });
  }, [imageData.imageUrl]);

  const handleImageUpload = useCallback((file: File) => {
    setIsLoading(true);
    
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      setIsLoading(false);
      return;
    }

    // Size validation (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      setIsLoading(false);
      return;
    }

    // Revoke previous URL if it exists
    if (imageData.imageUrl) {
      URL.revokeObjectURL(imageData.imageUrl);
    }

    const url = URL.createObjectURL(file);
    setImageData({
      imageUrl: url,
      file: file
    });
    setIsLoading(false);
    
    // Notify user that the first detection might take longer
    if (!window.modelInitialized) {
      toast.info('First detection might take a few moments while the AI model loads');
      window.modelInitialized = true;
    }
  }, [imageData.imageUrl]);

  return {
    imageData,
    isLoading,
    handleImageUpload,
    resetImage
  };
};
