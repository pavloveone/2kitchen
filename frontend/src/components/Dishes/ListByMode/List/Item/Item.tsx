import { FC } from 'react';
import { ListItem, Typography, Box } from '@mui/material';
import { AddToOrder } from '../../../../AddToOrder';
import { NutritionChips } from '../../../NutritionChips';
import { PriceDisplay } from '../../../PriceDisplay';
import { useOrderStore } from '../../../../../store';
import { RemoveFromOrder } from '../../../../RemoveFromOrder';
import { Dish } from '../../../../../api';

interface ItemProps {
  dish: Dish;
}

const listItemStyles = {
  mb: 1,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 1,
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'flex-start', sm: 'center' },
  py: { xs: 1.5, sm: 1 },
  px: { xs: 1, sm: 2 },
  position: 'relative',
};

const mainContentStyles = {
  width: '100%',
  mb: { xs: 1, sm: 0 },
  pr: { xs: 0, sm: 2 },
};

const titleStyles = {
  fontWeight: 600,
  fontSize: { xs: '0.9rem', sm: '1rem' },
};

const descriptionStyles = {
  color: 'text.secondary',
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  mb: { xs: 1, sm: 0 },
};

const orderControlsStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

export const Item: FC<ItemProps> = ({ dish }) => {
  const quantity = useOrderStore(
    (state) => state.order.find((item) => item.dish.id === dish.id)?.quantity,
  );
  return (
    <ListItem
      sx={listItemStyles}
      secondaryAction={
        <Box sx={orderControlsStyles}>
          {quantity ? (
            <>
              <RemoveFromOrder dish={dish} />
              <Typography variant="body1" component="span">
                {quantity}
              </Typography>
            </>
          ) : null}
          <AddToOrder dish={dish} />
        </Box>
      }
    >
      <Box sx={mainContentStyles}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body1" sx={titleStyles}>
              {dish.name}
            </Typography>
            <NutritionChips dish={dish} />
          </Box>
        </Box>
        <Typography variant="body2" sx={descriptionStyles}>
          {dish.description}
        </Typography>
        <PriceDisplay price={dish.price} />
      </Box>
    </ListItem>
  );
};
