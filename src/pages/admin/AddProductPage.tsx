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
      sizes: existingProduct.sizes ? existingProduct.sizes.join(", ") : "",
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
      formData.append("upload_preset", "my_preset"); // preset bạn đã tạo
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
      sizes: data.sizes ? data.sizes.split(",").map((s) => s.trim()) : [],
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tên sản phẩm */}
        <div>
          <label className="block mb-1 font-medium">Tên sản phẩm</label>
          <input {...register("name")} className="w-full border p-2 rounded" />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Giá */}
        <div>
          <label className="block mb-1 font-medium">Giá</label>
          <input
            type="number"
            {...register("price")}
            className="w-full border p-2 rounded"
            step="any"
          />
          {errors.price && (
            <p className="text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        {/* Ảnh sản phẩm */}
        <div>
          <label className="block mb-1 font-medium">Ảnh sản phẩm</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="w-full border p-2 rounded"
          />
          {uploading && <p className="text-blue-600 mt-1">Đang tải ảnh lên...</p>}

          {previewImages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {previewImages.map((src, index) => (
                <div key={index} className="relative w-28 h-28">
                  <img
                    src={src}
                    alt={`preview-${index}`}
                    className="w-full h-full object-cover rounded-lg border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-70 text-white rounded-full p-1 text-xs hover:bg-opacity-90 transition-opacity z-10"
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
          <label className="block mb-1 font-medium">Danh mục</label>
          <input {...register("category")} className="w-full border p-2 rounded" />
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <label className="block mb-1 font-medium">Mô tả</label>
          <textarea {...register("description")} className="w-full border p-2 rounded" />
        </div>

        {/* Danh mục phụ & Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Danh mục phụ</label>
            <input {...register("subCategory")} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Kích cỡ (S,M,L,XL)</label>
            <input {...register("sizes")} placeholder="S,M,L" className="w-full border p-2 rounded" />
          </div>
        </div>

        {/* Bestseller + New product */}
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center">
            <input type="checkbox" {...register("bestseller")} className="mr-2" /> Bestseller
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" {...register("newproduct")} className="mr-2" /> New Product
          </label>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? "Đang tải ảnh..." : id ? "Cập nhật" : "Thêm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
