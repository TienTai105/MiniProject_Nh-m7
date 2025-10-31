
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import AdminLayout from "../pages/admin/AdminLayout";

import ManageProduct from "../pages/admin/ManageProduct";
import ManageOrders from "../pages/admin/ManageOrders";
import ManageUsers from "../pages/admin/ManageUsers";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AddProductPage from "../pages/admin/AddProductPage";

const AdminRouteWrapper: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
};

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <AdminRouteWrapper>
            <AdminLayout />
          </AdminRouteWrapper>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ManageProduct />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="add-product" element={<AddProductPage />} />
        <Route path="edit-product/:id" element={<AddProductPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
