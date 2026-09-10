import { FC } from 'react';
import { Typography } from '@mui/material';
import { ViewMode } from '../../../store';
import { Cards } from './Cards';
import { List } from './List';
import { Loader } from '../../Loader';
import { DishesTable } from './Table';
import { Dish } from '../../../api';

interface ListByModeProps {
  viewMode: ViewMode;
  isMobile: boolean;
  dishes: Dish[];
  isLoading: boolean;
}

const DishesByMode: FC<Omit<ListByModeProps, 'isLoading'>> = ({ viewMode, isMobile, dishes }) => {
  if (viewMode === 'list') return <List dishes={dishes} />;
  if (viewMode === 'table') return <DishesTable dishes={dishes} />;
  return <Cards isMobile={isMobile} dishes={dishes} />;
};

export const ListByMode: FC<ListByModeProps> = ({ viewMode, isMobile, dishes, isLoading }) => {
  if (isLoading) return <Loader />;

  return (
    <>
      <DishesByMode viewMode={viewMode} isMobile={isMobile} dishes={dishes} />
      {dishes.length === 0 && !isLoading && (
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            mt: 4,
          }}
        >
          No dishes found
        </Typography>
      )}
    </>
  );
};
