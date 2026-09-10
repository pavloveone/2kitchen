import { FC } from 'react';
import { List as MList } from '@mui/material';
import { Item } from './Item';
import { Dish } from '../../../../api';

interface ListProps {
  dishes: Dish[];
}

export const List: FC<ListProps> = ({ dishes }) => (
  <MList sx={{ width: '100%' }}>
    {dishes.map((dish) => (
      <Item key={dish?.id} dish={dish} />
    ))}
  </MList>
);
