
import { pipeline } from '@huggingface/transformers';

let classifier = null;

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

const isPetBreed = (label) => {
  const lowerLabel = label.toLowerCase();
  
  return DOG_BREEDS.some(breed => 
    lowerLabel.includes(breed) || breed.includes(lowerLabel.split(',')[0].trim())
  ) || CAT_BREEDS.some(breed => 
    lowerLabel.includes(breed) || breed.includes(lowerLabel.split(',')[0].trim())
  );
};

const determinePetType = (predictions) => {
  for (const pred of predictions.slice(0, 5)) {
    const label = pred.label.toLowerCase();
    
    if (CAT_BREEDS.some(breed => label.includes(breed))) {
      return 'cat';
    }
    
    if (DOG_BREEDS.some(breed => label.includes(breed))) {
      return 'dog';
    }
  }
  
  return 'dog';
};

const cleanBreedName = (label) => {
  let breed = label.split(',')[0].trim();
  
  breed = breed.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  return breed;
};

export const detectBreed = async (imageFile) => {
  try {
    const classifier = await initializeClassifier();
    
    const imageUrl = URL.createObjectURL(imageFile);
    
    const predictions = await classifier(imageUrl);
    console.log('Raw predictions:', predictions);
    
    const petRelatedPredictions = predictions.filter(pred => 
      isPetBreed(pred.label)
    );
    
    const resultsToUse = petRelatedPredictions.length > 0 
      ? petRelatedPredictions 
      : predictions.slice(0, 5);
    
    const results = resultsToUse.map(pred => ({
      breed: cleanBreedName(pred.label),
      confidence: pred.score
    })).slice(0, 5);
    
    const petType = determinePetType(predictions);
    
    URL.revokeObjectURL(imageUrl);
    
    return {
      results: results.length > 0 ? results : [{ breed: 'Unknown', confidence: 0 }],
      petType
    };
  } catch (error) {
    console.error('Error detecting breed:', error);
    return {
      results: [{ breed: 'Detection failed', confidence: 0 }],
      petType: 'dog'
    };
  }
};
