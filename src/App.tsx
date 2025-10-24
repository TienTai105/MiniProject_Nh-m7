import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import { useThemeStore } from "./store/themeStore";
import Home from "./pages/HomePage";
import Collection from "./pages/CollectionPage";
import About from "./pages/AboutPage";
import Contact from "./pages/ContactPage";
import ProductDetail from "./pages/ProductDetail";
import { ToastContainer } from 'react-toastify';
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

import ProfilePage from "./pages/ProfilePage"
import ProfileOrdersPage from "./pages/ProfileOrdersPage"

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import ManageProduct from "./pages/admin/ManageProduct";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddProductPage from "./pages/admin/AddProductPage";

const App: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Toggle dark mode trên toàn HTML
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Router>
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
          }`}
      >
        <Navbar />
        <SearchBar />
        <main className="flex-1 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            {/* <Route path="/add-product" element={<AddProductPage />} /> */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            {/* <Route path="/edit-product/:id" element={<AddProductPage />} /> */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile-orders" element={<ProfileOrdersPage />} />

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



            {/* <Route path="/manage-products" element={<ManageProduct />} />
            <Route path="/manage-orders" element={<ManageOrders />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/admin" element={<AdminDashboard />} /> */}
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
