import { FC } from 'react';
import { CircularProgress, Stack } from '@mui/material';

export const Loader: FC = () => {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <CircularProgress size={48} />
    </Stack>
  );
};
