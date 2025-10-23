
import React, { useEffect, useState } from "react";

type UserRec = {
  id: string;
  name?: string;
  email: string;
  role?: "admin" | "user";
  createdAt?: string;
};

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRec[]>([]);

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

  const removeUser = (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    const next = users.filter((u) => u.id !== id);
    save(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
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
                <button onClick={() => removeUser(u.id)} className="px-3 py-2 border rounded text-red-600 cursor-pointer">Xóa</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
