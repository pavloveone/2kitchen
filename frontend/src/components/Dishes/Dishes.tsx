import { FC, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { useDishStore, useToastStore, ViewMode } from '../../store';
import { ListByMode } from './ListByMode';

interface DishesProps {
  isMobile: boolean;
  viewMode: ViewMode;
  restaurantId: number;
}

export const Dishes: FC<DishesProps> = ({ isMobile, viewMode, restaurantId }) => {
  const { loadDishes, dishes, isLoadingDishes } = useDishStore();
  const { showToast } = useToastStore();

  const handleLoadDishes = useCallback(async () => {
    try {
      await loadDishes(restaurantId);
    } catch (error) {
      console.error('An error while loading dishes', error);
      showToast('Could not load the menu');
    }
  }, [loadDishes, restaurantId, showToast]);

  useEffect(() => {
    handleLoadDishes();
  }, [handleLoadDishes]);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        p: isMobile ? 1 : 2,
        position: 'relative',
        minHeight: 200,
      }}
    >
      <ListByMode
        viewMode={viewMode}
        isLoading={isLoadingDishes}
        isMobile={isMobile}
        dishes={dishes}
      />
    </Box>
  );
};
