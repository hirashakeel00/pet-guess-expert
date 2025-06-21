
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
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          {petType === 'dog' ? (
            <Dog className="h-5 w-5 text-primary" />
          ) : (
            <Cat className="h-5 w-5 text-primary" />
          )}
          {petType === 'dog' ? 'Dog' : 'Cat'} Breed Detection Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-1/3 rounded-lg overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Pet" 
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-primary mb-1">
                Most Likely: {results[0]?.breed || 'Unknown'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Confidence: {results[0] ? formatConfidence(results[0].confidence) : 'N/A'}
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                All Possible Breeds:
              </h4>
              {results.slice(0, 5).map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={index === 0 ? 'font-medium' : ''}>{result.breed}</span>
                    <span className="font-medium">{formatConfidence(result.confidence)}</span>
                  </div>
                  <Progress 
                    value={result.confidence * 100} 
                    className={`h-2 ${index === 0 ? 'bg-primary/20' : 'bg-muted'}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> This AI model can detect 60+ dog breeds and 14+ cat breeds. 
                Results are ranked by confidence - higher percentages indicate more certainty.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedResult;
