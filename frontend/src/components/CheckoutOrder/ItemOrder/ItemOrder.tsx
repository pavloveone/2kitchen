import { FC } from 'react';
import { ListItem, Typography, Box } from '@mui/material';
import { formatPrice } from '../../../utils';
import { OrderItem } from '../../../api';

interface ItemOrderProps {
  order: OrderItem;
}

export const ItemOrder: FC<ItemOrderProps> = ({ order }) => {
  const { dish } = order;
  const totalPrice = dish.price * order.quantity;

  return (
    <ListItem
      sx={{
        py: 2,
        px: 2,
        alignItems: 'flex-start',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        gap: 2,
      }}
      disableGutters
    >
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body1" fontWeight="medium">
            {dish.name}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {order.quantity} × {formatPrice(dish.price)} = {formatPrice(totalPrice)}
        </Typography>
      </Box>
    </ListItem>
  );
};
