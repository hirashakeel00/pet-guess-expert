
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cat, Dog } from 'lucide-react';

export interface PetHistoryItem {
  id: string;
  imageUrl: string;
  timestamp: Date;
  breed: string;
  confidence: number;
  petType: 'dog' | 'cat';
}

interface PetHistoryProps {
  history: PetHistoryItem[];
  onSelectHistory: (item: PetHistoryItem) => void;
}

const PetHistory: React.FC<PetHistoryProps> = ({ history, onSelectHistory }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-xl mx-auto bg-white shadow-md mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Pet Scans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {history.map((item) => (
            <div 
              key={item.id}
              className="relative cursor-pointer group"
              onClick={() => onSelectHistory(item)}
            >
              <div className="aspect-square rounded-md overflow-hidden border">
                <img 
                  src={item.imageUrl} 
                  alt={item.breed} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="absolute top-1 right-1">
                {item.petType === 'dog' ? (
                  <Dog className="h-4 w-4 text-white drop-shadow-md" />
                ) : (
                  <Cat className="h-4 w-4 text-white drop-shadow-md" />
                )}
              </div>
              <div className="mt-1 text-xs text-center truncate px-1">
                {item.breed}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PetHistory;
