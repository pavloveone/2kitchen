import { FC, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { Person } from '@mui/icons-material';
import { useAuthStore, useRestaurantStore } from '../../store';

export const HEADER_HEIGHT = 56;

export const UserHeader: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { myRestaurant, loadMyRestaurant } = useRestaurantStore();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyRestaurant().catch((error) =>
        console.error('An error while loading my restaurant', error),
      );
    }
  }, [isAuthenticated, loadMyRestaurant]);

  const closeMenu = () => setMenuAnchor(null);

  const handleLogout = useCallback(() => {
    logout();
    closeMenu();
    navigate('/');
  }, [logout, navigate]);

  const handleGoToRestaurant = useCallback(() => {
    closeMenu();
    if (myRestaurant) navigate(`/restaurant/${myRestaurant.id}`);
  }, [myRestaurant, navigate]);

  const handleGoToAdmin = useCallback(() => {
    closeMenu();
    navigate('/admin');
  }, [navigate]);

  const handleGoToAllRestaurants = useCallback(() => {
    closeMenu();
    navigate('/');
  }, [navigate]);

  return (
    <Box
      sx={{
        height: HEADER_HEIGHT,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        component={Link}
        to="/"
        variant="subtitle1"
        fontWeight="bold"
        sx={{ color: 'text.primary', textDecoration: 'none' }}
      >
        2kitchen
      </Typography>

      {isAuthenticated ? (
        <>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <Person fontSize="small" />
            </Avatar>
          </IconButton>
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
            {myRestaurant && (
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Typography variant="body2" color="text.secondary">
                  {myRestaurant.name}
                </Typography>
              </MenuItem>
            )}
            {myRestaurant && <MenuItem onClick={handleGoToRestaurant}>My restaurant</MenuItem>}
            <MenuItem onClick={handleGoToAdmin}>Admin panel</MenuItem>
            <MenuItem onClick={handleGoToAllRestaurants}>All restaurants</MenuItem>
            <MenuItem onClick={handleLogout}>Log out</MenuItem>
          </Menu>
        </>
      ) : (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography
            component={Link}
            to="/login"
            variant="body2"
            sx={{ color: 'primary.main', fontWeight: 500, textDecoration: 'none' }}
          >
            Log in
          </Typography>
          <Typography
            component={Link}
            to="/register"
            variant="body2"
            sx={{ color: 'primary.main', fontWeight: 500, textDecoration: 'none' }}
          >
            Sign up
          </Typography>
        </Box>
      )}
    </Box>
  );
};
