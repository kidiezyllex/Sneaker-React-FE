"use client";

import { useState, useEffect, useRef } from "react";

import { useNavigate, useParams } from "react-router-dom";
import {
  useProductDetail,
  useUpdateProduct,
  useUpdateProductStock,
  useUpdateProductImages,
  useProductFilters,
} from "@/hooks/product";
import { useUploadImage } from "@/hooks/upload";
import { getProductImages } from "@/api/product";
import {
  IProductUpdate,
  IProductVariant,
  IProductStockUpdate,
  IProductStatusUpdate,
  IProductImageUpdate,
} from "@/interface/request/product";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { createFormData } from "@/utils/cloudinary";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Icon } from "@mdi/react";
import {
  mdiPlus,
  mdiTrashCanOutline,
  mdiImageOutline,
  mdiInformationOutline,
  mdiPackageVariant,
  mdiRefresh,
  mdiContentSaveOutline,
  mdiLinkVariant,
  mdiDatabaseEditOutline,
  mdiArrowLeft,
  mdiLoading,
  mdiUpload,
} from "@mdi/js";
import { AnimatePresence, motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { id } = params;
  const [activeTab, setActiveTab] = useState("info");
  const [uploading, setUploading] = useState(false);
  const [variantImageTexts, setVariantImageTexts] = useState<
    Record<string, string>
  >({});
  const imagesApiCalledRef = useRef(false);

  if (!id) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Chi tiết sản phẩm</h1>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <Icon path={mdiArrowLeft} size={0.8} />
            Quay lại
          </Button>
        </div>
        <Card className="text-center p-4">
          <p className="text-red-500 mb-4">ID sản phẩm không hợp lệ.</p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto"
          >
            <Icon path={mdiArrowLeft} size={0.8} />
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  const {
    data: productData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useProductDetail(id);
  const { data: filtersData } = useProductFilters();

  const updateProduct = useUpdateProduct();
  const updateProductStock = useUpdateProductStock();
  const updateProductImages = useUpdateProductImages();
  const uploadImage = useUploadImage();

  const [productUpdate, setProductUpdate] = useState<IProductUpdate>({});

  useEffect(() => {
    if (productData && productData.data) {
      const product = productData.data;

      setProductUpdate({
        name: product.name,
        brand:
          typeof product.brand === "string"
            ? product.brand
            : product.brand?.id
            ? String(product.brand.id)
            : "",
        category:
          typeof product.category === "string"
            ? product.category
            : product.category?.id
            ? String(product.category.id)
            : "",
        material:
          typeof product.material === "string"
            ? product.material
            : product.material?.id
            ? String(product.material.id)
            : "",
        description: product.description,
        status: "ACTIVE",
      });

      const imageTexts: Record<string, string> = {};
      product.variants.forEach((variant) => {
        const variantId = String(variant.id);
        imageTexts[variantId] = variant.images
          .map((img) => img.imageUrl)
          .join("\n");
      });
      setVariantImageTexts(imageTexts);

      if (id && !imagesApiCalledRef.current) {
        imagesApiCalledRef.current = true;
        getProductImages(id)
          .then((response) => {
            console.log("Product images API called successfully:", response);
          })
          .catch((error) => {
            console.warn("Failed to fetch product images:", error);
          });
      }
    }
  }, [productData, id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductUpdate({ ...productUpdate, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductUpdate({ ...productUpdate, [name]: value });
  };

  const handleUpdateStock = async (variantId: string, stock: number) => {
    const payload: IProductStockUpdate = {
      variantUpdates: [{ variantId, stock }],
    };

    try {
      await updateProductStock.mutateAsync(
        { productId: id, payload },
        {
          onSuccess: () => {
            toast.success("Cập nhật số lượng tồn kho thành công");
          },
        }
      );
    } catch (error) {
      toast.error("Cập nhật số lượng tồn kho thất bại");
    }
  };

  const handleImageUpload = async (file: File, variantId: string) => {
    try {
      setUploading(true);
      const formData = createFormData(file);
      const result = await uploadImage.mutateAsync(formData);
      const variant = productData?.data.variants.find(
        (v) => String(v.id) === variantId
      );
      if (!variant) {
        toast.error("Không tìm thấy biến thể");
        return;
      }
      const existingImageUrls = variant.images.map((img) => img.imageUrl);
      const newImages = [...existingImageUrls, result?.data?.imageUrl];
      const payload: IProductImageUpdate = {
        variantId,
        images: newImages,
      };

      await updateProductImages.mutateAsync(
        { productId: id, payload },
        {
          onSuccess: () => {
            toast.success("Cập nhật hình ảnh thành công");
            setVariantImageTexts((prev) => ({
              ...prev,
              [variantId]: newImages.join("\n"),
            }));
          },
        }
      );
    } catch (error) {
      toast.error("Cập nhật hình ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (variantId: string, imageIndex: number) => {
    try {
      const variant = productData?.data.variants.find(
        (v) => String(v.id) === variantId
      );
      if (!variant) {
        toast.error("Không tìm thấy biến thể");
        return;
      }

      const imageUrls = variant.images.map((img) => img.imageUrl);
      const newImages = imageUrls.filter((_, i) => i !== imageIndex);

      const payload: IProductImageUpdate = {
        variantId,
        images: newImages,
      };

      await updateProductImages.mutateAsync(
        { productId: id, payload },
        {
          onSuccess: () => {
            toast.success("Cập nhật hình ảnh thành công");
            setVariantImageTexts((prev) => ({
              ...prev,
              [variantId]: newImages.join("\n"),
            }));
          },
        }
      );
    } catch (error) {
      toast.error("Cập nhật hình ảnh thất bại");
    }
  };

  const handleImageTextChange = (variantId: string, value: string) => {
    setVariantImageTexts((prev) => ({
      ...prev,
      [variantId]: value,
    }));
  };

  const handleUpdateImagesFromText = async (variantId: string) => {
    try {
      const textValue = variantImageTexts[variantId] || "";
      const imageUrls = textValue
        .split("\n")
        .map((url) => url.trim())
        .filter(
          (url) =>
            url.length > 0 &&
            (url.startsWith("http://") || url.startsWith("https://"))
        );

      if (imageUrls.length === 0) {
        toast.error("Vui lòng nhập ít nhất một URL hợp lệ");
        return;
      }

      const payload: IProductImageUpdate = {
        variantId,
        images: imageUrls,
      };

      await updateProductImages.mutateAsync(
        { productId: id, payload },
        {
          onSuccess: () => {
            toast.success("Cập nhật hình ảnh thành công");
          },
        }
      );
    } catch (error) {
      toast.error("Cập nhật hình ảnh thất bại");
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProduct.mutateAsync(
        { productId: id, payload: productUpdate },
        {
          onSuccess: () => {
            toast.success("Cập nhật thông tin thành công");
          },
        }
      );
    } catch (error) {
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  if (isLoading || (isFetching && !productData)) {
    return (
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/statistics">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/products">Sản phẩm</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chi tiết sản phẩm</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-28" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !productData?.data) {
    return (
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/statistics">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/products">Sản phẩm</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chi tiết sản phẩm</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Chi tiết sản phẩm</h1>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <Icon path={mdiArrowLeft} size={0.8} />
            Quay lại
          </Button>
        </div>

        <Card className="text-center p-4">
          <p className="text-red-500 mb-4">
            Đã xảy ra lỗi khi tải thông tin sản phẩm.
            {error && (
              <span className="block text-sm mt-2">
                {error instanceof Error ? error.message : "Lỗi không xác định"}
              </span>
            )}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <Icon path={mdiArrowLeft} size={0.8} />
              Quay lại
            </Button>
            <Button
              variant="default"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <Icon path={mdiRefresh} size={0.8} />
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const product = productData.data;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/statistics">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/products">
                Quản lý sản phẩm
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chỉnh sửa sản phẩm</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <Icon path={mdiArrowLeft} size={0.8} />
          Quay lại
        </Button>
      </div>
      <Card>
        <CardContent className="p-4 bg-[#FAFAFA]">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger className="px-4 text-maintext/70" value="info">
                Thông tin cơ bản
              </TabsTrigger>
              <TabsTrigger className="px-4 text-maintext/70" value="variants">
                Biến thể
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 text-maintext">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon
                        path={mdiInformationOutline}
                        size={0.8}
                        className="text-primary"
                      />
                    </div>
                    <span>Thông tin cơ bản</span>
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleUpdateInfo}>
                  <CardContent className="space-y-4 text-maintext">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel htmlFor="name">Tên sản phẩm</FormLabel>
                        <Input
                          id="name"
                          name="name"
                          value={productUpdate.name || ""}
                          onChange={handleInputChange}
                          placeholder="Nhập tên sản phẩm"
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel htmlFor="brand">Thương hiệu</FormLabel>
                        <Select
                          value={productUpdate.brand || ""}
                          onValueChange={(value) =>
                            setProductUpdate({ ...productUpdate, brand: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thương hiệu">
                              {productUpdate.brand
                                ? filtersData?.data?.brands.find(
                                    (b) => String(b.id) === productUpdate.brand
                                  )?.name || "Chọn thương hiệu"
                                : "Chọn thương hiệu"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {filtersData?.data?.brands
                              ? filtersData.data.brands.map((brand) => (
                                  <SelectItem
                                    key={brand.id}
                                    value={String(brand.id)}
                                  >
                                    {brand.name}
                                  </SelectItem>
                                ))
                              : null}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <FormLabel htmlFor="category">Danh mục</FormLabel>
                        <Select
                          value={productUpdate.category || ""}
                          onValueChange={(value) =>
                            setProductUpdate({
                              ...productUpdate,
                              category: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục">
                              {productUpdate.category
                                ? filtersData?.data?.categories.find(
                                    (c) =>
                                      String(c.id) === productUpdate.category
                                  )?.name || "Chọn danh mục"
                                : "Chọn danh mục"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {filtersData?.data?.categories
                              ? filtersData.data.categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))
                              : null}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <FormLabel htmlFor="material">Chất liệu</FormLabel>
                        <Select
                          value={productUpdate.material || ""}
                          onValueChange={(value) =>
                            setProductUpdate({
                              ...productUpdate,
                              material: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chất liệu">
                              {productUpdate.material
                                ? filtersData?.data?.materials.find(
                                    (m) =>
                                      String(m.id) === productUpdate.material
                                  )?.name || "Chọn chất liệu"
                                : "Chọn chất liệu"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {filtersData?.data?.materials
                              ? filtersData.data.materials.map((material) => (
                                  <SelectItem
                                    key={material.id}
                                    value={String(material.id)}
                                  >
                                    {material.name}
                                  </SelectItem>
                                ))
                              : null}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FormLabel htmlFor="description">
                        Mô tả sản phẩm
                      </FormLabel>
                      <Textarea
                        id="description"
                        name="description"
                        value={productUpdate.description || ""}
                        onChange={handleInputChange}
                        placeholder="Nhập mô tả sản phẩm"
                        rows={5}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateProduct.isPending}
                      className="flex items-center gap-2"
                    >
                      {updateProduct.isPending ? (
                        <>
                          <Icon
                            path={mdiLoading}
                            size={0.8}
                            className="animate-spin"
                          />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Icon path={mdiContentSaveOutline} size={0.8} />
                          Cập nhật thông tin
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="variants" className="space-y-4 text-maintext">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon
                        path={mdiPackageVariant}
                        size={0.8}
                        className="text-primary"
                      />
                    </div>
                    <span>Biến thể sản phẩm</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnimatePresence>
                      {product.variants.map((variant) => (
                        <motion.div
                          key={variant.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border p-4 rounded-2xl bg-white shadow-sm flex flex-col"
                        >
                          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="default"
                                className="font-semibold"
                              >
                                {variant.color?.name || "N/A"} - Size{" "}
                                {variant.size?.value || "N/A"}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="font-medium"
                              >
                                Giá:{" "}
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                  maximumFractionDigits: 0,
                                }).format(variant.price)}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-6 flex-1">
                            {/* Phần 1: Số lượng tồn kho */}
                            <div className="space-y-3">
                              <FormLabel
                                htmlFor={`stock-${variant.id}`}
                                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                              >
                                Tồn kho biến thể
                              </FormLabel>
                              <div className="flex gap-2">
                                <Input
                                  id={`stock-${variant.id}`}
                                  type="number"
                                  min="0"
                                  defaultValue={variant.stock}
                                  placeholder="0"
                                  className="w-24"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    const input = e.currentTarget
                                      .previousElementSibling as HTMLInputElement;
                                    handleUpdateStock(
                                      String(variant.id),
                                      parseInt(input.value) || 0
                                    );
                                  }}
                                  disabled={updateProductStock.isPending}
                                  className="flex-1"
                                >
                                  {updateProductStock.isPending &&
                                  updateProductStock.variables?.payload
                                    .variantUpdates[0]?.variantId ===
                                    String(variant.id) ? (
                                    <Icon
                                      path={mdiLoading}
                                      size={0.8}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <>
                                      <Icon
                                        path={mdiDatabaseEditOutline}
                                        size={0.8}
                                      />
                                      Cập nhật kho
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Phần 2: Hình ảnh sản phẩm */}
                            <div className="space-y-3">
                              <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                Hình ảnh biến thể
                              </FormLabel>
                              <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <Input
                                      id={`image-textarea-${variant.id}`}
                                      value={
                                        variantImageTexts[String(variant.id)] ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleImageTextChange(
                                          String(variant.id),
                                          e.target.value
                                        )
                                      }
                                      placeholder="URL hình ảnh (mỗi dòng 1 URL)"
                                      className="font-mono text-xs flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="default"
                                      size="sm"
                                      onClick={() =>
                                        handleUpdateImagesFromText(
                                          String(variant.id)
                                        )
                                      }
                                      disabled={updateProductImages.isPending}
                                      className="flex items-center gap-2"
                                    >
                                      <Icon path={mdiLinkVariant} size={0.8} />
                                      Lưu URL
                                    </Button>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      id={`file-upload-${variant.id}`}
                                      onChange={(e) => {
                                        const files = e.target.files;
                                        if (files && files.length > 0) {
                                          handleImageUpload(
                                            files[0],
                                            String(variant.id)
                                          );
                                          e.target.value = "";
                                        }
                                      }}
                                      accept="image/*"
                                      className="hidden"
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() =>
                                        document
                                          .getElementById(
                                            `file-upload-${variant.id}`
                                          )
                                          ?.click()
                                      }
                                      disabled={
                                        uploading ||
                                        updateProductImages.isPending
                                      }
                                      className="w-full"
                                    >
                                      {uploading ? (
                                        <Icon
                                          path={mdiLoading}
                                          size={0.8}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <>
                                          <Icon
                                            path={mdiUpload}
                                            size={0.8}
                                            className="mr-2"
                                          />
                                          Tải ảnh lên
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                  {variant.images.length > 0 ? (
                                    variant.images.map((image, index) => (
                                      <div
                                        key={index}
                                        className="relative group rounded-xl overflow-hidden border border-gray-100"
                                        style={{ aspectRatio: "1/1" }}
                                      >
                                        <img
                                          src={image.imageUrl}
                                          alt={`Variant image ${index + 1}`}
                                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() =>
                                              handleRemoveImage(
                                                String(variant.id),
                                                index
                                              )
                                            }
                                            disabled={
                                              updateProductImages.isPending
                                            }
                                          >
                                            <Icon
                                              path={mdiTrashCanOutline}
                                              size={0.8}
                                            />
                                          </Button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="col-span-4 flex items-center justify-center border border-dashed border-gray-200 rounded-xl h-24 text-gray-400">
                                      <div className="flex flex-col items-center">
                                        <Icon path={mdiImageOutline} size={1} />
                                        <p className="text-[10px] mt-1 italic">
                                          Chưa có ảnh
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
