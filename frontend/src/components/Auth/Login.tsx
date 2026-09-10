import { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuthStore } from '../../store';

export const Login: FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);
      try {
        await login({ username, password });
        navigate('/admin');
      } catch (err) {
        console.error('Error while logging in', err);
        setError('Incorrect username or password');
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, navigate, password, username],
  );

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        position: 'relative',
      }}
    >
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ position: 'absolute', top: 16, left: 16 }}
        aria-label="Go back"
      >
        <ArrowBack />
      </IconButton>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 360 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Restaurant owner sign in
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={!username || !password || isSubmitting}
            sx={{ borderRadius: '10px' }}
          >
            Sign in
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
