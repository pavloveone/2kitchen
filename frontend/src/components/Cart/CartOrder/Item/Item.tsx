import { FC } from 'react';
import { Box, ListItem, ListItemText, Typography } from '@mui/material';
import { AddToOrder } from '../../../AddToOrder';
import { formatPrice } from '../../../../utils';
import { RemoveFromOrder } from '../../../RemoveFromOrder';
import { OrderItem } from '../../../../api';

interface ItemProps {
  order: OrderItem;
}

export const Item: FC<ItemProps> = ({ order }) => {
  return (
    <ListItem
      sx={{ py: 0 }}
      secondaryAction={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RemoveFromOrder dish={order.dish} />
          <Typography sx={{ mx: 1 }}>{order.quantity}</Typography>
          <AddToOrder dish={order.dish} />
        </Box>
      }
    >
      <ListItemText
        primary={order.dish.name}
        secondary={formatPrice(order.dish.price * order.quantity)}
      />
    </ListItem>
  );
};
