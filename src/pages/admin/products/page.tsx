"use client";

import { useState, useEffect, useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@mdi/react";
import {
  mdiMagnify,
  mdiPlus,
  mdiEmailFast,
  mdiPencilCircle,
  mdiDeleteCircle,
} from "@mdi/js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useProducts, useDeleteProduct } from "@/hooks/product";
import { useBrands, useCategories } from "@/hooks/attributes";
import { usePromotions } from "@/hooks/promotion";
import {
  applyPromotionsToProducts,
  calculateProductDiscount,
} from "@/lib/promotions";
import { IProductFilter } from "@/interface/request/product";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { checkImageUrl } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<IProductFilter>({
    page: 1,
    limit: 10,
  });
  const { data: promotionsData } = usePromotions();
  const { data: rawData, isLoading, isError } = useProducts(filters);
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: brandsData } = useBrands();
  const { data: categoriesData } = useCategories();

  const data = useMemo(() => {
    if (!rawData || !rawData.data) return rawData;

    let products = Array.isArray(rawData.data)
      ? [...rawData.data]
      : (rawData.data as any).products;
    if (!products) return rawData;

    if (promotionsData?.data?.promotions) {
      products = applyPromotionsToProducts(
        products,
        promotionsData.data.promotions
      );
    }

    return {
      ...rawData,
      data: products,
    };
  }, [rawData, promotionsData]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        setFilters((prev) => ({ ...prev, name: searchQuery, page: 1 }));
      } else {
        const { name, ...rest } = filters;
        setFilters({ ...rest, page: 1 });
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleFilterChange = (
    key: keyof IProductFilter,
    value: string | number | undefined
  ) => {
    if (value === "") {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters({ ...newFilters, page: 1 });
    } else {
      setFilters({ ...filters, [key]: value, page: 1 });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Đã xóa sản phẩm thành công");
          queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error: any) => {
          toast.error(
            `Xóa sản phẩm thất bại: ${
              error?.response?.data?.message ||
              error.message ||
              "Đã có lỗi xảy ra"
            }`
          );
        },
      });
    } catch (error: any) {
      toast.error(
        `Xóa sản phẩm thất bại: ${
          error?.response?.data?.message || error.message || "Đã có lỗi xảy ra"
        }`
      );
    }
  };

  const handleChangePage = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const handleOpenLightbox = (
    product: any,
    variantIndex: number = 0,
    imageIndex: number = 0
  ) => {
    const slides = (product.variants as any[]).flatMap((variant: any) =>
      (variant.images || []).map((img: any) => ({
        src: checkImageUrl(img.imageUrl),
        alt: product.name,
        download: checkImageUrl(img.imageUrl),
      }))
    );
    let startIndex = 0;
    let count = 0;
    for (let i = 0; i < product.variants.length; i++) {
      const imgs = product.variants[i].images || [];
      if (i === variantIndex) {
        startIndex = count + imageIndex;
        break;
      }
      count += imgs.length;
    }
    setLightboxSlides(slides);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/products">
                Quản lý sản phẩm
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative flex-1">
              <Icon
                path={mdiMagnify}
                size={0.8}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-maintext"
              />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <a href="/admin/products/create">
              <Button>
                <Icon path={mdiPlus} size={0.8} />
                Thêm sản phẩm mới
              </Button>
            </a>
          </div>

          <div className="my-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-maintext mb-2 font-semibold">
                  Thương hiệu
                </label>
                <Select
                  value={filters.brand || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "brand",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả thương hiệu">
                      {filters.brand
                        ? (brandsData?.data || []).find(
                            (brand) =>
                              brand.id.toString() === filters.brand?.toString()
                          )?.name || "Tất cả thương hiệu"
                        : "Tất cả thương hiệu"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                    {(brandsData?.data || []).map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-maintext mb-2 font-semibold">
                  Danh mục
                </label>
                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "category",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả danh mục">
                      {filters.category
                        ? (categoriesData?.data || []).find(
                            (category) =>
                              category.id.toString() ===
                              filters.category?.toString()
                          )?.name || "Tất cả danh mục"
                        : "Tất cả danh mục"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {(categoriesData?.data || []).map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-maintext mb-2 font-semibold">
                  Trạng thái
                </label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "status",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả trạng thái">
                      {filters.status === "ACTIVE"
                        ? "Hoạt động"
                        : filters.status === "INACTIVE"
                        ? "Không hoạt động"
                        : "Tất cả trạng thái"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <p className="text-red-500">
                Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["products"] })
                }
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Hình ảnh</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Thương hiệu</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày cập nhật</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data &&
                  Array.isArray(data.data) &&
                  data.data.length > 0 ? (
                    data.data.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50">
                        <TableCell className="px-4 py-4 whitespace-nowrap">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 cursor-pointer group"
                                  onClick={() =>
                                    handleOpenLightbox(product, 0, 0)
                                  }
                                >
                                  <img
                                    src={checkImageUrl(
                                      product.variants[0]?.images?.[0]?.imageUrl
                                    )}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click để phóng to ảnh</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-maintext">
                            {product.name}
                          </div>
                          <div className="text-sm text-maintext">
                            {product.variants.length} biến thể
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-maintext">
                          {typeof product.brand === "string"
                            ? product.brand
                            : product.brand.name}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-maintext">
                          {typeof product.category === "string"
                            ? product.category
                            : product.category.name}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm">
                          {(() => {
                            const basePrice = product.variants[0]?.price || 0;
                            const discount = promotionsData?.data?.promotions
                              ? calculateProductDiscount(
                                  product.id,
                                  basePrice,
                                  promotionsData.data.promotions
                                )
                              : {
                                  originalPrice: basePrice,
                                  discountedPrice: basePrice,
                                  discountPercent: 0,
                                };

                            return (
                              <div className="space-y-1">
                                <div
                                  className={`font-medium ${
                                    discount.discountPercent > 0
                                      ? "text-primary"
                                      : "text-maintext"
                                  }`}
                                >
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(discount.discountedPrice)}
                                </div>
                                {discount.discountPercent > 0 && (
                                  <div className="text-sm text-maintext line-through">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(discount.originalPrice)}
                                  </div>
                                )}
                                {discount.discountPercent > 0 && (
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    -{discount.discountPercent}% KM
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              product.status === "ACTIVE"
                                ? "success"
                                : "destructive"
                            }
                          >
                            {product.status === "ACTIVE"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-maintext">
                          {formatDate(product.updatedAt)}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              title="Sửa"
                              onClick={() => {
                                window.open(
                                  `/admin/products/edit/${product.id}`,
                                  "_blank"
                                );
                              }}
                            >
                              <Icon path={mdiPencilCircle} size={0.8} />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setProductToDelete(product.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  title="Xóa"
                                >
                                  <Icon path={mdiDeleteCircle} size={0.8} />
                                </Button>
                              </DialogTrigger>
                              {isDeleteDialogOpen &&
                                productToDelete === product.id && (
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Xác nhận xóa sản phẩm
                                      </DialogTitle>
                                    </DialogHeader>
                                    <p>
                                      Bạn có chắc chắn muốn xóa sản phẩm này
                                      không?
                                    </p>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setIsDeleteDialogOpen(false);
                                          setProductToDelete(null);
                                        }}
                                      >
                                        Hủy
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          if (productToDelete) {
                                            handleDeleteProduct(
                                              productToDelete
                                            );
                                            setIsDeleteDialogOpen(false);
                                            setProductToDelete(null);
                                          }
                                        }}
                                      >
                                        Xóa
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                )}
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="px-4 py-8 text-center text-maintext"
                      >
                        Không tìm thấy sản phẩm nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="hidden sm:block">
                    <p className="text-sm text-maintext">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {(data.pagination.currentPage - 1) *
                          data.pagination.perPage +
                          1}
                      </span>{" "}
                      đến{" "}
                      <span className="font-medium">
                        {Math.min(
                          data.pagination.currentPage * data.pagination.perPage,
                          data.pagination.total
                        )}
                      </span>{" "}
                      của{" "}
                      <span className="font-medium">
                        {data.pagination.total}
                      </span>{" "}
                      sản phẩm
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleChangePage(data.pagination.currentPage - 1)
                      }
                      disabled={data.pagination.currentPage === 1}
                    >
                      Trước
                    </Button>
                    {[...Array(data.pagination.totalPages)]
                      .map((_, i) => (
                        <Button
                          key={i}
                          variant={
                            data.pagination.currentPage === i + 1
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleChangePage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))
                      .slice(
                        Math.max(0, data.pagination.currentPage - 3),
                        Math.min(
                          data.pagination.totalPages,
                          data.pagination.currentPage + 2
                        )
                      )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleChangePage(data.pagination.currentPage + 1)
                      }
                      disabled={
                        data.pagination.currentPage ===
                        data.pagination.totalPages
                      }
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lightboxSlides}
          index={lightboxIndex}
          on={{ view: ({ index }) => setLightboxIndex(index) }}
          plugins={[Zoom, Download]}
          zoom={{
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
          }}
        />
      )}
    </div>
  );
}
