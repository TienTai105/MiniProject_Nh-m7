
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

type UserRec = {
  id: string;
  name?: string;
  email: string;
  role?: "admin" | "user";
  createdAt?: string;
};

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRec[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    try {
      const arr = JSON.parse(localStorage.getItem("users") || "[]");
      setUsers(Array.isArray(arr) ? arr : []);
    } catch {
      setUsers([]);
    }
  };

  const save = (list: UserRec[]) => {
    localStorage.setItem("users", JSON.stringify(list));
    setUsers(list);
  };

  const toggleRole = (id: string) => {
    const next = users.map((u): UserRec => {
      if (u.id !== id) return u;
      const nextRole: UserRec["role"] = u.role === "admin" ? "user" : "admin";
      return { ...u, role: nextRole };
    });
    save(next);
  };

  const removeUserConfirmed = (id: string) => {
    const next = users.filter((u) => u.id !== id);
    save(next);
    setPendingDelete(null);
    toast.success("Đã xóa người dùng");
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-4">
    {/* Modal confirm for delete user */}
    {pendingDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-40" onClick={() => setPendingDelete(null)} />
        <div className="relative bg-white rounded shadow-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-2">Xác nhận xóa người dùng</h3>
          <p className="text-sm text-gray-700 mb-4">Bạn có chắc chắn muốn xóa người dùng <span className="font-medium">{pendingDelete}</span> ?</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setPendingDelete(null)} className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">Hủy</button>
            <button onClick={() => removeUserConfirmed(pendingDelete)} className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600">Xác nhận xóa</button>
          </div>
        </div>
      </div>
    )}
        <h2 className="text-lg font-semibold">Quản lý người dùng</h2>
        <button onClick={load} className="px-3 py-2 border rounded cursor-pointer">Tải lại</button>
      </div>

      <div className="space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 ">
        {users.length === 0 ? (
          <div className="text-gray-500">Chưa có người dùng.</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-500">{u.name || u.email}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
                <div className="text-xs text-gray-400">Tham gia: {new Date(u.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded ${u.role === "admin" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                  {u.role || "user"}
                </div>
                <button onClick={() => toggleRole(u.id)} className="px-3 py-2 border rounded text-gray-500 cursor-pointer">Đổi role</button>
                <button onClick={() => setPendingDelete(u.id)} className="px-3 py-2 border rounded text-red-600 cursor-pointer">Xóa</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
