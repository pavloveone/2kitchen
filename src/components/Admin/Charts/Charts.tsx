import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { Order, OrderItem } from '../../../api';
import { formatPrice } from '../../../utils';

type ChartsProps = {
  orders: Order[];
};

const COLORS = ['#A0C4FF', '#BDB2FF', '#FFC6FF', '#FFD6A5', '#FDFFB6'];

const ChartCard: React.FC<{ title: string; children: React.ReactElement }> = ({
  title,
  children,
}) => (
  <Box mb={4}>
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        {children}
      </ResponsiveContainer>
    </Paper>
  </Box>
);

const parseOrderTotal = (order: Order) => {
  try {
    const items = JSON.parse(order.items) as OrderItem[];
    return items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  } catch {
    // malformed items payload - treat as an empty order rather than crashing the chart
    return 0;
  }
};

export const Charts: React.FC<ChartsProps> = ({ orders }) => {
  const ordersByDate = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((order) => {
      const date = new Date(order.order_time).toISOString().split('T')[0];
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [orders]);

  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((order) => {
      map[order.status] = (map[order.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, value]) => ({ name: status, value }));
  }, [orders]);

  const revenueByDate = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((order) => {
      const date = new Date(order.order_time).toISOString().split('T')[0];
      map[date] = (map[date] || 0) + parseOrderTotal(order);
    });
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
  }, [orders]);

  const topDishes = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((order) => {
      try {
        const items = JSON.parse(order.items) as OrderItem[];
        items.forEach((item) => {
          const { name } = item.dish;
          map[name] = (map[name] || 0) + item.quantity;
        });
      } catch {
        // malformed items payload - skip this order
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  const avgReceiptByDate = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    orders.forEach((order) => {
      const date = new Date(order.order_time).toISOString().split('T')[0];
      if (!map[date]) map[date] = { total: 0, count: 0 };
      map[date].total += parseOrderTotal(order);
      map[date].count += 1;
    });
    return Object.entries(map).map(([date, { total, count }]) => ({
      date,
      avg: +(total / count).toFixed(2),
    }));
  }, [orders]);

  return (
    <Box p={2} sx={{ height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Order analytics
      </Typography>
      <Box sx={{ height: '100%', overflow: 'auto' }}>
        <ChartCard title="Orders per day">
          <LineChart data={ordersByDate}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="count" stroke="#5B8DEF" strokeWidth={1.8} dot={false} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Order statuses">
          <PieChart>
            <Pie
              data={statusDistribution}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              stroke="none"
            >
              {statusDistribution.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Revenue per day">
          <BarChart data={revenueByDate}>
            <CartesianGrid strokeDasharray="2 2" stroke="#ccc" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={formatPrice} />
            <Bar dataKey="revenue" fill="#A0C4FF" barSize={30} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Top 5 dishes">
          <BarChart data={topDishes}>
            <CartesianGrid strokeDasharray="2 2" stroke="#ccc" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#BDB2FF" barSize={30} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Average order value per day">
          <LineChart data={avgReceiptByDate}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={formatPrice} />
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="avg" stroke="#FFB703" strokeWidth={1.8} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>
      </Box>
    </Box>
  );
};
