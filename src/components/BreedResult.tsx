
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cat, Dog } from 'lucide-react';

interface BreedResultProps {
  results: Array<{
    breed: string;
    confidence: number;
  }>;
  petType: 'dog' | 'cat';
  imageUrl: string;
}

const BreedResult: React.FC<BreedResultProps> = ({ results, petType, imageUrl }) => {
  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <Card className="w-full max-w-xl mx-auto bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          {petType === 'dog' ? (
            <Dog className="h-5 w-5 text-primary" />
          ) : (
            <Cat className="h-5 w-5 text-primary" />
          )}
          {petType === 'dog' ? 'Dog' : 'Cat'} Breed Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Pet" 
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <h3 className="font-medium text-lg">
              Most likely {results[0]?.breed || 'Unknown'}
            </h3>
            
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{result.breed}</span>
                    <span className="font-medium">{formatConfidence(result.confidence)}</span>
                  </div>
                  <Progress 
                    value={result.confidence * 100} 
                    className={`h-2 ${index === 0 ? 'bg-primary/20' : 'bg-muted'}`}
                  />
                </div>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground pt-2">
              Note: Results are for demonstration purposes only. In a production app, 
              this would use an actual AI model for pet breed detection.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedResult;
