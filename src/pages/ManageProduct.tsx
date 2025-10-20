import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "../api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ManageProduct: React.FC = () => {
  const queryClient = useQueryClient();

  // 🔹 Lấy danh sách sản phẩm
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // 🔹 Xóa sản phẩm
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
    if (window.confirm(`Bạn có chắc muốn xóa "${name}" không?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <p className="text-center mt-6">Đang tải dữ liệu...</p>;
  if (isError) return <p className="text-center mt-6 text-red-500">Lỗi tải sản phẩm</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
        <Link
          to="/add-product"
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
              <tr className="bg-gray-100 border-b">
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
                  <td className="p-2">{p.price.toLocaleString()},000₫</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2 text-center space-x-2">
                    <Link
                      to={`/edit-product/${p.id}`}
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
        </div>
      )}
    </div>
  );
};

export default ManageProduct;
