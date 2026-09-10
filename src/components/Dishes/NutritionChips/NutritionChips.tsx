import { FC } from 'react';
import { Box, Chip } from '@mui/material';
import { Dish } from '../../../api';

interface NutritionChipsProps {
  dish: Dish;
}

export const NutritionChips: FC<NutritionChipsProps> = ({ dish }) => (
  <Box
    sx={{
      display: 'flex',
      gap: { xs: 0.25, sm: 0.5 },
      alignSelf: { xs: 'flex-start', sm: 'auto' },
    }}
  >
    <Chip
      label={`P ${dish.protein}`}
      size="small"
      color="primary"
      variant="outlined"
      sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
    />
    <Chip
      label={`F ${dish.fat}`}
      size="small"
      color="primary"
      variant="outlined"
      sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
    />
    <Chip
      label={`C ${dish.carbs}`}
      size="small"
      color="primary"
      variant="outlined"
      sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
    />
  </Box>
);
