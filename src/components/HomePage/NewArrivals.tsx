import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLatestProducts } from "@/hooks/product";
import { usePromotions } from "@/hooks/promotion";
import { ProductCard } from "@/pages/products/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "react-toastify";
import { calculateProductDiscount } from "@/lib/promotions";
import { getSizeLabel } from "@/utils/sizeMapping";

export const NewArrivals = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  const { data: latestProductsData, isLoading, isError } = useLatestProducts();
  const { data: promotionsData } = usePromotions({ status: "ACTIVE" });
  const { addToCart } = useCartStore();

  const handleAddToCart = (product: any) => {
    if (!product.variants?.[0]) return;

    const firstVariant = product.variants[0];

    if (firstVariant.stock === 0) {
      toast.error("Sản phẩm đã hết hàng");
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
    toast.success("Đã thêm sản phẩm vào giỏ hàng");
  };

  const handleQuickView = (product: any) => {
    window.location.href = `/products/${product.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${product.id}`;
  };

  const handleAddToWishlist = () => {
    toast.success("Đã thêm sản phẩm vào danh sách yêu thích");
  };

  const products = latestProductsData?.data || [];
  const displayProducts = products.slice(0, 4);

  return (
    <section
      style={{
        backgroundImage: "url(/images/new-arrivals.svg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="py-20 pt-12 bg-gradient-to-b from-white to-[#F8FBF6] dark:from-gray-900 dark:to-gray-800"
    >
      <div className="container mx-auto">
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-[#2C8B3D] uppercase bg-[#E9F5E2] rounded-full">
            Mới ra mắt
          </span>
          <h2 className="text-3xl font-semibold text-center mb-4 relative">
            <span className="inline-block relative">
              <span className="uppercase bg-gradient-to-r from-[#2C8B3D] to-[#88C140] bg-clip-text text-transparent drop-shadow-sm">
                Sản phẩm mới nhất
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </span>
          </h2>
          <p className="text-maintext dark:text-gray-300 max-w-2xl mx-auto">
            Khám phá bộ sưu tập Sneaker mới nhất với thiết kế hiện đại
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden h-full rounded-2xl border-0 bg-white shadow-md"
              >
                <div className="aspect-square w-full">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-10 w-full mt-2" />
                </div>
              </Card>
            ))
          ) : isError ? (
            <div className="col-span-4 text-center text-red-500">
              Không thể tải sản phẩm mới nhất.
            </div>
          ) : (
            displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                promotionsData={promotionsData}
                onAddToCart={() => handleAddToCart(product)}
                onQuickView={() => handleQuickView(product)}
                onAddToWishlist={handleAddToWishlist}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
