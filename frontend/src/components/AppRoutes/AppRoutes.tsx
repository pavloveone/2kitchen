import { Route, Routes } from 'react-router-dom';
import { RestaurantList } from '../RestaurantList';
import { Start } from '../Start';
import { Menu } from '../Menu';
import { CheckoutOrder } from '../CheckoutOrder';
import { AdminPanel } from '../Admin';
import { OrderSuccess } from '../OrderSuccess';
import { Login, Register } from '../Auth';

export const AppRoutes = () => (
  <Routes>
    <Route index element={<RestaurantList />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/order-success" element={<OrderSuccess />} />
    <Route path="/restaurant/:id" element={<Start />} />
    <Route path="/restaurant/:id/menu" element={<Menu />} />
    <Route path="/restaurant/:id/checkout" element={<CheckoutOrder />} />
  </Routes>
);
