import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error
} from '@mui/icons-material';

const ParticipantUpload = ({ onUploadSuccess, onLoading, onAlert }) => {
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadInfo, setUploadInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      onAlert('Please select a CSV file', 'error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onAlert('File size must be less than 10MB', 'error');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('csv', file);

    setUploadStatus('uploading');
    onLoading(true);

    try {
      const response = await fetch('/api/participants/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setUploadInfo(result);
        onUploadSuccess(result.participants);
        onAlert(`Successfully processed ${result.participants.length} participants`, 'success');
      } else {
        setUploadStatus('error');
        onAlert(result.message || 'Upload failed', 'error');
      }
    } catch (error) {
      setUploadStatus('error');
      onAlert('Network error during upload', 'error');
    } finally {
      onLoading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      fileInputRef.current.files = event.dataTransfer.files;
      await uploadFile(file);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Upload Participant CSV
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload a CSV file containing participant data. The system will automatically 
        map and validate the data before importing.
      </Typography>

      {uploadStatus === 'idle' && (
        <Paper
          elevation={0}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: 'grey.50',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50',
            },
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drop CSV file here or click to browse
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: .csv (max 10MB)
          </Typography>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
        </Paper>
      )}

      {uploadStatus === 'uploading' && (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Processing CSV file...
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we process your file
          </Typography>
        </Paper>
      )}

      {uploadStatus === 'success' && uploadInfo && (
        <Paper elevation={0} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
            <Typography variant="h6">
              Upload Successful!
            </Typography>
          </Box>

          <List dense>
            <ListItem>
              <ListItemText 
                primary="Total Participants" 
                secondary={uploadInfo.total || 0}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Successfully Imported" 
                secondary={uploadInfo.success || 0}
              />
            </ListItem>
            {uploadInfo.errors && uploadInfo.errors.length > 0 && (
              <ListItem>
                <ListItemText 
                  primary="Errors" 
                  secondary={uploadInfo.errors.length}
                />
              </ListItem>
            )}
          </List>

          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button onClick={resetUpload} variant="outlined">
              Upload Another File
            </Button>
          </Box>
        </Paper>
      )}

      {uploadStatus === 'error' && (
        <Paper elevation={0} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Error sx={{ color: 'error.main', mr: 1 }} />
            <Typography variant="h6">
              Upload Failed
            </Typography>
          </Box>
          
          <Alert severity="error" sx={{ mb: 2 }}>
            There was an error processing your file. Please check the file format and try again.
          </Alert>

          <Button onClick={resetUpload} variant="outlined" color="primary">
            Try Again
          </Button>
        </Paper>
      )}

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Expected CSV Columns:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {[
            'Yatri Id', 'First Name', 'Last Name', 'Email', 'Contact Number',
            'DOB', 'Gender', 'Address', 'State', 'Education', 'Status'
          ].map((column) => (
            <Chip 
              key={column} 
              label={column} 
              size="small" 
              variant="outlined" 
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ParticipantUpload;