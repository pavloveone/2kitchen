import { FC, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Box, IconButton, List, Divider, Button } from '@mui/material';
import { ArrowBackIos } from '@mui/icons-material';
import { formatPrice } from '../../utils';
import { useOrderStore, useToastStore } from '../../store';
import { ItemOrder } from './ItemOrder';
import { CreateOrder } from '../../api';

export const CheckoutOrder: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { order, createOrder } = useOrderStore();
  const { showToast } = useToastStore();

  const totalPrice = order.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const handleCreateOrder = useCallback(async () => {
    try {
      const createdData: CreateOrder = {
        items: order,
        restaurant: Number(id),
      };
      await createOrder(createdData);
      navigate('/order-success');
    } catch (error) {
      console.error('Error while creating new order', error);
      showToast('Could not place the order. Please try again');
    }
  }, [order, createOrder, navigate, id, showToast]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              mr: 1,
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'grey.900',
              },
            }}
          >
            <ArrowBackIos />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            Your order
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please review your order before paying
        </Typography>
        <Divider />
      </Box>

      <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
        {order.map((o) => (
          <ItemOrder key={o.dish.id} order={o} />
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Total:
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            {formatPrice(totalPrice)}
          </Typography>
        </Box>
        <Button
          fullWidth
          onClick={handleCreateOrder}
          variant="outlined"
          size="large"
          disabled={order.length === 0}
          sx={{ borderRadius: '10px' }}
        >
          Place order
        </Button>
      </Box>
    </Box>
  );
};
