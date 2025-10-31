import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";

type Order = {
  id: string;
  user?: {
    id?: string | null;
    name?: string;
    email?: string;
    phone?: string;
    addresses?: any[];
    shippingAddressId?: string | null;
  };
  items: any[];
  subtotal?: number;
  total?: number;
  status?: string;
  statusHistory?: { status: string; at: string; note?: string }[];
  updatedAt?: string;
  createdAt?: string;
};

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "orders") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const load = () => {
    try {
      const arr = JSON.parse(localStorage.getItem("orders") || "[]");

      setOrders(Array.isArray(arr) ? arr.slice().reverse() : []);
    } catch {
      setOrders([]);
    }
  };


  const updateStatus = (id: string, status: string) => {
    try {
      const raw = JSON.parse(localStorage.getItem("orders") || "[]");
      const now = new Date().toISOString();
      const updated = raw.map((o: any) => {
        if (o.id !== id) return o;
        const history = Array.isArray(o.statusHistory) ? o.statusHistory.slice() : [];
        history.push({ status, at: now, note: "Cập nhật bởi admin" });
        return { ...o, status, statusHistory: history, updatedAt: now };
      });
      localStorage.setItem("orders", JSON.stringify(updated));
      setOrders(updated.slice().reverse());
      toast.success("Cập nhật trạng thái thành công");
      if (selected?.id === id) setSelected((s) => s ? { ...s, status, statusHistory: (s.statusHistory || []).concat([{ status, at: now, note: "Cập nhật bởi admin" }]) } : s);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const removeOrderConfirmed = (id: string) => {
    try {
      const raw = JSON.parse(localStorage.getItem("orders") || "[]");
      const updated = raw.filter((o: any) => o.id !== id);
      localStorage.setItem("orders", JSON.stringify(updated));
      setOrders(updated.slice().reverse());
      if (selected?.id === id) setSelected(null);
      toast.success("Đã xóa đơn hàng");
    } catch (err) {
      console.error(err);
      toast.error("Xóa không thành công");
    } finally {
      setPendingDelete(null);
    }
  };

  const formatAddress = (a: any) => {
    if (!a) return "-";
    const parts = [];
    if (a.street) parts.push(a.street);
    if (a.city) parts.push(a.city);
    if (a.state) parts.push(a.state);
    if (a.postalCode) parts.push(a.postalCode);
    if (a.country) parts.push(a.country);
    return parts.join(", ");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Quản lý đơn hàng</h2>
          <div className="flex gap-2">
            <button onClick={load} className="px-3 py-2 border rounded cursor-pointer">Tải lại</button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-gray-500">Chưa có đơn hàng.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                <div>
                  <div className="font-medium">Đơn #{o.id}</div>
                  <div className="text-sm text-gray-500">Khách: {o.user?.name || o.user?.email || "-"}</div>
                  <div className="text-xs text-gray-400">Ngày: {new Date(o.createdAt || Date.now()).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{(o.total || o.subtotal || 0).toLocaleString('vi-VN')}.000 VND</div>
                  <div className={`px-2 py-1 rounded text-sm ${o.status === "Delivered" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {o.status || "Pending"}
                  </div>
                  <button onClick={() => setSelected(o)} className="px-3 py-1 border rounded">Chi tiết</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Chi tiết đơn hàng</h3>
        {!selected ? (
          <div className="text-gray-500">Chọn một đơn để xem chi tiết.</div>
        ) : (
          <>
            <div className="text-sm mb-2"><strong>Đơn:</strong> {selected.id}</div>
            <div className="text-sm mb-2"><strong>Khách:</strong> {selected.user?.name || selected.user?.email}</div>
            <div className="text-sm mb-2"><strong>Số điện thoại:</strong> {selected.user?.phone || "-"}</div>

            <div className="text-sm mb-2">
              <strong>Địa chỉ giao hàng:</strong>
              <div className="mt-2 space-y-2">
                {Array.isArray(selected.user?.addresses) && selected.user!.addresses.length > 0 ? (
                  selected.user!.addresses.map((a: any, idx: number) => (
                    <div key={a.id || idx} className={`p-2 border rounded ${selected.user?.shippingAddressId === a.id ? "bg-green-50 border-green-200" : ""}`}>
                      <div className="font-medium">{a.label || `Địa chỉ ${idx + 1}`}</div>
                      <div className="text-sm text-gray-600">{formatAddress(a)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">Không có địa chỉ</div>
                )}
              </div>
            </div>

            <div className="mt-3">
              <h4 className="font-medium">Sản phẩm</h4>
              <ul className="mt-2 space-y-2">
                {selected.items.map((it: any, idx: number) => (
                  <li key={idx} className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={it.image || "/no-image.png"} alt={it.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div>{it.name}</div>
                        <div className="text-xs text-gray-500">{it.size ? `Size: ${it.size}` : ""} • x{it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-medium">{((it.price || 0) * (it.quantity || 0)).toLocaleString('vi-VN')}.000 VND</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3">
              <label className="text-sm">Trạng thái</label>
              <select
                value={selected.status || "Pending"}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setSelected({ ...selected, status: newStatus });
                  updateStatus(selected.id, newStatus);
                }}
                className="w-full border px-2 py-2 rounded mt-1"
              >
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setPendingDelete(selected.id)} className="px-3 py-2 border rounded text-red-600">Xóa</button>
              <button onClick={() => setSelected(null)} className="px-3 py-2 border rounded">Đóng</button>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Xác nhận xóa đơn hàng"
        message={<span>Bạn có chắc chắn muốn xóa đơn <strong>{pendingDelete}</strong> ?</span>}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => removeOrderConfirmed(pendingDelete!)}
        cancelLabel="Hủy"
        confirmLabel="Xác nhận xóa"
      />
    </div>
  );
};

export default ManageOrders;
