
import React, { useState, useRef } from "react";
import { TextField, Button, Typography, Box, CircularProgress, Alert, Snackbar } from "@mui/material";
import { CloudUpload, PhotoCamera } from "@mui/icons-material";
import { detectBreed } from "../utils/breedDetection";
import BreedResults from "./BreedResults";
import "../styles/BreedDetect.css";

export default function BreedDetect() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const fileInputRef = useRef(null);

  const handleImageUpload = (file) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      setToastMessage('Please upload an image file');
      setToastSeverity('error');
      setShowToast(true);
      return;
    }

    // Size validation (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setToastMessage('Image must be smaller than 10MB');
      setToastSeverity('error');
      setShowToast(true);
      return;
    }

    // Clean up previous URL if it exists
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(url);
    setDetectionResults(null);
    
    // Notify user that the first detection might take longer
    if (!window.modelInitialized) {
      setToastMessage('First detection might take a few moments while the AI model loads');
      setToastSeverity('info');
      setShowToast(true);
      window.modelInitialized = true;
    }
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsDetecting(true);
    try {
      const results = await detectBreed(imageFile);
      setDetectionResults(results);
      
      setToastMessage(`Identified as ${results.petType}: ${results.results[0].breed}`);
      setToastSeverity('success');
      setShowToast(true);
    } catch (error) {
      console.error("Error detecting breed:", error);
      setToastMessage("Failed to detect pet breed. Please try again.");
      setToastSeverity('error');
      setShowToast(true);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageFile(null);
    setImageUrl(null);
    setDetectionResults(null);
  };

  return (
    <Box className="signup-container" sx={{ mt: 4 }}>
      <Box className="signup-text-section">
        <Typography variant="h2" className="signup-title">Interested?</Typography>
        <Typography variant="h5" className="signup-subtitle">Upload your picture</Typography>
        <Typography className="signup-description">
          and see the results.        
        </Typography>
        <Typography>This AI model is limited to Cats and Dogs only</Typography>
      </Box>
      
      <Box className="signup-form-container">
        <h3>To check your pet's breed,</h3>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {!imageUrl ? (
          <Box
            sx={{
              border: '2px dashed #538A44',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(83, 138, 68, 0.05)' },
              mb: 2
            }}
            onClick={handleUploadClick}
          >
            <CloudUpload sx={{ fontSize: 48, color: '#538A44', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Drag and drop your image here or click to browse
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: JPG, PNG, WEBP (max 10MB)
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={imageUrl} 
                alt="Uploaded pet" 
                style={{
                  maxWidth: '100%',
                  maxHeight: 300,
                  borderRadius: 8,
                  objectFit: 'contain'
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleReset}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 'auto',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                }}
              >
                ✕
              </Button>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleUploadClick}
            startIcon={<CloudUpload />}
            disabled={isDetecting}
            sx={{ flex: 1 }}
          >
            Browse
          </Button>
          <Button 
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={handleUploadClick}
            disabled={isDetecting}
            sx={{ flex: 1 }}
          >
            Camera
          </Button>
        </Box>

        <Button 
          className="signup-submit-button" 
          variant="contained" 
          sx={{ backgroundColor: '#538A44', mt: 2, width: '100%' }}
          onClick={imageUrl ? handleAnalyze : handleUploadClick}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} color="inherit" />
              Processing...
            </Box>
          ) : imageUrl ? (
            'Detect Breed'
          ) : (
            'Upload your image'
          )}
        </Button>
      </Box>

      {detectionResults && imageUrl && (
        <BreedResults 
          results={detectionResults.results}
          petType={detectionResults.petType}
          imageUrl={imageUrl}
        />
      )}

      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowToast(false)} 
          severity={toastSeverity}
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
