import React, { useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from '@mui/material';
import { Dish } from '../../../../api';

type DishesTableProps = {
  dishes: Dish[];
};

export const DishesTable: React.FC<DishesTableProps> = ({ dishes }) => {
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const handleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === dishes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(dishes.map((dish) => dish.id));
    }
  }, [selectedIds, dishes]);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedIds.length === dishes.length}
                indeterminate={selectedIds.length > 0 && selectedIds.length < dishes.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Price (€)</TableCell>
            <TableCell align="right">Protein</TableCell>
            <TableCell align="right">Fat</TableCell>
            <TableCell align="right">Carbs</TableCell>
            <TableCell align="right">Calories</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dishes.map((dish) => (
            <TableRow key={dish.id} hover selected={selectedIds.includes(dish.id)}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedIds.includes(dish.id)}
                  onChange={() => handleSelect(dish.id)}
                />
              </TableCell>
              <TableCell>{dish.name}</TableCell>
              <TableCell>{dish.description}</TableCell>
              <TableCell align="right">{dish.price.toFixed(2)}</TableCell>
              <TableCell align="right">{dish.protein}</TableCell>
              <TableCell align="right">{dish.fat}</TableCell>
              <TableCell align="right">{dish.carbs}</TableCell>
              <TableCell align="right">{dish.calories}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
