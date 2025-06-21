
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

// Comprehensive list of dog breeds the model can detect
const DOG_BREEDS = [
  'golden retriever', 'labrador retriever', 'german shepherd', 'beagle', 'bulldog',
  'poodle', 'rottweiler', 'yorkshire terrier', 'boxer', 'siberian husky',
  'chihuahua', 'dachshund', 'great dane', 'boston terrier', 'shih tzu',
  'border collie', 'australian shepherd', 'cocker spaniel', 'french bulldog',
  'mastiff', 'saint bernard', 'doberman', 'weimaraner', 'bloodhound',
  'afghan hound', 'basset hound', 'brittany spaniel', 'chesapeake bay retriever',
  'collie', 'english setter', 'irish setter', 'pointer', 'vizsla',
  'whippet', 'borzoi', 'saluki', 'rhodesian ridgeback', 'norwegian elkhound',
  'keeshond', 'schipperke', 'pomeranian', 'papillon', 'toy terrier',
  'wire-haired fox terrier', 'lakeland terrier', 'sealyham terrier',
  'airedale', 'cairn', 'australian terrier', 'dandie dinmont',
  'border terrier', 'kerry blue terrier', 'irish terrier',
  'norfolk terrier', 'norwich terrier', 'scottish terrier',
  'tibetan terrier', 'silky terrier', 'soft-coated wheaten terrier',
  'west highland white terrier', 'lhasa', 'flat-coated retriever',
  'curly-coated retriever', 'nova scotia duck tolling retriever',
  'sussex spaniel', 'irish water spaniel', 'kuvasz', 'schipperke'
];

// Comprehensive list of cat breeds the model can detect
const CAT_BREEDS = [
  'tabby', 'siamese', 'persian', 'egyptian cat', 'tiger cat',
  'lynx', 'catamount', 'cougar', 'leopard', 'jaguar',
  'cheetah', 'snow leopard', 'lion', 'tiger'
];

const isPetBreed = (label: string): boolean => {
  const lowerLabel = label.toLowerCase();
  
  // Check for exact matches or partial matches
  return DOG_BREEDS.some(breed => 
    lowerLabel.includes(breed) || breed.includes(lowerLabel.split(',')[0].trim())
  ) || CAT_BREEDS.some(breed => 
    lowerLabel.includes(breed) || breed.includes(lowerLabel.split(',')[0].trim())
  );
};

const determinePetType = (predictions: any[]): 'dog' | 'cat' => {
  // Look through top predictions to determine pet type
  for (const pred of predictions.slice(0, 5)) {
    const label = pred.label.toLowerCase();
    
    // Cat indicators
    if (CAT_BREEDS.some(breed => label.includes(breed))) {
      return 'cat';
    }
    
    // Dog indicators  
    if (DOG_BREEDS.some(breed => label.includes(breed))) {
      return 'dog';
    }
  }
  
  // Default to dog if unclear
  return 'dog';
};

const cleanBreedName = (label: string): string => {
  // Take first part before comma and clean it up
  let breed = label.split(',')[0].trim();
  
  // Capitalize first letter of each word
  breed = breed.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  return breed;
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
    
    // Filter for pet-related predictions
    const petRelatedPredictions = predictions.filter((pred: any) => 
      isPetBreed(pred.label)
    );
    
    // If we found pet-related predictions, use them. Otherwise, use top predictions
    // as they might still be relevant (the model might use different naming)
    const resultsToUse = petRelatedPredictions.length > 0 
      ? petRelatedPredictions 
      : predictions.slice(0, 5);
    
    const results = resultsToUse.map((pred: any) => ({
      breed: cleanBreedName(pred.label),
      confidence: pred.score
    })).slice(0, 5); // Take top 5 results for more options
    
    // Determine pet type based on predictions
    const petType = determinePetType(predictions);
    
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
