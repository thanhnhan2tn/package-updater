import React from 'react';
import { Container, Typography } from '@mui/material';

const ErrorMessage = ({ message }) => {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography color="error">{message}</Typography>
    </Container>
  );
};

export default ErrorMessage; 