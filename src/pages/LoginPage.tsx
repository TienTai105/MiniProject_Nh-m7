import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Eye, EyeOff } from "lucide-react";

type LoginFormInputs = {
    username: string;
    password: string;
    remember?: boolean;
};

const schema = yup.object().shape({
    username: yup.string().required("Vui lòng nhập tên đăng nhập"),
    password: yup.string().required("Vui lòng nhập mật khẩu"),
});

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (data: LoginFormInputs) => {
        login(data.username);
        navigate("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 hidden lg:flex flex-col justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                    <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
                    <p className="opacity-90">Sign in to continue to MyShop and manage your orders, wishlist and more.</p>
                    <div className="mt-6">
                        <img src="/hero_img.png" alt="hero" className="w-full rounded-md opacity-90" />
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Đăng nhập</h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Tên đăng nhập</label>
                            <input
                                {...register("username")}
                                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Nhập tên đăng nhập..."
                            />
                            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Mật khẩu</label>
                            <div className="mt-1 relative">
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-2 top-2 text-gray-500">
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="inline-flex items-center">
                                <input type="checkbox" {...register("remember")} className="form-checkbox h-4 w-4 text-blue-600" />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Ghi nhớ đăng nhập</span>
                            </label>

                            <a href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>
                        </div>

                        <div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">Đăng nhập</button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Chưa có tài khoản? <a href="/register" className="text-blue-600 hover:underline">Đăng ký</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
