
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { UserCircle2 } from "lucide-react";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const user = authUser;

  useEffect(() => {
    const role = localStorage.getItem("role") || authUser?.role;
    if (role !== "admin") {
      alert("Bạn không có quyền truy cập admin.");
      navigate("/", { replace: true });
      return;
    }
  }, [navigate, authUser]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button className="flex items-center gap-2 p-2 rounded" onClick={() => setOpen((v) => !v)}>
                  <UserCircle2 /> {user.username || user.email || user.name}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow p-2 z-50">
                    <button
                      className="w-full text-left px-2 py-1 hover:bg-gray-100 text-gray-700"
                      onClick={handleLogout} 
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Link to="/login" className="flex items-center gap-2 text-blue-600">
                  <UserCircle2 className="w-5 h-5" /> Đăng nhập
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Xin chào, {authUser?.name || authUser?.email || "Admin"}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-white shadow rounded p-4">
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
