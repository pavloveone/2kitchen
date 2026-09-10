import { FC, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, CardActionArea, Stack, Typography } from '@mui/material';
import { Storefront } from '@mui/icons-material';
import { useRestaurantStore, useToastStore } from '../../store';
import { Loader } from '../Loader';

export const RestaurantList: FC = () => {
  const { restaurants, isLoadingRestaurants, loadRestaurants } = useRestaurantStore();
  const { showToast } = useToastStore();

  const handleLoad = useCallback(async () => {
    try {
      await loadRestaurants();
    } catch (error) {
      console.error('An error while loading restaurants', error);
      showToast('Could not load restaurants');
    }
  }, [loadRestaurants, showToast]);

  useEffect(() => {
    handleLoad();
  }, [handleLoad]);

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
        2kitchen
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Choose a restaurant to see its menu
      </Typography>

      {isLoadingRestaurants && <Loader />}

      {!isLoadingRestaurants && restaurants.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          No restaurants registered yet - be the first
        </Typography>
      )}

      <Stack spacing={2} sx={{ width: '100%', maxWidth: 420 }}>
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} variant="outlined" sx={{ borderRadius: '10px' }}>
            <CardActionArea
              component={Link}
              to={`/restaurant/${restaurant.id}`}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2 }}
            >
              <Storefront color="action" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1">{restaurant.name}</Typography>
                {restaurant.description && (
                  <Typography variant="body2" color="text.secondary">
                    {restaurant.description}
                  </Typography>
                )}
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
