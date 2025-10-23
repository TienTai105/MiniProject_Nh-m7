import React, { useEffect, useState } from "react";

const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });

  const loadOverview = () => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");

      const revenue = (Array.isArray(orders) ? orders : []).reduce((s: number, o: any) => s + (Number(o.total) || Number(o.subtotal) || 0), 0);

      setOverview({
        users: Array.isArray(users) ? users.length : 0,
        products: Array.isArray(products) ? products.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        revenue,
      });
    } catch (err) {
      setOverview({ users: 0, products: 0, orders: 0, revenue: 0 });
    }
  };

  useEffect(() => {
    loadOverview();
    const onStorage = (e: StorageEvent) => {
      if (["users", "products", "orders"].includes(e.key || "")) loadOverview();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 text-black">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Người dùng</p>
          <p className="text-3xl font-bold">{overview.users}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Sản phẩm</p>
          <p className="text-3xl font-bold">{overview.products}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Đơn hàng</p>
          <p className="text-3xl font-bold">{overview.orders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Tổng doanh thu</p>
          <p className="text-3xl font-bold">{overview.revenue.toLocaleString('vi-VN')}.000 VND</p>
        </div>
      </div>

      
    </div>
  );
};

export default AdminDashboard;
