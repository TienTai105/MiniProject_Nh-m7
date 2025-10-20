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
import AddProductPage from "./pages/AddProductPage";
import ManageProduct from "./pages/ManageProduct";
import { ToastContainer } from 'react-toastify';
import Login from "./pages/LoginPage";
import CartPage from "./pages/CartPage";

const App: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Toggle dark mode trên toàn HTML
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Router>
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          theme === "dark"
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
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/edit-product/:id" element={<AddProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/manage-products" element={<ManageProduct />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
