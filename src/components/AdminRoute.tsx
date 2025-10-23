
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
};

export default AdminRoute;
