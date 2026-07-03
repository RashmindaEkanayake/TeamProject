import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import SalesDashboard from '../pages/SalesDashboard';
import Inventory from '../pages/Inventory';
import GoodsReceiving from '../pages/GoodsReceiving';
import Orders from '../pages/Orders';
import Customers from '../pages/Customers';
import Suppliers from '../pages/Suppliers';
import PriceApproval from '../pages/PriceApproval';
import ItemDetails from '../pages/ItemDetails';
import Notifications from '../pages/Notifications';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<MainLayout />}>
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="goods-receiving" element={<GoodsReceiving />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="price-approvals" element={<PriceApproval />} />
        <Route path="item/:id" element={<ItemDetails />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/sales" element={<ProtectedRoute allowedRoles={['SALES_REP']} />}>
        <Route index element={<Navigate to="/sales/dashboard" replace />} />
        <Route path="dashboard" element={<SalesDashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="item/:id" element={<ItemDetails />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default AppRoutes;
