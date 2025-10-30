
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

type LoginFormInputs = {
  username: string; 
  password: string;
  remember?: boolean;
};

const schema = yup.object().shape({
  username: yup.string().required("Vui lòng nhập tên đăng nhập"),
  password: yup.string().required("Vui lòng nhập mật khẩu"),
});

const ADMIN_EMAIL = "admin123@gmail.com";
const ADMIN_PW = "admin123";

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const seedAdminIfMissing = () => {
  try {
    const usersRaw = localStorage.getItem("users");
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const hasAdmin = users.some((u: any) => u.email === ADMIN_EMAIL && u.role === "admin");
    if (!hasAdmin) {
      const admin = {
        id: makeId(),
        name: "Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PW,
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      users.push(admin);
      localStorage.setItem("users", JSON.stringify(users));
    }
  } catch (err) {
    console.error("seedAdminIfMissing:", err);
  }
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Lắng nghe sự thay đổi của localStorage từ các tab khác
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'users') {
        try {
          const updatedUsers = e.newValue ? JSON.parse(e.newValue) : [];
          setUsers(updatedUsers);
        } catch (err) {
          console.error('Error parsing users from storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    seedAdminIfMissing();
    // Load users khi component mount
    try {
      const usersFromStorage = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(usersFromStorage);
    } catch (err) {
      console.error('Error loading initial users:', err);
      setUsers([]);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    const username = String(data.username).trim().toLowerCase();
    const password = String(data.password);

    // Sử dụng state users thay vì đọc trực tiếp từ localStorage
    let currentUsers = users;

    if (username === ADMIN_EMAIL && password === ADMIN_PW) {
      let admin = currentUsers.find((u) => u.email === ADMIN_EMAIL && u.role === "admin");
      if (!admin) {
        admin = {
          id: makeId(),
          name: "Admin",
          email: ADMIN_EMAIL,
          password: ADMIN_PW,
          role: "admin",
          createdAt: new Date().toISOString(),
        };
        currentUsers = [...currentUsers, admin];
        localStorage.setItem("users", JSON.stringify(currentUsers));
        setUsers(currentUsers); // Cập nhật state
      }
      const success = loginStore(ADMIN_EMAIL, ADMIN_PW);
      if (!success) {
        toast.error("Đăng nhập admin thất bại", {
          autoClose: 1500
        });
        return;
      }
      toast.success("Đăng nhập thành công tài khoản admin", {
        autoClose: 1500
      });
      
      navigate("/admin");
      return;
    }

    const found = currentUsers.find((u) => u.email === username && u.password === password);
    if (!found) {
        toast.error("Email hoặc mật khẩu không đúng (hoặc chưa đăng ký).", {
        autoClose: 1500
      });
      return;
    }

    const role = found.role || "user";
    const success = loginStore(username, password);
    if (!success) {
      toast.error("Đăng nhập thất bại.", {
        autoClose: 1500
      });
      return;
    }
      toast.success("Đăng nhập thành công!", {
        autoClose: 1500
      });
  if (role === "admin") navigate("/admin");
  else navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-black">welcome to <span className="text-blue-600">MyShop</span></h1>
            <p className="text-sm text-gray-500">login to your MyShop account</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">Email</label>
              <input
                {...register("username")}
                className="mt-1 block w-full rounded-lg bg-blue-50 border border-transparent px-4 py-3 text-gray-900"
                placeholder="Nhập email..."
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black">Mật khẩu</label>
              <div className="mt-1 relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-lg bg-blue-50 border border-transparent px-4 py-3 text-gray-900"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-3 text-gray-500">
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center">
                <input type="checkbox" {...register("remember")} className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-black">Ghi nhớ đăng nhập</span>
              </label>

              <a href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>
            </div>

            <div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md">Đăng nhập</button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline">Đăng ký</Link>
          </div>
          <div className="mt-4 text-center text-xs text-gray-400">
            Admin - admin123@gmail.com | admin123
            <br />User - abc@gmail.com | 1234
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
