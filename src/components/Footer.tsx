import { Facebook, Instagram, Twitter } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
const Footer = () => {
  const { theme } = useThemeStore();
  return (
    <footer className={`py-10 mt-10 border-t border-gray-200 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        
        <div>
          <h2 className={`text-2xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>MyShop</h2>
          <p className={`text-gray-500 text-sm leading-6 `}>
            Nơi mua sắm những sản phẩm chất lượng cao với giá tốt nhất.
            Chúng tôi luôn mang lại trải nghiệm tuyệt vời cho khách hàng.
          </p>
        </div>

        <div>
          <h3 className={`text-lg font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            Liên kết nhanh
          </h3>
          <ul className={`space-y-2 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            <li><a href="/" className="text-gray-500 hover:text-blue-600">Trang chủ</a></li>
            <li><a href="/collection" className="text-gray-500 hover:text-blue-600">Bộ sưu tập</a></li>
            <li><a href="/about" className="text-gray-500 hover:text-blue-600">Về chúng tôi</a></li>
            <li><a href="/contact" className="text-gray-500 hover:text-blue-600">Liên hệ</a></li>
          </ul>
        </div>

        <div>
          <h3 className={`text-lg font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            Theo dõi chúng tôi
          </h3>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-blue-600"><Facebook size={20} /></a>
            <a href="#" className="hover:text-pink-500"><Instagram size={20} /></a>
            <a href="#" className="hover:text-sky-500"><Twitter size={20} /></a>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-100 pt-5">
        © {new Date().getFullYear()} MyShop. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
