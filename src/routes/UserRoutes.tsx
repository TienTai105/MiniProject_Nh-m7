
import { Routes, Route } from "react-router-dom";

import Home from "../pages/HomePage";
import Collection from "../pages/CollectionPage";
import About from "../pages/AboutPage";
import Contact from "../pages/ContactPage";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/LoginPage";
import Register from "../pages/RegisterPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import ProfilePage from "../pages/ProfilePage"
import ProfileOrdersPage from "../pages/ProfileOrdersPage"

const UserRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile-orders" element={<ProfileOrdersPage />} />
        </Routes>
    );
};

export default UserRoutes;


