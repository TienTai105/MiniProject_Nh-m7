import React, { useEffect, useState } from "react";

const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });

  const loadOverview = () => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");

<<<<<<< Updated upstream
      const revenue = (Array.isArray(orders) ? orders : []).reduce((s: number, o: any) => s + (Number(o.total) || Number(o.subtotal) || 0), 0);
=======
  const deliveredOrders = (Array.isArray(orders) ? orders : []).filter((o: any) => String(o.status).toLowerCase() === "delivered");
  const revenue = deliveredOrders.reduce((s: number, o: any) => s + (Number(o.total) || Number(o.subtotal) || 0), 0);
>>>>>>> Stashed changes

      setOverview({
        users: Array.isArray(users) ? users.length : 0,
        products: Array.isArray(products) ? products.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        revenue,
      });
<<<<<<< Updated upstream
=======

      const monthData: Record<string, number> = {};
      deliveredOrders.forEach((order: any) => {
        const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
        const deliveredEntry = history.slice().reverse().find((h: any) => String(h.status).toLowerCase() === "delivered");
        const at = deliveredEntry?.at || order.updatedAt || order.createdAt;
        if (!at) return;
        const d = new Date(at);
        if (isNaN(d.getTime())) return;
        const month = `${d.getMonth() + 1}/${d.getFullYear()}`;
        const total = Number(order.total) || Number(order.subtotal) || 0;
        monthData[month] = (monthData[month] || 0) + total;
      });

      // Sắp xếp theo thời gian
      const sorted = Object.entries(monthData)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => {
          const [ma, ya] = a.month.split("/").map(Number);
          const [mb, yb] = b.month.split("/").map(Number);
          return ya !== yb ? ya - yb : ma - mb;
        });

      setMonthlyRevenue(sorted);
>>>>>>> Stashed changes
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
          <p className="text-sm text-gray-500 font-bold">Người dùng</p>
          <p className="text-2xl ">{overview.users}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
<<<<<<< Updated upstream
          <p className="text-sm text-gray-500">Sản phẩm</p>
          <p className="text-3xl font-bold">{overview.products}</p>
=======
          <p className="text-sm text-gray-500 font-bold">Sản phẩm</p>
          <p className="text-2xl ">{productCount}</p>
>>>>>>> Stashed changes
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500 font-bold">Đơn hàng</p>
          <p className="text-2xl ">{overview.orders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500 font-bold">Tổng doanh thu</p>
          <p className="text-2xl ">{overview.revenue.toLocaleString('vi-VN')}.000 VND</p>
        </div>
      </div>

      
    </div>
  );
};

export default AdminDashboard;
