// src/pages/RegisterPage.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Eye, EyeOff } from "lucide-react";

type RegisterFormInputs = {
  username: string; 
  password: string;
  confirm: string;
  remember?: boolean;
};

const schema: yup.ObjectSchema<RegisterFormInputs> = yup
  .object({
    username: yup.string().required("Vui lòng nhập email").email("Email không hợp lệ"),
    password: yup.string().required("Vui lòng nhập mật khẩu").min(4, "Mật khẩu tối thiểu 4 ký tự"),
    confirm: yup.string().required("Vui lòng xác nhận mật khẩu").oneOf([yup.ref("password")], "Mật khẩu không khớp"),
    remember: yup.boolean().optional(),
  })
  .required();

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

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    seedAdminIfMissing();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: RegisterFormInputs) => {
    const email = String(data.username).trim().toLowerCase();
    const password = String(data.password);

    // load users
    let users: any[] = [];
    try {
      users = JSON.parse(localStorage.getItem("users") || "[]");
    } catch {
      users = [];
    }

    if (users.some((u) => u.email === email)) {
      alert("Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.");
      return;
    }

    const newUser = {
      id: makeId(),
      name: email.split("@")[0] || email,
      email,
      password,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // auto login
    const success = loginStore(email, password);
    if (!success) {
      alert("Đăng ký thành công nhưng đăng nhập thất bại");
      return;
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Chào mừng</h1>
            <p className="text-sm text-gray-500">Tạo tài khoản để lưu đơn hàng và quản lý thông tin của bạn.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">Email</label>
              <input
                {...register("username")}
                className="mt-1 block w-full rounded-lg bg-blue-50 border border-transparent px-4 py-3 text-gray-900"
                placeholder="you@example.com"
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

            <div>
              <label className="block text-sm font-medium text-black">Nhập lại mật khẩu</label>
              <div className="mt-1 relative">
                <input
                  {...register("confirm")}
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-lg bg-blue-50 border border-transparent px-4 py-3 text-gray-900"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-3 text-gray-500">
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center">
                <input type="checkbox" {...register("remember")} className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-black">Ghi nhớ đăng nhập</span>
              </label>

              <a href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>
            </div>

            <div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md">Đăng ký</button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản? <a href="/login" className="text-blue-600 hover:underline">Đăng Nhập</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
