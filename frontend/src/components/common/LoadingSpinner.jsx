import React from 'react';
import { Container, CircularProgress } from '@mui/material';

const LoadingSpinner = () => {
  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Container>
  );
};

export default LoadingSpinner; 