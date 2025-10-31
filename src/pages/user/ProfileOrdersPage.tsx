import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";

const ProfileOrdersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const loadOrdersForUser = () => {
    try {
      const raw = localStorage.getItem("orders") || "[]";
      const arr = JSON.parse(raw);
      if (!user) {
        setOrders([]);
        return;
      }
      const filtered = arr.filter((o: any) => {
        if (!o.user) return false;
        if (user.id && o.user.id) return String(o.user.id) === String(user.id);
        return (o.user.email || "").toLowerCase() === (user.email || "").toLowerCase();
      });
      setOrders(filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error("Load orders error", err);
      setOrders([]);
    }
  };

  const deleteOrder = (orderId: string) => {
    try {
      const raw = localStorage.getItem("orders") || "[]";
      const arr = JSON.parse(raw);

      const target = arr.find((o: any) => o.id === orderId);
      if (target && (target.status === "Shipped" || target.status === "Delivered")) {
        alert("Không thể xóa đơn hàng đã được giao hoặc đang vận chuyển!");
        setPendingDelete(null);
        return;
      }

      const filtered = arr.filter((o: any) => o.id !== orderId);
      localStorage.setItem("orders", JSON.stringify(filtered));
      loadOrdersForUser();
      setPendingDelete(null);
      toast.success("Đã xóa đơn hàng");
    } catch (err) {
      console.error("Delete order error", err);
      setPendingDelete(null);
      toast.error("Xóa đơn hàng thất bại");
    }
  };

  useEffect(() => {
    loadOrdersForUser();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "orders") loadOrdersForUser();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user]);

  // the currently selected order for modal confirmation
  const targetOrder = pendingDelete ? orders.find((x) => x.id === pendingDelete) : null;

  const formatDate = (d?: string) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  const getUpdatedAt = (o: any) => {
    if (Array.isArray(o.statusHistory) && o.statusHistory.length > 0) {
      return o.statusHistory[o.statusHistory.length - 1].at;
    }
    return o.updatedAt || null;
  };

  const statusBadgeClass = (s?: string) => {
    switch ((s || "").toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (!user) return <div className="p-6">Vui lòng đăng nhập</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Đơn hàng của {user.name || user.email}</h2>

      {orders.length === 0 && <div className="text-gray-500">Chưa có đơn hàng</div>}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="bg-white shadow-md rounded-xl p-4 border border-gray-100 hover:shadow-lg transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-gray-800">Đơn: {o.id}</div>
                  <div className={`px-2 py-0.5 text-xs rounded ${statusBadgeClass(o.status)}`}>{o.status || 'Pending'}</div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  <span className="mr-2">Tạo: {formatDate(o.createdAt)}</span>
                  <span className="text-gray-400">• Cập nhật: {formatDate(getUpdatedAt(o))}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Tổng</div>
                <div className="text-lg font-semibold text-gray-900">{(o.total || o.subtotal || 0).toLocaleString('vi-VN')}.000 VND</div>
                {o.status !== "Shipped" && o.status !== "Delivered" && (
                  <button
                    onClick={() => setPendingDelete(o.id)}
                    className="mt-3 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                  >
                    Xóa đơn hàng
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="text-sm font-medium mb-2">Sản phẩm</div>
              <div className="space-y-2">
                {o.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <img src={it.image || "/no-image.png"} alt={it.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-xs text-gray-500">{it.size ? `Size: ${it.size}` : ""} • x{it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-medium">{((it.price || 0) * (it.quantity || 1)).toLocaleString('vi-VN')}.000 VND</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!pendingDelete && !!targetOrder}
        title="Xác nhận xóa đơn hàng"
        message={<span>Bạn chắc chắn muốn xóa đơn <strong>{targetOrder?.id}</strong> ?</span>}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => deleteOrder(pendingDelete!)}
        cancelLabel="Hủy"
        confirmLabel="Xác nhận xóa"
      />
    </div>
  );
};

export default ProfileOrdersPage;
