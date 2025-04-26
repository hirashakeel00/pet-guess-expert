
import React from 'react';
import { Cat, Dog } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Cat className="h-8 w-8 text-primary absolute -left-1 -top-1" />
            <Dog className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            PetDetector
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          AI-Powered Pet Breed Identification
        </div>
      </div>
    </header>
  );
};

export default Header;
