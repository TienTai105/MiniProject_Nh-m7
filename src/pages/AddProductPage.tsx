import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import { addProduct, updateProduct, getProductById } from "../api";
import type { Product } from "../types/product";

const schema = yup.object({
  name: yup.string().required("Tên sản phẩm là bắt buộc"),
  price: (yup as any)
    .number()
    .typeError("Phải là số")
    .transform((_v: any, orig: any) => (orig === "" || orig == null ? undefined : Number(orig)))
    .positive("Phải lớn hơn 0")
    .required("Giá là bắt buộc"),
  image: yup
    .string()
    .required("Vui lòng dán URL ảnh (hoặc nhiều URL, ngăn cách bởi dấu ,)"),
  category: yup.string().required("Danh mục là bắt buộc"),
});

type FormValues = {
  id?: string;
  name: string;
  price: number | string;
  image: string; 
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

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFromFileName, setPreviewFromFileName] = useState<string | null>(null); // optional filename shown

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


  const { data: existingProduct, isLoading: isFetchingProduct, error: productError } = useQuery<Product | null>({
    queryKey: ["product", id ?? "no-id"],
    queryFn: async () => {
      if (!id) return null;
      return await getProductById(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (productError) {
      console.error("getProductById error", productError);
      toast.error("Không tải được sản phẩm: " + (productError?.message || productError));
    }
  }, [productError]);

  useEffect(() => {
    if (!existingProduct) return;
    reset({
      id: existingProduct.id,
      name: existingProduct.name ?? "",
      price: existingProduct.price ?? "",
      image: Array.isArray(existingProduct.image) ? (existingProduct.image as string[]).join(", ") : (existingProduct.image as unknown as string) ?? "",
      description: existingProduct.description ?? "",
      category: existingProduct.category ?? "",
      subCategory: existingProduct.subCategory ?? "",
      sizes: existingProduct.sizes ? (existingProduct.sizes as string[]).join(", ") : "",
      date: existingProduct.date ?? Date.now(),
      bestseller: !!existingProduct.bestseller,
      newproduct: !!existingProduct.newproduct,
    });

    if (existingProduct.image) {
      const first = Array.isArray(existingProduct.image) ? existingProduct.image[0] : (existingProduct.image as unknown as string);
      if (first && typeof first === "string" && !first.startsWith("data:")) {
        setPreviewImage(first);
      }
    }
  }, [existingProduct]);

  const handlePreviewOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFromFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreviewImage(dataUrl);
      toast.info("Ảnh đã được preview. Lưu ý: để lưu sản phẩm, hãy dán URL ảnh vào ô 'Ảnh' (hoặc upload lên một dịch vụ lưu ảnh).");
    };
    reader.readAsDataURL(file);
  };

  const addMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await addProduct(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (product: Product) => {
      return await updateProduct(product);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const onSubmit = (data: FormValues) => {
    const imageRaw = data.image?.trim() ?? "";
    if (!imageRaw) {
      toast.error("Vui lòng dán URL ảnh vào ô 'Ảnh' trước khi lưu (không gửi base64 trực tiếp).");
      return;
    }

    if (imageRaw.startsWith("data:")) {
      toast.error("Phát hiện base64 trong ô 'Ảnh'. Vui lòng upload ảnh lên dịch vụ ảnh và dán URL tại đây thay vì dán base64.");
      return;
    }

    const productPayload: Omit<Product, "id"> = {
      name: data.name,
      description: data.description ?? "",
      price: Number(data.price),
      image: imageRaw.split(",").map((s) => s.trim()).filter(Boolean),
      category: data.category,
      subCategory: data.subCategory ?? "",
      sizes: data.sizes ? data.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      date: typeof data.date === "number" ? data.date : Date.now(),
      bestseller: !!data.bestseller,
      newproduct: !!data.newproduct,
    };

    if (id) {
      const productToUpdate: Product = { ...(productPayload as Product), id };
      console.log("PUT ->", productToUpdate);
      updateMutation.mutate(productToUpdate, {
        onSuccess: () => {
          toast.success("Cập nhật sản phẩm thành công");
          navigate("/collection");
        },
        onError: (err: any) => {
          console.error("Update error:", err);
          toast.error("Cập nhật thất bại: " + (err?.message || "Lỗi"));
        },
      });
    } else {
      console.log("POST ->", productPayload);
      addMutation.mutate(productPayload as any, {
        onSuccess: (res: any) => {
          const createdId = res?.id;
          toast.success("Thêm sản phẩm thành công");
          try { localStorage.setItem("lastCreatedProductId", createdId); } catch {}
          if (createdId) navigate(`/products/edit/${createdId}`);
          else navigate("/collection");
        },
        onError: (err: any) => {
          console.error("Add error:", err);
          if (err?.response?.status === 413) {
            toast.error("Thêm thất bại: payload quá lớn. Vui lòng sử dụng URL ảnh thay vì gửi ảnh base64.");
          } else {
            toast.error("Thêm thất bại: " + (err?.message || "Lỗi"));
          }
        },
      });
    }
  };

  const mutationIsLoading = (m: any) => {
    if (!m) return false;
    if (typeof m.isLoading === "boolean") return m.isLoading;
    if (typeof m.status === "string") return m.status === "loading";
    return false;
  };

  const isBusy = Boolean(isSubmitting) || mutationIsLoading(addMutation) || mutationIsLoading(updateMutation) || Boolean(isFetchingProduct);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Tên sản phẩm</label>
          <input {...register("name")} className="w-full border p-2 rounded" />
          {errors.name && <p className="text-sm text-red-600">{String(errors.name.message)}</p>}
        </div>

        <div>
          <label className="block mb-1">Giá</label>
          <input type="number" {...register("price")} className="w-full border p-2 rounded" step="any" />
          {errors.price && <p className="text-sm text-red-600">{String(errors.price.message)}</p>}
        </div>
        <div>
          <label className="block mb-1">Ảnh</label>
          <input
            type="text"
            placeholder="https://example.com/img1.jpg hoặc /img2.jpg"
            {...register("image")}
            className="w-full border p-2 rounded"
          />
          <div className="mt-2 text-sm text-gray-600">
            LƯU Ý: Chọn file để xem preview, viết URL để lưu ảnh).
          </div>
          <input type="file" accept="image/*" onChange={handlePreviewOnly} className="w-full mt-2" />
          {previewFromFileName && <div className="text-xs text-gray-500 mt-1">Preview từ file: {previewFromFileName}</div>}
          {previewImage && (
            <img src={previewImage} alt="Preview" className="mt-2 w-40 h-40 object-contain rounded shadow-md" />
          )}
          {errors.image && <p className="text-sm text-red-600 mt-1">{String(errors.image.message)}</p>}
        </div>

        <div>
          <label className="block mb-1">Danh mục</label>
          <input {...register("category")} className="w-full border p-2 rounded" />
          {errors.category && <p className="text-sm text-red-600">{String(errors.category.message)}</p>}
        </div>

        <div>
          <label className="block mb-1">Mô tả</label>
          <textarea {...register("description")} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block mb-1">Danh mục phụ</label>
          <input {...register("subCategory")} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block mb-1">Kích cỡ (S,M,L)</label>
          <input {...register("sizes")} placeholder="S,M,L" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="inline-flex items-center mr-4">
            <input type="checkbox" {...register("bestseller")} className="mr-2" /> Bestseller
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" {...register("newproduct")} className="mr-2" /> New Product
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button type="submit" disabled={isBusy} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">
            {id ? (mutationIsLoading(updateMutation) ? "Đang cập nhật..." : "Cập nhật") : (mutationIsLoading(addMutation) ? "Đang thêm..." : "Thêm")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
