import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "../../api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/ConfirmModal";

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
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>
      <Link
        to="/admin/add-product"
        className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-900 transition"
      >
        + Thêm sản phẩm
      </Link>
    </div>

    {/* Danh sách sản phẩm */}
    {!products || products.length === 0 ? (
      <p className="text-gray-600">Chưa có sản phẩm nào.</p>
    ) : (
      <div className="space-y-4">
        {products.map((p: any) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all p-4"
          >
            {/* Ảnh + thông tin */}
            <div className="flex items-center gap-4">
              <img
                src={p.image?.[0] || ""}
                alt={p.name}
                className="w-20 h-20 object-cover rounded-lg shadow-sm"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{p.name}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Danh mục: <span className="font-medium text-gray-700">{p.category}</span>
                </p>
                <p className="text-gray-800 font-medium mt-1">
                  {p.price.toLocaleString()},000 VND
                </p>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center gap-2">
              <Link
                to={`/admin/edit-product/${p.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Sửa
              </Link>
              <button
                onClick={() => handleDelete(p.id, p.name)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        {/* Modal xác nhận xóa */}
        <ConfirmModal
          open={!!pendingDelete}
          title="Xác nhận xóa sản phẩm"
          message={
            pendingDelete ? (
              <span>
                Bạn có chắc chắn muốn xóa <strong>{pendingDelete.name}</strong> ?
              </span>
            ) : (
              ""
            )
          }
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          cancelLabel="Hủy"
          confirmLabel="Xác nhận xóa"
        />
      </div>
    )}
  </div>
);


};

export default ManageProduct;
