// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const emptyAddress = () => ({
  id: makeId(),
  label: "Nhà",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Vietnam",
});

const formatAddress = (a: any) => {
  if (!a) return "-";
  const parts: string[] = [];
  if (a.street) parts.push(a.street);
  if (a.city) parts.push(a.city);
  if (a.state) parts.push(a.state);
  if (a.postalCode) parts.push(a.postalCode);
  if (a.country) parts.push(a.country);
  return parts.join(", ");
};

const ProfilePage: React.FC = () => {
  const storeUser = useAuthStore((s) => s.user);
  const setAuthState = (val: any) => {
    useAuthStore.setState({ user: val });
  };
  const [loading, setLoading] = useState(true);
  const [localUser, setLocalUser] = useState<any | null>(null); // user record from localStorage.users
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<any[]>([emptyAddress()]);
  const [selectedAddrIdx, setSelectedAddrIdx] = useState(0);
  const [editingAddressIdx, setEditingAddressIdx] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const usersRaw = localStorage.getItem("users") || "[]";
      const users = JSON.parse(usersRaw);
      if (!storeUser) {
        setLocalUser(null);
        setPhone("");
        setAddresses([emptyAddress()]);
        setSelectedAddrIdx(0);
        setLoading(false);
        return;
      }

      const me =
        (Array.isArray(users) &&
          users.find(
            (u: any) =>
              (u.id && storeUser.id && String(u.id) === String(storeUser.id)) ||
              ((u.email || "").toLowerCase() === (storeUser.email || storeUser.username || "").toLowerCase()) ||
              ((u.username || "").toLowerCase() === (storeUser.username || "").toLowerCase())
          )) ||
        null;

      if (me) {
        setLocalUser(me);
        setPhone(me.phone || "");
        setAddresses(Array.isArray(me.addresses) && me.addresses.length ? me.addresses : [emptyAddress()]);
        // try set selected index to shippingAddressId
        if (me.shippingAddressId && Array.isArray(me.addresses) && me.addresses.length) {
          const idx = me.addresses.findIndex((a: any) => a.id === me.shippingAddressId);
          if (idx >= 0) setSelectedAddrIdx(idx);
        } else {
          setSelectedAddrIdx(0);
        }
      } else {
        // fallback: create a local record with minimal data
        setLocalUser(null);
        setPhone("");
        setAddresses([emptyAddress()]);
        setSelectedAddrIdx(0);
      }
    } catch (err) {
      console.error("Load profile error", err);
      setLocalUser(null);
      setPhone("");
      setAddresses([emptyAddress()]);
      setSelectedAddrIdx(0);
    } finally {
      setLoading(false);
    }
    // re-run when storeUser changes
  }, [storeUser]);

  const updateAddressField = (index: number, key: string, value: string) => {
    setAddresses((prev) => {
      const nxt = prev.slice();
      nxt[index] = { ...(nxt[index] || emptyAddress()), [key]: value };
      return nxt;
    });
  };

  const addAddress = () => {
    setAddresses((p) => [...p, emptyAddress()]);
    setEditingAddressIdx(addresses.length); // open editor for new one
    setSelectedAddrIdx(addresses.length);
  };

  const removeAddress = (index: number) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    setAddresses((p) => {
      const nxt = p.slice();
      nxt.splice(index, 1);
      return nxt.length ? nxt : [emptyAddress()];
    });
    setSelectedAddrIdx((prev) => Math.max(0, Math.min(prev, addresses.length - 2)));
    setEditingAddressIdx(null);
  };

  const handleSave = () => {
    if (!storeUser) {
      toast.error("Vui lòng đăng nhập trước khi cập nhật.");
      return;
    }

    // persist to localStorage.users
    try {
      const usersRaw = localStorage.getItem("users") || "[]";
      const users = JSON.parse(usersRaw);
      const meIndex = users.findIndex(
        (u: any) =>
          (u.id && storeUser.id && String(u.id) === String(storeUser.id)) ||
          ((u.email || "").toLowerCase() === (storeUser.email || storeUser.username || "").toLowerCase()) ||
          ((u.username || "").toLowerCase() === (storeUser.username || "").toLowerCase())
      );

      const shippingAddressId = (addresses[selectedAddrIdx] && addresses[selectedAddrIdx].id) || null;
      const userRecord = {
        ...(meIndex >= 0 ? users[meIndex] : {}),
        id: (meIndex >= 0 && users[meIndex].id) || storeUser.id || makeId(),
        name: storeUser.name || storeUser.username || storeUser.email,
        email: storeUser.email || storeUser.username || "",
        username: storeUser.username || undefined,
        phone: phone,
        addresses: addresses,
        shippingAddressId,
        role: storeUser.role || "user",
        createdAt: (meIndex >= 0 && users[meIndex].createdAt) || new Date().toISOString(),
      };

      if (meIndex >= 0) {
        users[meIndex] = userRecord;
      } else {
        users.push(userRecord);
      }
      localStorage.setItem("users", JSON.stringify(users));

      // update authUser in localStorage and Zustand store
      const authUser = {
        id: userRecord.id,
        username: userRecord.username || userRecord.email,
        email: userRecord.email,
        role: userRecord.role,
        name: userRecord.name,
        phone: userRecord.phone,
        addresses: userRecord.addresses,
        shippingAddressId: userRecord.shippingAddressId,
      };
      localStorage.setItem("authUser", JSON.stringify(authUser));
      localStorage.setItem("role", authUser.role || "user");
      // update zustand store user
      try {
        setAuthState(authUser);
      } catch (err) {
        console.warn("Cannot update zustand store directly", err);
      }

      toast.success("Cập nhật thông tin thành công");
      setLocalUser(userRecord);
      setEditingAddressIdx(null);
    } catch (err) {
      console.error("Save profile error", err);
      toast.error("Lưu thông tin thất bại");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!storeUser) return <div className="p-6">Vui lòng đăng nhập</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Tài khoản</h2>

      <div className="border rounded p-4 space-y-4">
        <div><strong>Tên:</strong> {storeUser.name || storeUser.username}</div>
        <div><strong>Email:</strong> {storeUser.email}</div>
        <div><strong>Quyền:</strong> {storeUser.role}</div>

        <div>
          <label className="block text-sm  mb-1">Số điện thoại</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Số điện thoại (ví dụ: 0901234567)" />
        </div>

        <div>
          <label className="block text-sm  mb-1">Địa chỉ giao hàng</label>

          {Array.isArray(addresses) && addresses.length > 0 ? (
            <>
              <div className="mb-2">
                <select value={selectedAddrIdx} onChange={(e) => setSelectedAddrIdx(Number(e.target.value))} className="w-full border px-3 py-2 rounded">
                  {addresses.map((a, idx) => (
                    <option key={a.id || idx} value={idx}>
                      {(a.label ? a.label + " - " : "") + formatAddress(a)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mb-3">
                <button onClick={() => setEditingAddressIdx(selectedAddrIdx)} className="px-3 py-2 border rounded">Sửa địa chỉ</button>
                <button onClick={addAddress} className="px-3 py-2 border rounded text-blue-600">Thêm địa chỉ</button>
                <button onClick={() => removeAddress(selectedAddrIdx)} className="px-3 py-2 border rounded text-red-600">Xóa địa chỉ</button>
              </div>

              {editingAddressIdx !== null && (
                <div className="border rounded p-3 mb-3 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input placeholder="Nhãn (ví dụ: Nhà, Cơ quan)" value={addresses[editingAddressIdx].label} onChange={(e) => updateAddressField(editingAddressIdx, "label", e.target.value)} className="border px-2 py-2 rounded" />
                    <input placeholder="Quốc gia" value={addresses[editingAddressIdx].country} onChange={(e) => updateAddressField(editingAddressIdx, "country", e.target.value)} className="border px-2 py-2 rounded" />
                    <input placeholder="Địa chỉ (số, đường)" value={addresses[editingAddressIdx].street} onChange={(e) => updateAddressField(editingAddressIdx, "street", e.target.value)} className="border px-2 py-2 rounded md:col-span-2" />
                    <input placeholder="Thành phố" value={addresses[editingAddressIdx].city} onChange={(e) => updateAddressField(editingAddressIdx, "city", e.target.value)} className="border px-2 py-2 rounded" />
                    <input placeholder="Tỉnh/Quận" value={addresses[editingAddressIdx].state} onChange={(e) => updateAddressField(editingAddressIdx, "state", e.target.value)} className="border px-2 py-2 rounded" />
                    <input placeholder="Mã bưu chính" value={addresses[editingAddressIdx].postalCode} onChange={(e) => updateAddressField(editingAddressIdx, "postalCode", e.target.value)} className="border px-2 py-2 rounded" />
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditingAddressIdx(null)} className="px-3 py-2 border rounded">Hoàn tất</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="mb-2 text-gray-500">Bạn chưa có địa chỉ. Thêm địa chỉ để tiện đặt hàng.</div>
              <button onClick={addAddress} className="px-3 py-2 border rounded text-blue-600">Thêm địa chỉ</button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
          <button onClick={() => {
            // reset to last saved
            if (localUser) {
              setPhone(localUser.phone || "");
              setAddresses(Array.isArray(localUser.addresses) && localUser.addresses.length ? localUser.addresses : [emptyAddress()]);
              setSelectedAddrIdx(0);
              setEditingAddressIdx(null);
              toast.info("Đã đặt lại theo dữ liệu lưu");
            } else {
              toast.info("Không có dữ liệu cũ");
            }
          }} className="px-4 py-2 border rounded">Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
