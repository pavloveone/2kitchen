import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@mui/material';

export interface ILinkButtonProps {
  path: string;
  icon: React.ReactNode;
  variant: 'text' | 'outlined' | 'contained';
  title: string;
  disabled?: boolean;
  isMobile?: boolean;
}

export const LinkButton: FC<ILinkButtonProps> = ({
  path,
  icon,
  variant,
  title,
  disabled = false,
  isMobile = false,
}) => {
  return (
    <Button
      component={NavLink}
      disabled={disabled}
      to={path}
      variant={variant}
      startIcon={icon}
      sx={{
        width: isMobile ? '100%' : 180,
        py: 0.5,
        px: 2,
        fontSize: isMobile ? 12 : 14,
        minHeight: 48,
        textDecoration: 'none',
        borderRadius: '10px',
      }}
    >
      {title}
    </Button>
  );
};
