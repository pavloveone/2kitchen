import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export const OrderSuccess: React.FC = () => {
  return (
    <Container
      maxWidth="xs"
      sx={(theme) => ({
        textAlign: 'center',
        pt: 8,
        px: 2,
        [theme.breakpoints.up('sm')]: {
          maxWidth: 'sm',
          pt: 12,
        },
      })}
    >
      <CheckCircleOutlineIcon
        color="success"
        sx={(theme) => ({
          fontSize: 64,
          mb: 2,
          [theme.breakpoints.up('sm')]: {
            fontSize: 80,
          },
        })}
      />
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Order placed successfully!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Thank you for your order. We&apos;ve already started preparing it.
      </Typography>
      <Box mt={4}>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          color="primary"
          size="large"
          fullWidth
          sx={{ borderRadius: '10px' }}
        >
          Back to home
        </Button>
      </Box>
    </Container>
  );
};
