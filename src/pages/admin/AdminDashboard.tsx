import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [productCount, setProductCount] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);

  const loadOverview = () => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");

  // Only count revenue for orders that have reached the 'Delivered' status
  const deliveredOrders = (Array.isArray(orders) ? orders : []).filter((o: any) => String(o.status).toLowerCase() === "delivered");
  const revenue = deliveredOrders.reduce((s: number, o: any) => s + (Number(o.total) || Number(o.subtotal) || 0), 0);

      setOverview({
        users: Array.isArray(users) ? users.length : 0,
        products: Array.isArray(products) ? products.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        revenue,
      });

      const monthData: Record<string, number> = {};
      // Aggregate revenue only for delivered orders (use the deliveredOrders computed above)
      // Use the timestamp when the order became 'Delivered' if available (statusHistory),
      // otherwise fall back to updatedAt or createdAt.
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
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const res = await fetch("https://68ef2e22b06cc802829c5e18.mockapi.io/api/products");
        const data = await res.json();
        setProductCount(data.length);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    fetchProductCount();
  }, []);

  const chartData = monthlyRevenue.map(item => ({
    month: item.month,
    revenue: item.revenue * 1000,
  }));

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
          <p className="text-3xl font-bold">{productCount}</p>
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

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">Doanh thu theo tháng</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) =>
                value >= 1000000
                  ? (value / 1000000).toFixed(1) + "M"
                  : value >= 1000
                    ? (value / 1000).toFixed(1) + "K"
                    : value
              }
            />
            <Tooltip
              formatter={(v: number) => `${v.toLocaleString()}₫`}
              labelFormatter={(label) => `Tháng ${label}`}
            />
            <Legend />

            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#FFD166" stopOpacity={0.5} />
              </linearGradient>
            </defs>

            <Bar 
            dataKey="revenue"
              fill="url(#colorRevenue)"
              radius={[10, 10, 0, 0]}
              animationBegin={200}
              animationDuration={1200}
              animationEasing="ease-out" />
          </BarChart>

        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default AdminDashboard;
