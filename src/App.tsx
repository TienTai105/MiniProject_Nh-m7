import { useEffect } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useThemeStore } from "./store/themeStore";
import { ToastContainer } from 'react-toastify';

import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";

const App: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Toggle dark mode trên toàn HTML
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const AppBody: React.FC = () => {
    const location = useLocation();
    const isAdminArea = location.pathname.startsWith("/admin");

    return (
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
          }`}
      >
        {!isAdminArea && <Navbar />}
        <main className="flex-1 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
          {isAdminArea ? <AdminRoutes /> : <UserRoutes />}
        </main>
        {!isAdminArea && <Footer />}
        <ToastContainer />
      </div>
    );
  };

  return (
    <Router>
      <AppBody />
    </Router>
  );
};

export default App;
