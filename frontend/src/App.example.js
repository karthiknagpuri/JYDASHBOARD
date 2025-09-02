import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import FileUploadEnhanced from './components/FileUploadEnhanced';

function App() {
  const handleUploadSuccess = (uploadedFile) => {
    console.log('File uploaded successfully:', uploadedFile);
    // You can add additional logic here, such as refreshing a data table
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          JY Dashboard - Data Upload
        </Typography>
        
        <FileUploadEnhanced onUploadSuccess={handleUploadSuccess} />
      </Box>
    </Container>
  );
}

export default App;
