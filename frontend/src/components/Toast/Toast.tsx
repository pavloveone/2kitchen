import { FC } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useToastStore } from '../../store';
import { HEADER_HEIGHT } from '../UserHeader';

export const Toast: FC = () => {
  const { message, severity, hideToast } = useToastStore();

  return (
    <Snackbar
      open={!!message}
      autoHideDuration={5000}
      onClose={hideToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ top: `${HEADER_HEIGHT + 16}px !important` }}
    >
      <Alert onClose={hideToast} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
