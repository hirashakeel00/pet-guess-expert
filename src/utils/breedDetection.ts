
import { pipeline } from '@huggingface/transformers';

interface BreedResult {
  breed: string;
  confidence: number;
}

let classifier: any = null;

const initializeClassifier = async () => {
  if (!classifier) {
    try {
      // Try WebGPU first (better performance if available)
      classifier = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
        { device: 'webgpu' }
      );
    } catch (error) {
      console.log('WebGPU not available, falling back to WebAssembly');
      try {
        // Fall back to WebAssembly if WebGPU is not available
        classifier = await pipeline(
          'image-classification',
          'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
          { device: 'wasm' }
        );
      } catch (secondError) {
        console.error('Failed to initialize model with both WebGPU and WebAssembly:', secondError);
        throw new Error('Could not initialize model with supported device');
      }
    }
  }
  return classifier;
};

export const detectBreed = async (
  imageFile: File
): Promise<{ results: BreedResult[]; petType: 'dog' | 'cat' }> => {
  try {
    // Initialize model with proper device
    const classifier = await initializeClassifier();
    
    // Convert File to URL for the model
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Get predictions from the model
    const predictions = await classifier(imageUrl);
    console.log('Raw predictions:', predictions);
    
    // Process predictions - we need to be more flexible with labels since the model
    // might not directly label as "cat" or "dog"
    const petRelatedPredictions = predictions.filter((pred: any) => {
      const label = pred.label.toLowerCase();
      // Include common pet-related terms
      return label.includes('cat') || 
             label.includes('dog') || 
             label.includes('retriever') || 
             label.includes('shepherd') || 
             label.includes('terrier') || 
             label.includes('siamese') || 
             label.includes('persian');
    });
    
    // If no pet-related predictions, use top predictions
    const resultsToUse = petRelatedPredictions.length > 0 
      ? petRelatedPredictions 
      : predictions.slice(0, 3);
    
    const results = resultsToUse.map((pred: any) => ({
      breed: pred.label.split(',')[0].trim(), // Take first part of label
      confidence: pred.score
    })).slice(0, 3); // Take top 3 results
    
    // Determine if it's a cat or dog based on label analysis
    // This is a simplified heuristic
    const topPrediction = predictions[0].label.toLowerCase();
    let petType: 'dog' | 'cat' = 'dog'; // Default to dog
    
    if (topPrediction.includes('cat') || 
        topPrediction.includes('siamese') || 
        topPrediction.includes('persian') || 
        topPrediction.includes('tabby')) {
      petType = 'cat';
    }
    
    // Clean up the URL
    URL.revokeObjectURL(imageUrl);
    
    return {
      results: results.length > 0 ? results : [{ breed: 'Unknown', confidence: 0 }],
      petType
    };
  } catch (error) {
    console.error('Error detecting breed:', error);
    return {
      results: [{ breed: 'Detection failed', confidence: 0 }],
      petType: 'dog' // Default fallback
    };
  }
};
