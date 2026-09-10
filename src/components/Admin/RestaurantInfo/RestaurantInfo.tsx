import { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Restaurant } from '../../../api';
import { useRestaurantStore, useToastStore } from '../../../store';

interface RestaurantInfoProps {
  restaurant: Restaurant;
}

export const RestaurantInfo: FC<RestaurantInfoProps> = ({ restaurant }) => {
  const navigate = useNavigate();
  const { updateMyRestaurant, deleteMyRestaurant } = useRestaurantStore();
  const { showToast } = useToastStore();

  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateMyRestaurant({ name, description });
      showToast('Restaurant updated', 'success');
    } catch (error) {
      console.error('An error while updating restaurant', error);
      showToast('Could not update the restaurant');
    } finally {
      setIsSaving(false);
    }
  }, [name, description, updateMyRestaurant, showToast]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteMyRestaurant();
      showToast('Restaurant deleted', 'success');
      navigate('/');
    } catch (error) {
      console.error('An error while deleting restaurant', error);
      showToast('Could not delete the restaurant');
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  }, [deleteMyRestaurant, navigate, showToast]);

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        Restaurant info
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim() || isSaving}
          sx={{ borderRadius: '10px', alignSelf: 'flex-start' }}
        >
          Save changes
        </Button>
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Typography variant="subtitle1" fontWeight="bold" color="error" sx={{ mb: 1 }}>
        Danger zone
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Deleting your restaurant permanently removes it along with all of its dishes and orders.
      </Typography>
      <Button
        variant="outlined"
        color="error"
        onClick={() => setConfirmOpen(true)}
        sx={{ borderRadius: '10px' }}
      >
        Delete restaurant
      </Button>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete {restaurant.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete the restaurant, all of its dishes, and all of its orders.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={isDeleting}>
            Delete permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
