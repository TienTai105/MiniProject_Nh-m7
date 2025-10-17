import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  Sun,
  Moon,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { Box } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
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
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Manage products (visible to all users) */}
          <Link to="/manage-products" title="Quản lý sản phẩm" className="text-gray-700 hover:text-blue-600">
            <Box className="w-5 h-5" />
          </Link>

          {/* Toggle theme */}
          <button onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-gray-700 hover:text-blue-600" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400 hover:text-yellow-300" />
            )}
          </button>

          {/* User / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium">{user}</span>
              <button onClick={logout} title="Đăng xuất">
                <LogOut className="w-5 h-5 text-gray-700 hover:text-red-500" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              title="Đăng nhập"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <UserCircle2 className="w-6 h-6 text-gray-600 hover:text-blue-600" />
              <span className="hidden sm:inline text-sm">Đăng nhập</span>
            </Link>
          )}

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
                    logout();
                    setMenuOpen(false);
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
