import { FC } from 'react';
import { IconButton } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useOrderStore } from '../../store';
import { Dish } from '../../api';

interface AddToOrderProps {
  dish: Dish;
}

export const AddToOrder: FC<AddToOrderProps> = ({ dish }) => {
  const { addToOrder } = useOrderStore();

  return (
    <IconButton size="small" onClick={() => addToOrder(dish)} color="default">
      <Add />
    </IconButton>
  );
};
