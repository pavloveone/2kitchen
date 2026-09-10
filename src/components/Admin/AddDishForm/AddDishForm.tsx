import { FC, useCallback, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useDishStore, useToastStore } from '../../../store';

interface AddDishFormProps {
  open: boolean;
  onClose: () => void;
  restaurantId: number;
}

export const AddDishForm: FC<AddDishFormProps> = ({ open, onClose, restaurantId }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    protein: '',
    fat: '',
    carbs: '',
    calories: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const { addDish } = useDishStore();
  const { showToast } = useToastStore();

  const validate = (formToValidate: typeof form) => {
    const newErrors: { [key: string]: boolean } = {};
    Object.entries(formToValidate).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = true;
      } else if (
        ['price', 'protein', 'fat', 'carbs', 'calories'].includes(key) &&
        Number.isNaN(Number(value))
      ) {
        newErrors[key] = true;
      }
    });
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updatedForm = {
        ...prev,
        [name]: value,
      };
      validate(updatedForm);
      return updatedForm;
    });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (Object.keys(errors).length > 0) return;

      const newDish = {
        ...form,
        price: parseFloat(form.price),
        protein: parseFloat(form.protein),
        fat: parseFloat(form.fat),
        carbs: parseFloat(form.carbs),
        calories: parseFloat(form.calories),
      };

      try {
        await addDish(newDish, restaurantId);
      } catch (error) {
        console.error('Error while add dish to rest', error);
        showToast('Could not add the dish. Please try again');
        return;
      }

      setForm({
        name: '',
        description: '',
        price: '',
        image: '',
        protein: '',
        fat: '',
        carbs: '',
        calories: '',
      });
      setErrors({});
      onClose();
    },
    [addDish, errors, form, onClose, restaurantId, showToast],
  );

  const isFormValid =
    Object.keys(errors).length === 0 && Object.values(form).every((value) => value.trim() !== '');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add dish</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <Stack spacing={3}>
              {[
                { label: 'Name', name: 'name', type: 'text' },
                {
                  label: 'Description',
                  name: 'description',
                  type: 'text',
                  multiline: true,
                  rows: 3,
                },
                { label: 'Price', name: 'price', type: 'number' },
                { label: 'Image URL', name: 'image', type: 'text' },
                { label: 'Protein (g)', name: 'protein', type: 'number' },
                { label: 'Fat (g)', name: 'fat', type: 'number' },
                { label: 'Carbs (g)', name: 'carbs', type: 'number' },
                { label: 'Calories (kcal)', name: 'calories', type: 'number' },
              ].map(({ label, name, type, multiline, rows }) => (
                <Box key={name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ width: 250, alignSelf: 'center' }}>
                    {label}:
                  </Typography>
                  <TextField
                    name={name}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    required
                    error={!!errors[name]}
                    fullWidth
                    type={type}
                    multiline={multiline}
                    rows={rows || 1}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ borderRadius: 2, width: '100%' }}
          disabled={!isFormValid}
        >
          Add dish
        </Button>
      </DialogActions>
    </Dialog>
  );
};
