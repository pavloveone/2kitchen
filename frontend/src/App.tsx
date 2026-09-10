import { useEffect } from 'react';
import { Box } from '@mui/material';
import { AppRoutes, Toast, UserHeader } from './components';
import { useAuthStore } from './store';
import './App.style.css';

export const App = () => {
  const { isReady, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!isReady) return null;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UserHeader />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <AppRoutes />
      </Box>
      <Toast />
    </Box>
  );
};
