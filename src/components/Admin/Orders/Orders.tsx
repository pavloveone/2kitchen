import { FC } from 'react';
import { Box } from '@mui/material';
import { OrdersTable } from './Table';
import { Order } from '../../../api';

interface OrdersProps {
  orders: Order[];
}

export const Orders: FC<OrdersProps> = ({ orders }) => {
  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        position: 'relative',
        minHeight: 200,
      }}
    >
      <OrdersTable orders={orders} />
    </Box>
  );
};
