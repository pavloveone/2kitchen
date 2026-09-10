import { FC, useState } from 'react';
import { Card, CardActions, CardContent, Typography, Box, Avatar } from '@mui/material';
import { NutritionChips } from '../../../NutritionChips';
import { PriceDisplay } from '../../../PriceDisplay';
import { useOrderStore } from '../../../../../store';
import { AddToOrder } from '../../../../AddToOrder';
import { RemoveFromOrder } from '../../../../RemoveFromOrder';
import { DishModal } from '../../../../DishModal';
import { Dish } from '../../../../../api';

interface ItemProps {
  dish: Dish;
}

const styles = {
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    boxShadow: 3,
    border: '2px solid transparent',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      borderColor: 'primary.light',
      boxShadow: 4,
      cursor: 'pointer',
    },
  },
  contentPadding: {
    px: { xs: 1, sm: 2 },
    pt: { xs: 1, sm: 2 },
  },
  image: {
    width: '100%',
    height: { xs: 120, sm: 140 },
    borderRadius: 1,
  },
  title: {
    fontWeight: 600,
    fontSize: { xs: '0.9rem', sm: '1rem' },
    lineHeight: 1.2,
    flexGrow: 1,
  },
  description: {
    color: 'text.secondary',
    fontSize: { xs: '0.75rem', sm: '0.8rem' },
    mt: { xs: 0.25, sm: 0.5 },
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: { xs: 2, sm: 3 },
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'start',
    gap: { xs: 0.5, sm: 1.5 },
    mb: { xs: 0.5, sm: 1 },
    flexDirection: { xs: 'column', sm: 'row' },
  },
  cardActions: {
    justifyContent: 'space-between',
    pb: { xs: 1, sm: 2 },
    pt: 0,
  },
  orderControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
};

export const Item: FC<ItemProps> = ({ dish }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const quantity = useOrderStore(
    (state) => state.order.find((item) => item.dish.id === dish.id)?.quantity,
  );

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <>
      <Card sx={styles.card} onClick={handleOpenModal}>
        <Box sx={styles.contentPadding}>
          <Avatar variant="rounded" src={dish.image} sx={styles.image} />
        </Box>

        <CardContent
          sx={{ ...styles.contentPadding, flexGrow: 1, pb: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}
        >
          <Box sx={styles.titleWrapper}>
            <Typography variant="h6" component="div" sx={styles.title}>
              {dish.name}
            </Typography>
            <NutritionChips dish={dish} />
          </Box>

          <Typography variant="body2" sx={styles.description}>
            {dish.description}
          </Typography>
        </CardContent>

        <CardActions sx={{ ...styles.contentPadding, ...styles.cardActions }}>
          <PriceDisplay price={dish.price} />

          <Box sx={styles.orderControls} onClick={(event) => event.stopPropagation()}>
            {quantity ? (
              <>
                <RemoveFromOrder dish={dish} />
                <Typography variant="body1" component="span">
                  {quantity}
                </Typography>
              </>
            ) : null}
            <AddToOrder dish={dish} />
          </Box>
        </CardActions>
      </Card>

      <DishModal dish={dish} open={modalOpen} onClose={handleCloseModal} />
    </>
  );
};
