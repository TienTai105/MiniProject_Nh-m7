
import { Routes, Route } from "react-router-dom";

import Home from "../pages/user/HomePage";
import Collection from "../pages/user/CollectionPage";
import About from "../pages/user/AboutPage";
import Contact from "../pages/user/ContactPage";
import ProductDetail from "../pages/user/ProductDetail";
import Login from "../pages/user/LoginPage";
import Register from "../pages/user/RegisterPage";
import CartPage from "../pages/user/CartPage";
import CheckoutPage from "../pages/user/CheckoutPage";

import ProfilePage from "../pages/user/ProfilePage"
import ProfileOrdersPage from "../pages/user/ProfileOrdersPage"

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


