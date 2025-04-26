
import { pipeline } from '@huggingface/transformers';

interface BreedResult {
  breed: string;
  confidence: number;
}

let classifier: any = null;

const initializeClassifier = async () => {
  if (!classifier) {
    classifier = await pipeline(
      'image-classification',
      'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
      { device: 'cpu' }
    );
  }
  return classifier;
};

export const detectBreed = async (
  imageFile: File
): Promise<{ results: BreedResult[]; petType: 'dog' | 'cat' }> => {
  try {
    const classifier = await initializeClassifier();
    
    // Convert File to URL for the model
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Get predictions from the model
    const predictions = await classifier(imageUrl);
    
    // Process and filter predictions
    const results = predictions
      .filter((pred: any) => {
        const label = pred.label.toLowerCase();
        return label.includes('cat') || label.includes('dog');
      })
      .map((pred: any) => ({
        breed: pred.label.split(',')[0], // Take first part of label
        confidence: pred.score
      }))
      .slice(0, 3); // Take top 3 results

    // Determine if it's a cat or dog based on highest confidence prediction
    const topPrediction = predictions[0].label.toLowerCase();
    const petType = topPrediction.includes('cat') ? 'cat' : 'dog';

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
