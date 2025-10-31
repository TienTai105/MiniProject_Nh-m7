import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import { addProduct, updateProduct, getProductById } from "../../api";
import type { Product } from "../../types/product";

const schema = yup.object({
  name: yup.string().required("Tên sản phẩm là bắt buộc"),
  price: (yup as any)
    .number()
    .typeError("Phải là số")
    .transform((_v: any, orig: any) =>
      orig === "" || orig == null ? undefined : Number(orig)
    )
    .positive("Phải lớn hơn 0")
    .required("Giá là bắt buộc"),
  category: yup.string().required("Danh mục là bắt buộc"),
});

type FormValues = {
  id?: string;
  name: string;
  price: number | string;
  image?: string;
  description?: string;
  category: string;
  subCategory?: string;
  sizes?: string;
  date?: number | string;
  bestseller?: boolean;
  newproduct?: boolean;
};

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { id } = useParams<{ id?: string }>();

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [sizesArray, setSizesArray] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema as any),
    defaultValues: {
      name: "",
      price: "",
      image: "",
      description: "",
      category: "",
      subCategory: "",
      sizes: "",
      bestseller: false,
      newproduct: false,
    },
  });

  // Lấy dữ liệu khi chỉnh sửa
  const { data: existingProduct } = useQuery<Product | null>({
    queryKey: ["product", id ?? "no-id"],
    queryFn: async () => {
      if (!id) return null;
      return await getProductById(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!existingProduct) return;
    reset({
      id: existingProduct.id,
      name: existingProduct.name ?? "",
      price: existingProduct.price ?? "",
      image: Array.isArray(existingProduct.image)
        ? existingProduct.image.join(", ")
        : (existingProduct.image as string) ?? "",
      description: existingProduct.description ?? "",
      category: existingProduct.category ?? "",
      subCategory: existingProduct.subCategory ?? "",
      date: existingProduct.date ?? Date.now(),
      bestseller: !!existingProduct.bestseller,
      newproduct: !!existingProduct.newproduct,
    });

    if (existingProduct.image) {
      const imgs = Array.isArray(existingProduct.image)
        ? existingProduct.image
        : [existingProduct.image as string];
      setPreviewImages(imgs);
    }

    if (existingProduct.sizes) {
      setSizesArray(existingProduct.sizes);
    }
  }, [existingProduct, reset]);

  // Hàm upload ảnh lên Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset");
      formData.append("cloud_name", "dgup7jtjx");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dgup7jtjx/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) uploadedUrls.push(data.secure_url);
      } catch (error) {
        console.error("Lỗi upload:", error);
        toast.error("Lỗi khi tải ảnh lên Cloudinary");
      }
    }

    setPreviewImages((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Xử lý thêm/xóa size tag ---
  const handleSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.trim();
    if ((e.key === "Enter" || e.key === ",") && value) {
      e.preventDefault();
      const newSize = value.toUpperCase();
      if (!sizesArray.includes(newSize)) {
        setSizesArray((prev) => [...prev, newSize]);
      }
      e.currentTarget.value = "";
    }
  };

  const removeSize = (index: number) => {
    setSizesArray((prev) => prev.filter((_, i) => i !== index));
  };

  // Mutation thêm / cập nhật
  const addMutation = useMutation({
    mutationFn: async (payload: any) => addProduct(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async (product: Product) => updateProduct(product),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const onSubmit = (data: FormValues) => {
    const productPayload: Omit<Product, "id"> = {
      name: data.name,
      description: data.description ?? "",
      price: Number(data.price),
      image: previewImages,
      category: data.category,
      subCategory: data.subCategory ?? "",
      sizes: sizesArray,
      date: typeof data.date === "number" ? data.date : Date.now(),
      bestseller: !!data.bestseller,
      newproduct: !!data.newproduct,
    };

    if (id) {
      updateMutation.mutate({ ...productPayload, id } as Product, {
        onSuccess: () => {
          toast.success("Cập nhật sản phẩm thành công");
          navigate("/admin/products");
        },
        onError: (err: any) =>
          toast.error("Cập nhật thất bại: " + (err?.message || "Lỗi")),
      });
    } else {
      addMutation.mutate(productPayload as any, {
        onSuccess: () => {
          toast.success("Thêm sản phẩm thành công");
          navigate("/admin/products");
        },
        onError: (err: any) =>
          toast.error("Thêm thất bại: " + (err?.message || "Lỗi")),
      });
    }
  };

  return (
  <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
    <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
      {id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
    </h2>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Tên sản phẩm */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Tên sản phẩm</label>
        <input
          {...register("name")}
          className="w-full p-3 rounded-xl bg-gray-50 focus:bg-white focus:shadow-md outline-none transition-all duration-200"
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      {/* Giá */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Giá</label>
        <input
          type="number"
          {...register("price")}
          step="any"
          className="w-full p-3 rounded-xl bg-gray-50 focus:bg-white focus:shadow-md outline-none transition-all duration-200"
        />
        {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>}
      </div>

   {/* Ảnh sản phẩm */}
<div>
  <label className="block mb-1 font-semibold text-gray-700">Ảnh sản phẩm</label>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleFileUpload}
    className="file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-sm file:font-medium
               file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200
               cursor-pointer w-full border border-gray-200 rounded-lg p-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-300"
  />

  {uploading && <p className="text-blue-600 mt-1">Đang tải ảnh lên...</p>}

  {previewImages.length > 0 && (
    <div className="mt-3 flex flex-wrap gap-3">
      {previewImages.map((src, index) => (
        <div key={index} className="relative w-28 h-28">
          <img
            src={src}
            alt={`preview-${index}`}
            className="w-full h-full object-cover rounded-xl shadow-md"
          />
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute top-1 right-1 bg-black bg-opacity-70 text-white rounded-full p-1 text-xs hover:bg-opacity-90 transition"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>

      {/* Danh mục */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Danh mục</label>
        <input
          {...register("category")}
          className="w-full p-3 rounded-xl bg-gray-50 focus:bg-white focus:shadow-md outline-none transition-all duration-200"
        />
      </div>

      {/* Mô tả */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Mô tả</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full p-3 rounded-xl bg-gray-50 focus:bg-white focus:shadow-md outline-none transition-all duration-200"
        />
      </div>

      {/* Danh mục phụ */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">Danh mục phụ</label>
        <input
          {...register("subCategory")}
          className="w-full p-3 rounded-xl bg-gray-50 focus:bg-white focus:shadow-md outline-none transition-all duration-200"
        />
      </div>

      {/* Sizes Tag Input */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700">Kích cỡ (Enter để thêm)</label>
        <div className="flex flex-wrap items-center gap-2 rounded-xl p-3 bg-gray-50 focus-within:bg-white focus-within:shadow-md transition-all duration-200">
          {sizesArray.map((size, index) => (
            <span
              key={index}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-800 text-white font-medium text-sm shadow-sm"
            >
              {size}
              <button
                type="button"
                onClick={() => removeSize(index)}
                className="ml-1 text-xs hover:text-gray-300 transition"
              >
                ✕
              </button>
            </span>
          ))}

          <input
            type="text"
            placeholder="Nhập size..."
            onKeyDown={handleSizeKeyDown}
            className="flex-1 min-w-[100px] p-1 bg-transparent outline-none text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Checkbox */}
      <div className="flex items-center gap-4">
        <label className="inline-flex items-center text-gray-700">
          <input type="checkbox" {...register("bestseller")} className="mr-2 accent-gray-800" />
          Bestseller
        </label>
        <label className="inline-flex items-center text-gray-700">
          <input type="checkbox" {...register("newproduct")} className="mr-2 accent-gray-800" />
          New Product
        </label>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 shadow-md transition"
        >
          {uploading ? "Đang tải ảnh..." : id ? "Cập nhật" : "Thêm"}
        </button>
      </div>
    </form>
  </div>
);


};

export default AddProductPage;
