import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Collapse,
  Box,
  IconButton,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import React, { useCallback, useState } from 'react';
import { Order, OrderItem } from '../../../../api';
import { formatPrice } from '../../../../utils';

type OrdersTableProps = {
  orders: Order[];
};

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openIds, setOpenIds] = useState<number[]>([]);

  const handleSelect = useCallback(
    (id: number) =>
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])),
    [],
  );

  const handleToggleOpen = useCallback(
    (id: number) =>
      setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])),
    [],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((order) => order.id));
    }
  }, [selectedIds, orders]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const parseItems = (itemsStr: string) => {
    try {
      return JSON.parse(itemsStr) as OrderItem[];
    } catch {
      return [];
    }
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedIds.length === orders.length}
                indeterminate={selectedIds.length > 0 && selectedIds.length < orders.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell />
            <TableCell>Order #</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Payment status</TableCell>
            <TableCell>Placed at</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const isOpen = openIds.includes(order.id);
            const items = parseItems(order.items);

            return (
              <React.Fragment key={order.id}>
                <TableRow hover selected={selectedIds.includes(order.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(order.id)}
                      onChange={() => handleSelect(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleToggleOpen(order.id)}>
                      {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.payment_status}</TableCell>
                  <TableCell>{formatDate(order.order_time)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <strong>Order items:</strong>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Dish</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Price</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {items.map((item) => (
                              <TableRow key={item.dish.id}>
                                <TableCell>{item.dish.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatPrice(item.dish.price)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
