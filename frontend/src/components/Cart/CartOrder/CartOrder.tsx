import { FC } from 'react';
import { List } from '@mui/material';
import { useOrderStore } from '../../../store';
import { Item } from './Item';

export const CartOrder: FC = () => {
  const { order } = useOrderStore();

  return (
    <List dense sx={{ flexGrow: 1, overflowY: 'auto' }}>
      {order.map((item) => (
        <Item key={item.dish.id} order={item} />
      ))}
    </List>
  );
};
