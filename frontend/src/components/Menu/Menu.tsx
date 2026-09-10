import { FC, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { HeaderMenu } from './HeaderMenu';
import { useViewModeStore } from '../../store';
import { Dishes } from '../Dishes';
import { Cart } from '../Cart';

export const Menu: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const restaurantId = Number(id);

  const { viewMode } = useViewModeStore();

  const handleCheckout = useCallback(() => {
    navigate(`/restaurant/${id}/checkout`);
  }, [navigate, id]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.default',
        '& ::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '& ::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.grey[400],
          borderRadius: '3px',
        },
        '& ::-webkit-scrollbar-thumb:hover': {
          backgroundColor: theme.palette.grey[500],
        },
        '& ::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
      }}
    >
      <HeaderMenu />
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Dishes viewMode={viewMode} isMobile={isMobile} restaurantId={restaurantId} />
        <Cart isMobile={isMobile} onCheckout={handleCheckout} />
      </Box>
    </Box>
  );
};
