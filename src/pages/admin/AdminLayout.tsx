
import React, { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);

  useEffect(() => {
    const role = localStorage.getItem("role") || authUser?.role;
    if (role !== "admin") {
      alert("Bạn không có quyền truy cập admin.");
      navigate("/", { replace: true });
      return;
    }
  }, [navigate, authUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Xin chào, {authUser?.name || authUser?.email || "Admin"}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-white border rounded p-4">
          <nav className="flex flex-col gap-2">
            <Link to="/admin" className="px-3 py-2 rounded hover:bg-gray-100">Tổng quan</Link>
            <Link to="/admin/products" className="px-3 py-2 rounded hover:bg-gray-100">Quản lý sản phẩm</Link>
            <Link to="/admin/users" className="px-3 py-2 rounded hover:bg-gray-100">Quản lý người dùng</Link>
            <Link to="/admin/orders" className="px-3 py-2 rounded hover:bg-gray-100">Quản lý đơn hàng</Link>
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
