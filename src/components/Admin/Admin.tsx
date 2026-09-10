import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Tabs, Tab, Button, Stack, Typography, useTheme } from '@mui/material';
import { AddDishForm } from './AddDishForm';
import { CreateRestaurant } from './CreateRestaurant';
import { RestaurantInfo } from './RestaurantInfo';
import { Dishes } from '../Dishes';
import { Loader } from '../Loader';
import { Orders } from './Orders';
import { Charts } from './Charts';
import { useAuthStore, useOrderStore, useRestaurantStore, useToastStore } from '../../store';

export const AdminPanel = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { myRestaurant, isLoadingMyRestaurant, loadMyRestaurant } = useRestaurantStore();
  const { getMyOrders, orders, simulateOrders, isSimulating } = useOrderStore();
  const { showToast } = useToastStore();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setShowForm(false);
  };

  const handleOpenDialog = () => setShowForm(true);
  const handleCloseDialog = () => setShowForm(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadMyRestaurant().catch((error) =>
      console.error('An error while loading my restaurant', error),
    );
  }, [isAuthenticated, loadMyRestaurant]);

  const handleLoadOrders = useCallback(async () => {
    try {
      await getMyOrders();
    } catch (error) {
      console.error('An error while loading orders', error);
      showToast('Could not load orders');
    }
  }, [getMyOrders, showToast]);

  useEffect(() => {
    if (!myRestaurant) return;
    handleLoadOrders();
  }, [myRestaurant, handleLoadOrders]);

  const handleSimulateOrders = useCallback(async () => {
    try {
      await simulateOrders();
      showToast('Demo orders generated', 'success');
    } catch (error) {
      console.error('An error while generating demo orders', error);
      showToast('Could not generate demo orders');
    }
  }, [simulateOrders, showToast]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoadingMyRestaurant) {
    return <Loader />;
  }

  if (!myRestaurant) {
    return <CreateRestaurant />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {myRestaurant.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', bgcolor: '#f9f9f9' }}>
        <Tabs
          orientation="vertical"
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            borderRight: 1,
            borderColor: 'divider',
            overflowY: 'auto',
            width: 220,
            bgcolor: 'background.paper',
            p: 2,
          }}
        >
          <Tab label="Dishes" />
          <Tab label="Orders" />
          <Tab label="Analytics" />
          <Tab label="Info" />
        </Tabs>

        <Box sx={{ flexGrow: 1, p: 4, height: '100%', overflow: 'hidden' }}>
          {selectedTab === 0 && (
            <Stack
              spacing={3}
              sx={{
                height: '100%',
                overflow: 'hidden',
                '& ::-webkit-scrollbar': {
                  width: '6px',
                  height: '6px',
                },
                '& ::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.grey[400],
                  borderRadius: '3px',
                },
                '& ::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: theme.palette.grey[500],
                },
                '& ::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  style={{ textDecoration: 'none', borderRadius: '10px' }}
                  variant="outlined"
                  onClick={handleOpenDialog}
                >
                  Add dish
                </Button>
              </Box>

              <Dishes isMobile={false} viewMode="table" restaurantId={myRestaurant.id} />

              <AddDishForm
                onClose={handleCloseDialog}
                open={showForm}
                restaurantId={myRestaurant.id}
              />
            </Stack>
          )}
          {selectedTab === 1 && (
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {orders.length === 0 ? 'No orders yet' : `Orders: ${orders.length}`}
                </Typography>
                <Button
                  variant="outlined"
                  disabled={isSimulating}
                  onClick={handleSimulateOrders}
                  sx={{ borderRadius: '10px' }}
                >
                  Generate demo orders
                </Button>
              </Box>
              <Orders orders={orders} />
            </Stack>
          )}
          {selectedTab === 2 && <Charts orders={orders} />}
          {selectedTab === 3 && <RestaurantInfo restaurant={myRestaurant} />}
        </Box>
      </Box>
    </Box>
  );
};
