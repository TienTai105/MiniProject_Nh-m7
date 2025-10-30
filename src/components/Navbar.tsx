// src/components/Navbar.tsx (hoặc đường dẫn file hiện tại của bạn)
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  Sun,
  Moon,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const { cart } = useCartStore();
  const { user, logout } = useAuthStore();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Collection", path: "/collection" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleLogout = () => {
    try {
      logout();                    
    } catch (err) {
      console.warn("Logout error", err);
    }
    setOpen(false);
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <nav
      className={`w-full sticky top-0 z-50 transition-colors ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
        }`}
    >
      <div className="flex items-center justify-between py-4 px-6 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight">
          MyShop
        </Link>

        {/* Menu lớn */}
        <ul className="hidden md:flex items-center gap-8 font-medium">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `hover:text-blue-600 transition ${isActive ? "text-blue-600 font-semibold" : ""
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Icon group */}
        <div className="flex items-center gap-5">
          {/* Giỏ hàng */}
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-5 h-5 cursor-pointer hover:text-blue-600" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Toggle theme */}
          <button onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-gray-700 hover:text-blue-600" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400 hover:text-yellow-300" />
            )}
          </button>

          {/* admin / user */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button className="flex items-center gap-2 p-2 rounded" onClick={() => setOpen((v) => !v)}>
                  <UserCircle2 /> {user.username || user.email || user.name}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow p-2 z-50">
                    <Link to="/profile-orders" className="block px-2 py-1 hover:bg-gray-100 text-gray-700">Đơn hàng của tôi</Link>
                    <Link to="/profile" className="block px-2 py-1 hover:bg-gray-100 text-gray-700">Tài khoản</Link>
                    {user.role === "admin" && (
                      <Link to="/admin" className="block px-2 py-1 hover:bg-gray-100 text-gray-700">Trang quản trị</Link>
                    )}
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

          {/* Menu mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div
          className={`md:hidden ${theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
        >
          <ul className="flex flex-col items-center gap-4 py-4 font-medium">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `hover:text-blue-600 transition ${isActive ? "text-blue-600 font-semibold" : ""
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}

            {/* Login/Logout trong mobile */}
            <li>
              {user ? (
                <button
                  onClick={() => {
                    handleLogout(); // <-- dùng handler để logout + redirect + đóng menu
                  }}
                  className="flex items-center gap-2 text-red-500"
                >
                  <LogOut className="w-5 h-5" /> Đăng xuất
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-blue-600"
                >
                  <UserCircle2 className="w-5 h-5" /> Đăng nhập
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
