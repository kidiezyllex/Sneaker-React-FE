"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@mdi/react";
import { mdiFilterOutline, mdiClose, mdiMagnify } from "@mdi/js";
import { useProducts, useSearchProducts } from "@/hooks/product";
import { usePromotions } from "@/hooks/promotion";
import {
  applyPromotionsToProducts,
  calculateProductDiscount,
} from "@/lib/promotions";
import { getSizeLabel } from "@/utils/sizeMapping";
import type { IProductFilter } from "@/interface/request/product";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "react-toastify";
import { CustomToast } from "@/components/ui/custom-toast";
import { motion, AnimatePresence } from "framer-motion";
import VoucherForm from "@/components/ProductPage/VoucherForm";
import CartIcon from "@/components/ui/CartIcon";
import { CommonPagination } from "@/components/ui/common-pagination";
import { ProductCard, ProductFilters } from "./components";

export default function ProductsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
  });
  const [filters, setFilters] = useState<IProductFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    voucherId: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  const paginationParams: IProductFilter = {
    page: pagination.page,
    limit: pagination.limit,
    status: "ACTIVE",
  };

  const productsQuery = useProducts(paginationParams);
  const searchQuery2 = useSearchProducts(
    isSearching ? { keyword: searchQuery, status: "ACTIVE" } : { keyword: "" }
  );
  const {
    data: rawData,
    isLoading,
    isError,
  } = isSearching ? searchQuery2 : productsQuery;
  const { data: promotionsData } = usePromotions({ status: "ACTIVE" });
  const data = useMemo(() => {
    if (!rawData || !rawData.data) return rawData;
    let filteredProducts = [...rawData.data];
    if (promotionsData?.data?.promotions) {
      filteredProducts = applyPromotionsToProducts(
        filteredProducts,
        promotionsData.data.promotions
      );
    }

    if (filters.brands && filters.brands.length > 0) {
      const brandsArray = Array.isArray(filters.brands)
        ? filters.brands
        : [filters.brands];
      filteredProducts = filteredProducts.filter((product) => {
        const brandId = product.brand.id;
        return brandsArray.includes(String(brandId));
      });
    }

    if (filters.categories && filters.categories.length > 0) {
      const categoriesArray = Array.isArray(filters.categories)
        ? filters.categories
        : [filters.categories];
      filteredProducts = filteredProducts.filter((product) => {
        const categoryId = product.category.id;
        return categoriesArray.includes(String(categoryId));
      });
    }

    if (filters.color) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants.some((variant: any) => {
          const colorId = variant.color?.id;
          return String(colorId) === filters.color;
        })
      );
    }

    if (filters.size) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants.some((variant: any) => {
          const sizeId = variant.size?.id;
          return String(sizeId) === filters.size;
        })
      );
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const minPrice = filters.minPrice !== undefined ? filters.minPrice : 0;
      const maxPrice =
        filters.maxPrice !== undefined
          ? filters.maxPrice
          : Number.POSITIVE_INFINITY;

      filteredProducts = filteredProducts.filter((product: any) => {
        let price = product.variants[0]?.price || 0;

        if (promotionsData?.data?.promotions) {
          const discount = calculateProductDiscount(
            product.id,
            price,
            promotionsData.data.promotions
          );

          if (discount.discountPercent > 0) {
            price = discount.discountedPrice;
          }
        }

        return price >= minPrice && price <= maxPrice;
      });
    }

    if (sortOption !== "default") {
      filteredProducts.sort((a: any, b: any) => {
        let priceA = a.variants[0]?.price || 0;
        let priceB = b.variants[0]?.price || 0;

        if (promotionsData?.data?.promotions) {
          const discountA = calculateProductDiscount(
            a.id,
            priceA,
            promotionsData.data.promotions
          );
          const discountB = calculateProductDiscount(
            b.id,
            priceB,
            promotionsData.data.promotions
          );

          if (discountA.discountPercent > 0) {
            priceA = discountA.discountedPrice;
          }
          if (discountB.discountPercent > 0) {
            priceB = discountB.discountedPrice;
          }
        }

        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        switch (sortOption) {
          case "price-asc":
            return priceA - priceB;
          case "price-desc":
            return priceB - priceA;
          case "newest":
            return dateB - dateA;
          case "popularity":
            const stockA = a.variants.reduce(
              (total: number, variant: any) => total + variant.stock,
              0
            );
            const stockB = b.variants.reduce(
              (total: number, variant: any) => total + variant.stock,
              0
            );
            return stockB - stockA;
          default:
            return 0;
        }
      });
    }

    return {
      ...rawData,
      data: filteredProducts,
    };
  }, [rawData, filters, sortOption, pagination, promotionsData]);

  const handleFilterChange = (updatedFilters: Partial<IProductFilter>) => {
    setFilters((prev) => ({
      ...prev,
      ...updatedFilters,
    }));
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleAddToCart = (product: any) => {
    if (!product.variants?.[0]) return;

    const firstVariant = product.variants[0];

    if (firstVariant.stock === 0) {
      toast.error(<CustomToast title="Sản phẩm đã hết hàng" type="error" />, {
        icon: false,
      });
      return;
    }

    let finalPrice = firstVariant.price;
    let originalPrice = undefined;
    let discountPercent = 0;
    let hasDiscount = false;

    if (promotionsData?.data?.promotions) {
      const discount = calculateProductDiscount(
        product.id,
        firstVariant.price,
        promotionsData.data.promotions
      );

      if (discount.discountPercent > 0) {
        finalPrice = discount.discountedPrice;
        originalPrice = discount.originalPrice;
        discountPercent = discount.discountPercent;
        hasDiscount = true;
      }
    }

    const cartItem = {
      id: firstVariant.id,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: originalPrice,
      discountPercent: discountPercent,
      hasDiscount: hasDiscount,
      image:
        firstVariant.images?.[0]?.imageUrl || firstVariant.images?.[0] || "",
      quantity: 1,
      slug: product.code,
      brand: product.brand.name,
      size: firstVariant.size?.code || firstVariant.size?.name,
      colors: [firstVariant.color?.name || "Default"],
      stock: firstVariant.stock,
      colorId: String(firstVariant.color?.id || ""),
      sizeId: String(firstVariant.size?.id || ""),
      colorName: firstVariant.color?.name || "Default",
      sizeName: firstVariant.size?.value
        ? getSizeLabel(firstVariant.size.value)
        : firstVariant.size?.code || firstVariant.size?.name || "",
    };

    addToCart(cartItem, 1);
    toast.success(<CustomToast title="Đã thêm sản phẩm vào giỏ hàng" />, {
      icon: false,
    });
  };

  const handleQuickView = (product: any) => {
    window.location.href = `/products/${product.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${product.id}`;
  };

  const handleAddToWishlist = (product: any) => {
    toast.success(
      <CustomToast title="Đã thêm sản phẩm vào danh sách yêu thích" />,
      { icon: false }
    );
  };

  const handleApplyVoucher = (voucherData: {
    code: string;
    discount: number;
    voucherId: string;
  }) => {
    setAppliedVoucher(voucherData);
    toast.success(
      <CustomToast title={`Đã áp dụng mã giảm giá: ${voucherData.code}`} />,
      { icon: false }
    );
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    toast.info(<CustomToast title="Đã xóa mã giảm giá" type="info" />, {
      icon: false,
    });
  };

  const filteredProducts = useMemo(() => {
    if (!data || !data.data) return [];
    return data.data;
  }, [data]);

  return (
    <div className="relative bg-[#F6F8F7] p-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="!text-maintext hover:!text-maintext"
            >
              Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="!text-maintext hover:!text-maintext" />
          <BreadcrumbItem>
            <BreadcrumbPage className="!text-maintext hover:!text-maintext">
              Tất cả sản phẩm
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Filters - Mobile */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden w-full"
            >
              <div className="bg-white rounded-2xl shadow-sm border p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold">Bộ lọc sản phẩm</h2>
                  <Button variant="ghost" size="sm" onClick={toggleFilter}>
                    <Icon path={mdiClose} size={0.8} />
                  </Button>
                </div>
                <ProductFilters
                  filters={filters}
                  onChange={handleFilterChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden lg:block w-full lg:w-1/4 xl:w-1/5 ">
          <div className="bg-white rounded-2xl shadow-md border-2 border-white p-4 sticky top-20">
            <h2 className="font-semibold mb-4">Bộ lọc sản phẩm</h2>
            <ProductFilters filters={filters} onChange={handleFilterChange} />

            {data && data.data && data.data.length > 0 && (
              <VoucherForm
                orderValue={data.data.reduce(
                  (sum: number, product: any) =>
                    sum + (product.variants[0]?.price || 0),
                  0
                )}
                onApplyVoucher={handleApplyVoucher}
                onRemoveVoucher={handleRemoveVoucher}
                appliedVoucher={appliedVoucher}
              />
            )}
          </div>
        </div>

        {/* Products */}
        <div className="w-full lg:w-3/4 xl:w-4/5">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                onClick={toggleFilter}
                className="lg:hidden flex items-center gap-2"
              >
                <Icon path={mdiFilterOutline} size={0.8} />
                Bộ lọc
              </Button>
              <div className="relative flex-1">
                <Icon
                  path={mdiMagnify}
                  size={0.8}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-maintext"
                />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  className="pl-10 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select
              defaultValue="default"
              value={sortOption}
              onValueChange={setSortOption}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="popularity">Phổ biến nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(9)].map((_, index) => (
                <Card key={index} className="overflow-hidden h-full">
                  <div className="aspect-square w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Đã xảy ra lỗi khi tải dữ liệu</p>
              <Button onClick={() => setPagination({ ...pagination })}>
                Thử lại
              </Button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-maintext font-semibold">
                  Tìm thấy{" "}
                  <span className="text-primary text-lg">
                    {filteredProducts.length}
                  </span>{" "}
                  sản phẩm
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    promotionsData={promotionsData}
                    onAddToCart={() => handleAddToCart(product)}
                    onQuickView={() => handleQuickView(product)}
                    onAddToWishlist={() => handleAddToWishlist(product)}
                  />
                ))}
              </div>

              <div className="flex justify-center mt-8">
                {data?.pagination && (
                  <CommonPagination
                    pagination={data.pagination}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>

              <div className="lg:hidden mt-8 bg-white rounded-2xl shadow-sm border p-4">
                <VoucherForm
                  orderValue={filteredProducts.reduce(
                    (sum, product) => sum + (product.variants[0]?.price || 0),
                    0
                  )}
                  onApplyVoucher={handleApplyVoucher}
                  onRemoveVoucher={handleRemoveVoucher}
                  appliedVoucher={appliedVoucher}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-maintext mb-4">Không tìm thấy sản phẩm nào</p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({});
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full bg-primary p-2 hover:bg-primary/80 transition-all duration-300 h-10 w-10 flex items-center justify-center">
        <CartIcon className="text-white" />
      </div>
    </div>
  );
}
