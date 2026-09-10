import { FC, useCallback, useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useRestaurantStore } from '../../../store';

export const CreateRestaurant: FC = () => {
  const { registerRestaurant } = useRestaurantStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      setError(null);
      setIsSubmitting(true);
      try {
        await registerRestaurant({ name, description });
      } catch (err) {
        console.error('Error while creating restaurant', err);
        setError('Could not create the restaurant. Please try again');
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, description, registerRestaurant],
  );

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 420 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
          Create your restaurant
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your account doesn&apos;t have a restaurant yet - add one to open the admin panel
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Restaurant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={!name.trim() || isSubmitting}
            sx={{ borderRadius: '10px' }}
          >
            Create restaurant
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
