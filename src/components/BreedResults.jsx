
import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';
import { Pets } from '@mui/icons-material';

const BreedResults = ({ results, petType, imageUrl }) => {
  const formatConfidence = (confidence) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Pets color="primary" />
          <Typography variant="h6" component="h2">
            {petType === 'dog' ? 'Dog' : 'Cat'} Breed Detection Results
          </Typography>
        </Box>
        
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box sx={{ width: { xs: '100%', md: '40%' } }}>
            <img 
              src={imageUrl} 
              alt="Pet" 
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 8,
                objectFit: 'cover'
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Most Likely: {results[0]?.breed || 'Unknown'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Confidence: {results[0] ? formatConfidence(results[0].confidence) : 'N/A'}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              All Possible Breeds:
            </Typography>
            
            {results.slice(0, 5).map((result, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                    {result.breed}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatConfidence(result.confidence)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={result.confidence * 100}
                  sx={{ 
                    mt: 0.5,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'grey.200'
                  }}
                />
              </Box>
            ))}
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              <strong>Note:</strong> This AI model can detect 60+ dog breeds and 14+ cat breeds. 
              Results are ranked by confidence - higher percentages indicate more certainty.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BreedResults;
