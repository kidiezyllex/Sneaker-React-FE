"use client";

import { useState, useEffect, useRef } from "react";

import { useNavigate, useParams } from "react-router-dom";
import {
  useProductDetail,
  useUpdateProduct,
  useUpdateProductStatus,
  useUpdateProductStock,
  useUpdateProductImages,
  useBrands,
  useCategories,
  useMaterials,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { createFormData } from "@/utils/cloudinary";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Icon } from "@mdi/react";
import {
  mdiPlus,
  mdiTrashCanOutline,
  mdiArrowLeft,
  mdiLoading,
  mdiUpload,
  mdiImageOutline,
} from "@mdi/js";
import { AnimatePresence, motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          <h1 className="text-2xl font-bold">Chi tiết sản phẩm</h1>
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
          <Button variant="outline" onClick={() => navigate(-1)}>
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
  const { data: brandsData } = useBrands();
  const { data: categoriesData } = useCategories();
  const { data: materialsData } = useMaterials();

  const updateProduct = useUpdateProduct();
  const updateProductStatus = useUpdateProductStatus();
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
        status: product.status,
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

  const handleStatusChange = async (checked: boolean) => {
    const newStatus = checked ? "ACTIVE" : "INACTIVE";
    const payload: IProductStatusUpdate = { status: newStatus };

    try {
      await updateProductStatus.mutateAsync(
        { productId: id, payload },
        {
          onSuccess: () => {
            toast.success("Cập nhật trạng thái thành công");
            setProductUpdate({ ...productUpdate, status: newStatus });
          },
        }
      );
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
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
          <h1 className="text-2xl font-bold">Chi tiết sản phẩm</h1>
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
            <Button variant="outline" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button variant="default" onClick={() => window.location.reload()}>
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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full md:w-[500px] grid-cols-3">
          <TabsTrigger value="info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="variants">Biến thể</TabsTrigger>
          <TabsTrigger value="status">Trạng thái</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 text-maintext">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <form onSubmit={handleUpdateInfo}>
              <CardContent className="space-y-4 text-maintext">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên sản phẩm</Label>
                    <Input
                      id="name"
                      name="name"
                      value={productUpdate.name || ""}
                      onChange={handleInputChange}
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Thương hiệu</Label>
                    <Select
                      value={productUpdate.brand || ""}
                      onValueChange={(value) =>
                        setProductUpdate({ ...productUpdate, brand: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandsData?.data?.brands
                          ? brandsData.data.brands.map((brand) => {
                              const brandId =
                                typeof brand.id === "number"
                                  ? String(brand.id)
                                  : brand.id;
                              return (
                                <SelectItem key={brandId} value={brandId}>
                                  {brand.name}
                                </SelectItem>
                              );
                            })
                          : null}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục</Label>
                    <Select
                      value={productUpdate.category || ""}
                      onValueChange={(value) =>
                        setProductUpdate({ ...productUpdate, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesData?.data?.categories
                          ? categoriesData.data.categories.map((category) => {
                              const categoryId =
                                typeof category.id === "number"
                                  ? String(category.id)
                                  : category.id;
                              return (
                                <SelectItem key={categoryId} value={categoryId}>
                                  {category.name}
                                </SelectItem>
                              );
                            })
                          : null}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Chất liệu</Label>
                    <Select
                      value={productUpdate.material || ""}
                      onValueChange={(value) =>
                        setProductUpdate({ ...productUpdate, material: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chất liệu" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialsData?.data?.materials
                          ? materialsData.data.materials.map((material) => {
                              const materialId =
                                typeof material.id === "number"
                                  ? String(material.id)
                                  : material.id;
                              return (
                                <SelectItem key={materialId} value={materialId}>
                                  {material.name}
                                </SelectItem>
                              );
                            })
                          : null}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả sản phẩm</Label>
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
                    "Cập nhật thông tin"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4 text-maintext">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Biến thể sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {product.variants.map((variant) => (
                  <motion.div
                    key={variant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border p-4 rounded-[6px]"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          {variant.color?.name || "N/A"} - Size{" "}
                          {variant.size?.value || "N/A"}
                        </h3>
                        <p className="text-sm text-maintext">
                          Giá:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 0,
                          }).format(variant.price)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`stock-${variant.id}`}
                          className="text-maintext"
                        >
                          Số lượng tồn kho
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`stock-${variant.id}`}
                            type="number"
                            min="0"
                            defaultValue={variant.stock}
                            placeholder="Nhập số lượng tồn kho"
                          />
                          <Button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              handleUpdateStock(
                                String(variant.id),
                                parseInt(input.value) || 0
                              );
                            }}
                            disabled={updateProductStock.isPending}
                          >
                            {updateProductStock.isPending &&
                            updateProductStock.variables?.payload
                              .variantUpdates[0]?.variantId === variant.id ? (
                              <Icon
                                path={mdiLoading}
                                size={0.8}
                                className="animate-spin"
                              />
                            ) : (
                              "Cập nhật"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-maintext">Hình ảnh sản phẩm</Label>
                      <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              id={`image-textarea-${variant.id}`}
                              value={
                                variantImageTexts[String(variant.id)] || ""
                              }
                              onChange={(e) =>
                                handleImageTextChange(
                                  String(variant.id),
                                  e.target.value
                                )
                              }
                              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                              className="font-mono text-sm flex-1"
                            />
                            <Button
                              type="button"
                              variant="default"
                              onClick={() =>
                                handleUpdateImagesFromText(String(variant.id))
                              }
                              disabled={updateProductImages.isPending}
                              className="flex items-center gap-2 h-fit"
                            >
                              {updateProductImages.isPending ? (
                                <>
                                  <Icon
                                    path={mdiLoading}
                                    size={0.8}
                                    className="animate-spin"
                                  />
                                  Đang cập nhật...
                                </>
                              ) : (
                                "Cập nhật"
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            id={`file-upload-${variant.id}`}
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                handleImageUpload(files[0], String(variant.id));
                                e.target.value = "";
                              }
                            }}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document
                                .getElementById(`file-upload-${variant.id}`)
                                ?.click()
                            }
                            disabled={
                              uploading || updateProductImages.isPending
                            }
                            className="flex items-center gap-2"
                          >
                            {uploading ? (
                              <>
                                <Icon
                                  path={mdiLoading}
                                  size={0.8}
                                  className="animate-spin"
                                />
                                Đang tải...
                              </>
                            ) : (
                              <>
                                <Icon path={mdiUpload} size={0.8} />
                                Tải lên hình ảnh
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          {variant.images.length > 0 ? (
                            variant.images.map((image, index) => (
                              <div
                                key={index}
                                className="relative group rounded-[6px] overflow-hidden border border-gray-200"
                                style={{ aspectRatio: "1/1" }}
                              >
                                <img
                                  src={image.imageUrl}
                                  alt={`Variant image ${index + 1}`}
                                  className="object-cover w-full h-full"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                      handleRemoveImage(
                                        String(variant.id),
                                        index
                                      )
                                    }
                                    disabled={updateProductImages.isPending}
                                  >
                                    {updateProductImages.isPending ? (
                                      <Icon
                                        path={mdiLoading}
                                        size={0.8}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Icon
                                        path={mdiTrashCanOutline}
                                        size={0.8}
                                      />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div
                              className="flex items-center justify-center border border-dashed border-gray-300 rounded-[6px] text-maintext"
                              style={{ aspectRatio: "1/1" }}
                            >
                              <div className="flex flex-col items-center p-4">
                                <Icon path={mdiImageOutline} size={1.5} />
                                <p className="text-sm mt-2">Chưa có hình ảnh</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4 text-maintext">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Trạng thái sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between px-4 py-3 border rounded-[6px]">
                <div>
                  <h3 className="font-medium text-maintext">
                    Trạng thái hoạt động
                  </h3>
                  <p className="text-sm text-maintext">
                    {productUpdate.status === "ACTIVE"
                      ? "Sản phẩm đang được hiển thị và có thể mua"
                      : "Sản phẩm đang bị ẩn và không thể mua"}
                  </p>
                </div>
                <Switch
                  checked={productUpdate.status === "ACTIVE"}
                  onCheckedChange={handleStatusChange}
                  disabled={updateProductStatus.isPending}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
