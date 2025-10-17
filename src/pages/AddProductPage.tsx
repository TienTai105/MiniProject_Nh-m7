import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { addProduct } from "../api";
import type { Product } from "../types/product";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  name: yup.string().required("Tên sản phẩm là bắt buộc"),
  price: yup.number().typeError("Phải là số").positive("Phải lớn hơn 0").required("Giá là bắt buộc"),
  image: yup.string().required("Ít nhất một link ảnh").test(
    "images-format",
    "Phải có ít nhất 1 link ảnh, phân cách bằng dấu phẩy",
    (val) => {
      if (!val) return false;
      const items = val.split(",").map((s) => s.trim()).filter(Boolean);
      return items.length > 0;
    }
  ),
  category: yup.string().required("Danh mục là bắt buộc"),
});

type FormValues = {
  name: string;
  price: number;
  image: string; // comma separated
  description?: string;
  category: string;
  subCategory?: string;
  sizes?: string; // comma separated
  id?: string;
  date?: number | string;
  bestseller?: boolean;
  newproduct?: boolean;
};

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (p: Product) => addProduct(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    const clientId = String(Date.now());
    const product: Product = {
      id: clientId,
      name: data.name,
      description: data.description || "",
      price: Number(data.price),
      image: data.image.split(",").map(s => s.trim()).filter(Boolean),
      category: data.category,
      subCategory: data.subCategory || ("" as string),
      sizes: data.sizes ? data.sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
      date: Date.now(),
      bestseller: !!data.bestseller,
      newproduct: !!data.newproduct,
    };

    mutation.mutate(product, {
      onSuccess: (res: Product) => {
        const createdId = res?.id || clientId;
        try { localStorage.setItem('lastCreatedProductId', createdId); } catch {}
        toast.success("Thêm sản phẩm thành công (ID: " + createdId + ")");
        navigate("/collection");
      },
      onError: (err: any) => {
        toast.error("Thêm sản phẩm thất bại: " + (err?.message || "Lỗi"));
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Thêm sản phẩm</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input {...register("name")} className="w-full border p-2 rounded" />
          {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
        </div>

        <div>
          <label className="block mb-1">Price</label>
          <input type="number" {...register("price")} className="w-full border p-2 rounded" />
          {errors.price && <div className="text-sm text-red-600">{errors.price.message}</div>}
        </div>

        <div>
          <label className="block mb-1">Image (link, cách nhau dấu ,)</label>
          <input {...register("image")} placeholder="/p_img1.png, /p_img2.png" className="w-full border p-2 rounded" />
          {errors.image && <div className="text-sm text-red-600">{errors.image.message}</div>}
        </div>

        <div>
          <label className="block mb-1">Category</label>
          <input {...register("category")} className="w-full border p-2 rounded" />
          {errors.category && <div className="text-sm text-red-600">{errors.category.message}</div>}
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea {...register("description")} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block mb-1">Sub Category</label>
          <input {...register("subCategory")} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block mb-1">Sizes (ví dụ: S,M,L)</label>
          <input {...register("sizes")} placeholder="S,M,L" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="inline-flex items-center">
            <input type="checkbox" {...register("bestseller")} className="mr-2" /> Bestseller
          </label>
          <label className="inline-flex items-center ml-4">
            <input type="checkbox" {...register("newproduct")} className="mr-2" /> New Product
          </label>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded border">Hủy</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-green-600 text-white">Thêm</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
