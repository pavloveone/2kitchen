import { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuthStore } from '../../store';

export const Register: FC = () => {
  const navigate = useNavigate();
  const { register, login } = useAuthStore();

  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = Object.values(form).every((value) => value.trim() !== '');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isFormValid) return;

      setError(null);
      setIsSubmitting(true);
      try {
        await register(form);
        await login({ username: form.username, password: form.password });
        navigate('/admin');
      } catch (err) {
        console.error('Error while registering account', err);
        setError('Could not complete registration. Check your details and try again');
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, isFormValid, login, navigate, register],
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

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 420 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
          Sign up
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create an account - you can add a restaurant after signing in
        </Typography>

        <Stack spacing={2}>
          <TextField
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="firstName"
            label="First name"
            value={form.firstName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="lastName"
            label="Last name"
            value={form.lastName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
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
            disabled={!isFormValid || isSubmitting}
            sx={{ borderRadius: '10px' }}
          >
            Sign up
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
