import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIos, GridView, ShoppingCart, ViewList } from '@mui/icons-material';
import {
  Badge,
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useOrderStore, useViewModeStore, ViewMode } from '../../../store';

export const HeaderMenu: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const { viewMode, setViewMode } = useViewModeStore();
  const { order } = useOrderStore();

  const total = useMemo(
    () => order.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),
    [order],
  );
  return (
    <Box
      sx={{
        py: 2,
        px: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderBottom: '1px solid rgba(0, 0, 0, 0.14)',
        width: !isMobile && total ? 'calc(100% - 350px)' : '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            mr: 1,
            '&:hover': {
              backgroundColor: 'transparent',
              color: 'grey.900',
            },
          }}
        >
          <ArrowBackIos />
        </IconButton>
        <Typography variant="h6">Menu</Typography>
      </Box>

      <Box sx={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode: ViewMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="list">
            <ViewList fontSize="small" />
          </ToggleButton>
          <ToggleButton value="grid">
            <GridView fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        {isMobile && (
          <Badge
            badgeContent={order.reduce((sum, item) => sum + item.quantity, 0)}
            color="primary"
            sx={{ cursor: 'pointer' }}
          >
            <ShoppingCart />
          </Badge>
        )}
      </Box>
    </Box>
  );
};
