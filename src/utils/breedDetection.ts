
// This file would typically integrate with an actual ML model API
// For now, we'll use a mock implementation

interface BreedResult {
  breed: string;
  confidence: number;
}

// Mock data for demonstration
const dogBreeds: BreedResult[] = [
  { breed: "Labrador Retriever", confidence: 0.92 },
  { breed: "Golden Retriever", confidence: 0.88 },
  { breed: "German Shepherd", confidence: 0.85 },
  { breed: "Bulldog", confidence: 0.82 },
  { breed: "Beagle", confidence: 0.78 },
  { breed: "Poodle", confidence: 0.75 },
];

const catBreeds: BreedResult[] = [
  { breed: "Siamese", confidence: 0.94 },
  { breed: "Persian", confidence: 0.89 },
  { breed: "Maine Coon", confidence: 0.86 },
  { breed: "Bengal", confidence: 0.83 },
  { breed: "Ragdoll", confidence: 0.80 },
  { breed: "British Shorthair", confidence: 0.77 },
];

export const detectBreed = async (
  imageFile: File
): Promise<{ results: BreedResult[]; petType: 'dog' | 'cat' }> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Randomly decide if it's a dog or cat for the demo
      const isProbablyDog = Math.random() > 0.5;
      
      // Randomly shuffle and take top 3 breeds from the appropriate list
      const breeds = isProbablyDog ? [...dogBreeds] : [...catBreeds];
      
      // Fisher-Yates shuffle algorithm
      for (let i = breeds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [breeds[i], breeds[j]] = [breeds[j], breeds[i]];
      }
      
      // Return top 3 results
      resolve({
        results: breeds.slice(0, 3),
        petType: isProbablyDog ? 'dog' : 'cat'
      });
    }, 1500);
  });
};
