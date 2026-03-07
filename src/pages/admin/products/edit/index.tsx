"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    useProductDetail,
    useUpdateProduct,
    useUpdateProductStatus,
    useUpdateProductStock,
    useUpdateProductImages,
} from "@/hooks/product";
import { useUploadImage } from "@/hooks/upload";
import {
    IProductUpdate,
    IProductStockUpdate,
    IProductStatusUpdate,
    IProductImageUpdate,
} from "@/interface/request/product";
import {
    Breadcrumb,
    BreadcrumbItem, BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
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
import { Skeleton } from "@/components/ui/skeleton";
import { createFormData } from "@/utils/cloudinary";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Icon } from "@mdi/react";
import {
    mdiTrashCanOutline,
    mdiArrowLeft,
    mdiLoading,
    mdiUpload,
    mdiImageOutline,
    mdiInformationOutline,
    mdiPackageVariant,
    mdiCheck,
    mdiArrowRight,
    mdiClose
} from "@mdi/js";
import { AnimatePresence, motion } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";
import {
    useBrands,
    useCategories,
    useMaterials
} from "@/hooks/attributes";

export default function EditProductPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState("info");
    const [uploading, setUploading] = useState(false);

    const {
        data: productData,
        isLoading,
        isError,
    } = useProductDetail(id as string);
    const updateProduct = useUpdateProduct();
    const updateProductStatus = useUpdateProductStatus();
    const updateProductStock = useUpdateProductStock();
    const updateProductImages = useUpdateProductImages();
    const uploadImage = useUploadImage();
    const { data: brandsData } = useBrands({ limit: 1000, status: "ACTIVE" });
    const { data: categoriesData } = useCategories({ limit: 1000, status: "ACTIVE" });
    const { data: materialsData } = useMaterials({ limit: 1000, status: "ACTIVE" });

    const [productUpdate, setProductUpdate] = useState<IProductUpdate>({});

    useEffect(() => {
        if (productData && productData.data) {
            const product = productData.data;

            setProductUpdate({
                name: product.name,
                brandId:
                    typeof product.brand === "string"
                        ? product.brand
                        : product.brand.id.toString(),
                categoryId:
                    typeof product.category === "string"
                        ? product.category
                        : product.category.id.toString(),
                materialId:
                    typeof product.material === "string"
                        ? product.material
                        : product.material.id.toString(),
                description: product.description,
                weight: product.weight,
                status: product.status,
            });
        }
    }, [productData]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name === "weight") {
            setProductUpdate({ ...productUpdate, [name]: parseFloat(value) || 0 });
        } else {
            setProductUpdate({ ...productUpdate, [name]: value });
        }
    };

    const handleStatusChange = async (checked: boolean) => {
        const newStatus = checked ? "ACTIVE" : "INACTIVE";
        const payload: IProductStatusUpdate = { status: newStatus };

        try {
            await updateProductStatus.mutateAsync(
                { productId: id as string, payload },
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

    const handleUpdateStock = async (variantId: number, stock: number) => {
        const payload: IProductStockUpdate = {
            variantUpdates: [{ variantId: variantId.toString(), stock }],
        };

        try {
            await updateProductStock.mutateAsync(
                { productId: id as string, payload },
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

    const handleImageUpload = async (file: File, variantId: number) => {
        try {
            setUploading(true);
            const formData = createFormData(file);
            const result = await uploadImage.mutateAsync(formData);

            const variant = productData?.data.variants.find((v) => v.id === variantId);
            if (!variant) {
                toast.error("Không tìm thấy biến thể");
                return;
            }

            const existingImages = variant.images.map((img) => img.imageUrl);
            const newImages = [...existingImages, result?.data?.imageUrl];

            const payload: IProductImageUpdate = {
                variantId: variantId.toString(),
                images: newImages,
            };

            await updateProductImages.mutateAsync(
                { productId: id as string, payload },
                {
                    onSuccess: () => {
                        toast.success("Cập nhật hình ảnh thành công");
                    },
                }
            );
        } catch (error) {
            toast.error("Cập nhật hình ảnh thất bại");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (variantId: number, imageIndex: number) => {
        try {
            const variant = productData?.data.variants.find((v) => v.id === variantId);
            if (!variant) {
                toast.error("Không tìm thấy biến thể");
                return;
            }

            const existingImages = variant.images.map((img) => img.imageUrl);
            const newImages = existingImages.filter((_, i) => i !== imageIndex);

            const payload: IProductImageUpdate = {
                variantId: variantId.toString(),
                images: newImages,
            };

            await updateProductImages.mutateAsync(
                { productId: id as string, payload },
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
                { productId: id as string, payload: productUpdate },
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

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link to="/admin/statistics">Dashboard</Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <Link to="/admin/products">Sản phẩm</Link>
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
                            <Link to="/admin/statistics">Dashboard</Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <Link to="/admin/products">Sản phẩm</Link>
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
                    </p>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </Card>
            </div>
        );
    }

    const product = productData.data;

    return (
        <div className="space-y-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Link to="/admin/statistics">
                            Dashboard
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <Link to="/admin/products">
                            Quản lý sản phẩm
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Chỉnh sửa sản phẩm</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <form onSubmit={handleUpdateInfo} className="border bg-white rounded-xl overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 rounded-xl p-4 pt-2 bg-white">
                    <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                        <TabsTrigger value="info" className="px-4 text-gray-700/70">Thông tin cơ bản</TabsTrigger>
                        <TabsTrigger value="variants" className="px-4 text-gray-700/70">Biến thể sản phẩm</TabsTrigger>
                    </TabsList>
                    <div>
                        <TabsContent value="info" className="space-y-4 text-gray-700 mt-0">
                            <Card>
                                <CardHeader className="px-0 pt-0">
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
                                <CardContent className="space-y-6 text-gray-700 px-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Tên sản phẩm <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={productUpdate.name || ""}
                                                onChange={handleInputChange}
                                                placeholder="Nhập tên sản phẩm"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="brand">Thương hiệu <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={productUpdate.brandId || ""}
                                                onValueChange={(value) =>
                                                    setProductUpdate({ ...productUpdate, brandId: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn thương hiệu">
                                                        {productUpdate.brandId
                                                            ? (brandsData?.data || []).find(
                                                                (brand) =>
                                                                    brand.id.toString() ===
                                                                    productUpdate.brandId?.toString()
                                                            )?.name || "Chọn thương hiệu"
                                                            : "Chọn thương hiệu"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(brandsData?.data || []).map((brand) => (
                                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Danh mục <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={productUpdate.categoryId || ""}
                                                onValueChange={(value) =>
                                                    setProductUpdate({ ...productUpdate, categoryId: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn danh mục">
                                                        {productUpdate.categoryId
                                                            ? (categoriesData?.data || []).find(
                                                                (category) =>
                                                                    category.id.toString() ===
                                                                    productUpdate.categoryId?.toString()
                                                            )?.name || "Chọn danh mục"
                                                            : "Chọn danh mục"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(categoriesData?.data || []).map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="material">Chất liệu <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={productUpdate.materialId || ""}
                                                onValueChange={(value) =>
                                                    setProductUpdate({ ...productUpdate, materialId: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn chất liệu">
                                                        {productUpdate.materialId
                                                            ? (materialsData?.data || []).find(
                                                                (material) =>
                                                                    material.id.toString() ===
                                                                    productUpdate.materialId?.toString()
                                                            )?.name || "Chọn chất liệu"
                                                            : "Chọn chất liệu"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(materialsData?.data || []).map((material) => (
                                                        <SelectItem key={material.id} value={material.id.toString()}>
                                                            {material.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="weight">Trọng lượng (gram)</Label>
                                            <Input
                                                id="weight"
                                                name="weight"
                                                type="number"
                                                min="0"
                                                value={productUpdate.weight || ""}
                                                onChange={handleInputChange}
                                                placeholder="Nhập trọng lượng"
                                            />
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
                                <CardFooter className="flex justify-between px-0 pb-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(-1)}
                                        className="gap-2"
                                    >
                                        <Icon path={mdiClose} size={0.8} />
                                        Hủy
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={updateProduct.isPending}
                                            className="gap-2"
                                        >
                                            {updateProduct.isPending ? (
                                                <>
                                                    <Icon
                                                        path={mdiLoading}
                                                        size={0.8}
                                                        className="animate-spin"
                                                    />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <Icon path={mdiCheck} size={0.8} />
                                                    Cập nhật thông tin
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setActiveTab("variants")}
                                            className="gap-2"
                                        >
                                            Tiếp theo
                                            <Icon path={mdiArrowRight} size={0.8} />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="variants" className="space-y-4 text-gray-700 mt-0">
                            <Card>
                                <CardHeader className="px-0 pt-0">
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
                                <CardContent className="space-y-4 px-0 pb-0">
                                    <AnimatePresence>
                                        {product.variants.map((variant, index) => (
                                            <motion.div
                                                key={variant.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="border p-5 rounded-xl bg-gray-50/30"
                                            >
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-lg font-semibold">
                                                        Biến thể #{index + 1}: {variant.color.name} - {variant.size.name || variant.size.value}
                                                    </h3>
                                                    <p className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                                                        {formatCurrency(variant.price)}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`stock-${variant.id}`}
                                                            className="text-gray-700 font-medium"
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
                                                                className="flex-1 bg-white"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="default"
                                                                onClick={(e) => {
                                                                    const input = e.currentTarget
                                                                        .previousElementSibling as HTMLInputElement;
                                                                    handleUpdateStock(
                                                                        variant.id,
                                                                        parseInt(input.value) || 0
                                                                    );
                                                                }}
                                                                disabled={updateProductStock.isPending}
                                                                className="gap-2 shrink-0"
                                                            >
                                                                {updateProductStock.isPending &&
                                                                    updateProductStock.variables?.payload
                                                                        .variantUpdates[0]?.variantId ===
                                                                    variant.id.toString() ? (
                                                                    <Icon
                                                                        path={mdiLoading}
                                                                        size={0.8}
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        <Icon path={mdiCheck} size={0.8} />
                                                                        Cập nhật
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-gray-700 font-medium">Hình ảnh sản phẩm</Label>
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="file"
                                                                id={`file-upload-${variant.id}`}
                                                                onChange={(e) => {
                                                                    const files = e.target.files;
                                                                    if (files && files.length > 0) {
                                                                        handleImageUpload(files[0], variant.id);
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
                                                                className="gap-2 bg-white"
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

                                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
                                                            {variant.images.length > 0 ? (
                                                                <AnimatePresence>
                                                                    {variant.images.map((image, i) => (
                                                                        <motion.div
                                                                            key={i}
                                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                                            transition={{ duration: 0.2 }}
                                                                            className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
                                                                            style={{ aspectRatio: "1/1" }}
                                                                        >
                                                                            <img
                                                                                src={image.imageUrl}
                                                                                alt={`Variant image ${i + 1}`}
                                                                                className="object-cover w-full h-full"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    size="icon"
                                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                    onClick={() =>
                                                                                        handleRemoveImage(variant.id, i)
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
                                                                        </motion.div>
                                                                    ))}
                                                                </AnimatePresence>
                                                            ) : (
                                                                <div
                                                                    className="flex items-center justify-center border border-dashed border-gray-300 rounded-xl text-gray-700 bg-white"
                                                                    style={{ aspectRatio: "1/1" }}
                                                                >
                                                                    <div className="flex flex-col items-center p-4">
                                                                        <Icon path={mdiImageOutline} size={1.2} className="text-gray-400" />
                                                                        <p className="text-xs mt-2 text-gray-400 text-center">Chưa có hình ảnh</p>
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
                                <CardFooter className="flex justify-between mt-4 px-0 pb-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setActiveTab("info")}
                                        className="gap-2"
                                    >
                                        <Icon path={mdiArrowLeft} size={0.8} />
                                        Quay lại
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </form>
        </div>
    );
}
