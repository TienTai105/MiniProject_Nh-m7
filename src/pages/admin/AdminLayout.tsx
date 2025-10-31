
import React, { useEffect} from "react";
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

  const logout = () => {
    useAuthStore.getState().logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Shop name on the left - clickable to go home */}
            <Link to="/" className="text-lg font-bold text-gray-800 ">
              MyShop
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Xin chào, {authUser?.name || authUser?.email || "Admin"}</div>
            <div className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
              <button onClick={logout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-white rounded p-4 shadow">
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
