
import { Routes, Route } from "react-router-dom";

import AdminRoute from "../pages/admin/AdminRoute";
import AdminLayout from "../pages/admin/AdminLayout";

import ManageProduct from "../pages/admin/ManageProduct";
import ManageOrders from "../pages/admin/ManageOrders";
import ManageUsers from "../pages/admin/ManageUsers";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AddProductPage from "../pages/admin/AddProductPage";

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
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
