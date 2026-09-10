import { FC } from 'react';
import { Typography } from '@mui/material';
import { formatPrice } from '../../../utils';

interface PriceDisplayProps {
  price: number;
}

export const PriceDisplay: FC<PriceDisplayProps> = ({ price }) => (
  <Typography
    variant="body1"
    sx={{
      fontWeight: 400,
      fontStyle: 'italic',
      fontSize: { xs: '0.9rem', sm: '1rem' },
      letterSpacing: 0.5,
    }}
  >
    {formatPrice(price)}
  </Typography>
);
