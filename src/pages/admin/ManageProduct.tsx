import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "../../api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ManageProduct: React.FC = () => {
  const queryClient = useQueryClient();


  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Đã xóa sản phẩm thành công!");
    },
    onError: () => {
      toast.error("Xóa sản phẩm thất bại!");
    },
  });

  const handleDelete = (id: string, name: string) => {
    setPendingDelete({ id, name });
  };

  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id);
    setPendingDelete(null);
  };

  if (isLoading) return <p className="text-center mt-6">Đang tải dữ liệu...</p>;
  if (isError) return <p className="text-center mt-6 text-red-500">Lỗi tải sản phẩm</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
        <Link
          to="/admin/add-product"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {products?.length === 0 ? (
        <p>Chưa có sản phẩm nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Ảnh</th>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-left">Giá</th>
                <th className="p-2 text-left">Danh mục</th>
                <th className="p-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <img
                      src={p.image?.[0] || ""}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.price.toLocaleString()},000 VND</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2 text-center space-x-2">
                    <Link
                      to={`/admin/edit-product/${p.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
              {/* Modal confirm for product delete */}
              {pendingDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black opacity-40" onClick={() => setPendingDelete(null)} />
                  <div className="relative bg-white rounded shadow-lg p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold mb-2">Xác nhận xóa sản phẩm</h3>
                    <p className="text-sm text-gray-700 mb-4">Bạn có chắc chắn muốn xóa <span className="font-medium">{pendingDelete.name}</span> ?</p>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setPendingDelete(null)} className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">Hủy</button>
                      <button onClick={confirmDelete} className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600">Xác nhận xóa</button>
                    </div>
                  </div>
                </div>
              )}
        </div>
      )}
    </div>
  );
};

export default ManageProduct;
