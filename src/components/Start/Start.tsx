import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Stack, useTheme, useMediaQuery } from '@mui/material';
import { NotificationsNoneOutlined, MenuBook, Calculate } from '@mui/icons-material';
import { ILinkButtonProps, LinkButton } from '../Button';

export const Start = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();

  const buttons = useMemo<ILinkButtonProps[]>(
    () => [
      {
        path: `/restaurant/${id}/waiter`,
        icon: <NotificationsNoneOutlined />,
        variant: 'outlined',
        title: 'Waiter',
        isMobile,
        disabled: true,
      },
      {
        path: `/restaurant/${id}/menu`,
        icon: <MenuBook />,
        variant: 'outlined',
        title: 'Menu',
        isMobile,
      },
      {
        path: `/restaurant/${id}/calculate`,
        icon: <Calculate />,
        variant: 'outlined',
        title: 'Bill',
        isMobile,
        disabled: true,
      },
    ],
    [id, isMobile],
  );

  return (
    <Stack
      direction={isMobile ? 'column' : 'row'}
      justifyContent="center"
      alignItems="center"
      spacing={isMobile ? 1 : 2}
      sx={{
        height: '100%',
        padding: 2,
      }}
    >
      {buttons.map((button) => (
        <LinkButton key={button?.path} {...button} />
      ))}
    </Stack>
  );
};
