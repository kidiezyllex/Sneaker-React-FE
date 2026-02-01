"use client";

import React, { useState, useEffect, useMemo } from "react";
import CartIcon from "@/components/ui/CartIcon";

const zoomStyles = `
  .cursor-zoom-in {
    cursor: zoom-in;
  }
  .cursor-zoom-in:hover {
    cursor: zoom-in;
  }
  .cursor-none {
    cursor: none !important;
  }
  .zoom-container:hover .zoom-lens {
    opacity: 1;
    transform: scale(1);
  }
  .zoom-preview {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  .zoom-lens {
    transition: all 0.1s ease-out;
    backdrop-filter: blur(1px);
  }
  .zoom-lens::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
    pointer-events: none;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = zoomStyles;
  document.head.appendChild(styleSheet);
}
import { useProductDetail, useProducts } from "@/hooks/product";
import { SimilarProducts } from "./components/SimilarProducts";
import { ImageZoom } from "./components/ImageZoom";
import { usePromotions } from "@/hooks/promotion";
import {
  calculateProductDiscount,
  applyPromotionsToProducts,
  filterActivePromotions,
} from "@/lib/promotions";
import { formatPrice } from "@/utils/formatters";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Icon } from "@mdi/react";
import {
  mdiCartOutline,
  mdiHeartOutline,
  mdiCheck,
  mdiChevronLeft,
  mdiChevronRight,
  mdiStar,
  mdiStarOutline,
  mdiTruck,
  mdiShield,
  mdiCreditCard,
  mdiRefresh,
  mdiRuler,
  mdiPalette,
  mdiInformation,
  mdiCartPlus,
} from "@mdi/js";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { checkImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/useCartStore";
import {
  IProduct,
  IPopulatedProductVariant,
  IProductImage,
} from "@/interface/response/product";
import { motion } from "framer-motion";

import { useParams, Link, useNavigate } from "react-router-dom";

export default function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const slug = params.slug;
  const [productId, setProductId] = useState<string>("");
  const { data: productData, isLoading } = useProductDetail(productId);
  const { data: allProductsData } = useProducts({ limit: 8 });
  const { data: promotionsData } = usePromotions({ status: "ACTIVE" });
  const { addToCart } = useCartStore();

  const [selectedVariant, setSelectedVariant] =
    useState<IPopulatedProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productDiscount, setProductDiscount] = useState<any>(null);

  const handleAddToCartSimilar = (similarProduct: any) => {
    if (!similarProduct.variants?.[0]) return;

    const firstVariant = similarProduct.variants[0];

    if (firstVariant.stock === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    let finalPrice = firstVariant.price;
    let originalPrice = undefined;
    let discountPercent = 0;
    let hasDiscount = false;

    if (promotionsData?.data?.promotions) {
      const activePromotions = filterActivePromotions(
        promotionsData.data.promotions
      );
      const discount = calculateProductDiscount(
        similarProduct.id,
        firstVariant.price,
        activePromotions
      );

      if (discount.discountPercent > 0) {
        finalPrice = discount.discountedPrice;
        originalPrice = discount.originalPrice;
        discountPercent = discount.discountPercent;
        hasDiscount = true;
      }
    }

    const cartItem = {
      id: firstVariant.id, // Use variant ID as main ID
      productId: similarProduct.id, // Separate product ID
      name: similarProduct.name,
      price: finalPrice,
      originalPrice: originalPrice,
      discountPercent: discountPercent,
      hasDiscount: hasDiscount,
      image: firstVariant.images?.[0]?.imageUrl || "",
      quantity: 1,
      slug: similarProduct.code,
      brand:
        typeof similarProduct.brand === "string"
          ? similarProduct.brand
          : similarProduct.brand.name,
      size: firstVariant.sizeId?.code,
      colors: [firstVariant.colorId?.name || "Default"],
      stock: firstVariant.stock,
      colorId: firstVariant.colorId?.id || "",
      sizeId: firstVariant.sizeId?.id || "",
      colorName: firstVariant.colorId?.name || "Default",
      sizeName: firstVariant.sizeId?.value
        ? String(firstVariant.sizeId.value)
        : "",
    };

    addToCart(cartItem, 1);
    toast.success("Đã thêm sản phẩm vào giỏ hàng");
  };

  const handleQuickViewSimilar = (similarProduct: any) => {
    navigate(`/products/${similarProduct.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${similarProduct.id}`);
  };

  const handleAddToWishlistSimilar = () => {
    toast.success("Đã thêm vào danh sách yêu thích");
  };

  useEffect(() => {
    if (typeof slug === "string") {
      const id = slug.split("-").pop();
      if (id) {
        setProductId(id);
      }
    }
  }, [slug]);

  useEffect(() => {
    if (
      productData?.data?.variants?.length &&
      productData.data.variants.length > 0
    ) {
      const firstVariant = productData.data.variants[0];
      setSelectedVariant(firstVariant);
      setSelectedColor(String(firstVariant.color.id));
      setSelectedSize(String(firstVariant.size.id));
      setCurrentImageIndex(0);
    }
  }, [productData]);

  useEffect(() => {
    if (
      productData?.data &&
      selectedVariant &&
      promotionsData?.data?.promotions
    ) {
      const activePromotions = filterActivePromotions(
        promotionsData.data.promotions
      );
      const discount = calculateProductDiscount(
        productData.data.id,
        selectedVariant.price,
        activePromotions
      );
      setProductDiscount(discount);
    } else {
      setProductDiscount(null);
    }
  }, [productData, selectedVariant, promotionsData]);

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);

    const matchingVariant = productData?.data?.variants.find(
      (v) =>
        String(v.color.id) === String(colorId) &&
        String(v.size.id) === String(selectedSize)
    );

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      setCurrentImageIndex(0);
    } else {
      const firstVariantWithColor = productData?.data?.variants.find(
        (v) => String(v.color.id) === String(colorId)
      );
      if (firstVariantWithColor) {
        setSelectedVariant(firstVariantWithColor);
        setSelectedSize(String(firstVariantWithColor.size.id));
        setCurrentImageIndex(0);
      }
    }
  };

  const handleSizeSelect = (sizeId: string) => {
    setSelectedSize(sizeId);

    const matchingVariant = productData?.data?.variants.find(
      (v) =>
        String(v.color.id) === String(selectedColor) &&
        String(v.size.id) === String(sizeId)
    );

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !productData?.data) return;

    if (selectedVariant.stock === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    if (quantity > selectedVariant.stock) {
      toast.error(`Chỉ còn ${selectedVariant.stock} sản phẩm trong kho`);
      return;
    }

    const finalPrice =
      productDiscount && productDiscount.discountPercent > 0
        ? productDiscount.discountedPrice
        : selectedVariant.price;

    const originalPrice =
      productDiscount && productDiscount.discountPercent > 0
        ? productDiscount.originalPrice
        : undefined;

    const cartItem = {
      id: selectedVariant.id, // Use variant ID as main ID
      productId: productData.data.id, // Separate product ID
      name: productData.data.name,
      price: finalPrice,
      originalPrice: originalPrice,
      discountPercent: productDiscount?.discountPercent || 0,
      hasDiscount: Boolean(
        productDiscount && productDiscount.discountPercent > 0
      ),
      image: selectedVariant.images?.[0]?.imageUrl || "",
      quantity: quantity,
      slug: productData.data.code,
      brand:
        typeof productData.data.brand === "string"
          ? productData.data.brand
          : productData.data.brand.name,
      size: String(selectedVariant.size.value),
      colors: [selectedVariant.color.name],
      stock: selectedVariant.stock,
      colorId: String(selectedVariant.color.id),
      sizeId: String(selectedVariant.size.id),
      colorName: selectedVariant.color?.name || "Default",
      sizeName: selectedVariant.size.value
        ? String(selectedVariant.size.value)
        : "",
    };

    addToCart(cartItem, quantity);
    toast.success(
      `Đã thêm ${quantity} sản phẩm vào giỏ hàng${originalPrice ? " với giá ưu đãi" : ""
      }`
    );
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    if (
      !selectedVariant ||
      !selectedVariant.images ||
      selectedVariant.images.length === 0
    )
      return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedVariant.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (
      !selectedVariant ||
      !selectedVariant.images ||
      selectedVariant.images.length === 0
    )
      return;
    setCurrentImageIndex((prev) =>
      prev === selectedVariant.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedVariant) return;
    const maxQuantity = selectedVariant.stock || 0;
    setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
  };

  const similarProducts = useMemo(() => {
    if (!allProductsData?.data || !productData?.data) return [];

    let filteredProducts = allProductsData.data
      .filter((p: IProduct) => p.id !== productData.data.id)
      .slice(0, 4);

    if (promotionsData?.data?.promotions) {
      const activePromotions = filterActivePromotions(
        promotionsData.data.promotions
      );
      filteredProducts = applyPromotionsToProducts(
        filteredProducts,
        activePromotions
      );
    }

    return filteredProducts;
  }, [allProductsData, productData?.data, promotionsData]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/5">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-square w-full rounded-lg"
                />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-2/5 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-2 pt-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-12 rounded-full" />
              ))}
            </div>
            <div className="flex gap-2">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-16" />
              ))}
            </div>
            <div className="pt-4 flex gap-4">
              <Skeleton className="h-14 w-40" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const product = productData?.data;
  if (!product) return null;

  const brandName =
    typeof product.brand === "string" ? product.brand : product.brand.name;
  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category.name;
  const materialName =
    typeof product.material === "string"
      ? product.material
      : product.material.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 to-white">
      <div className="p-8">
        {/* Enhanced Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link
                  to="/"
                  className="!text-maintext hover:!text-maintext transition-colors"
                >
                  Trang chủ
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="!text-maintext hover:!text-maintext" />
              <BreadcrumbItem>
                <Link
                  to="/products"
                  className="!text-maintext hover:!text-maintext transition-colors"
                >
                  Tất cả sản phẩm
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="!text-maintext hover:!text-maintext" />
              <BreadcrumbItem>
                <BreadcrumbPage className="!text-maintext hover:!text-maintext">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
          {/* Enhanced Product Images Section */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white border flex items-center justify-center">
              {selectedVariant &&
                selectedVariant.images &&
                selectedVariant.images.length > 0 ? (
                <>
                  <ImageZoom
                    src={checkImageUrl(
                      selectedVariant.images[currentImageIndex]?.imageUrl
                    )}
                    alt={product.name}
                    className="aspect-square"
                  />
                  {selectedVariant.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 bg-white/90 hover:bg-white shadow-xl border-0 backdrop-blur-sm z-20"
                        onClick={handlePrevImage}
                      >
                        <Icon path={mdiChevronLeft} size={0.8} />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 bg-white/90 hover:bg-white shadow-xl border-0 backdrop-blur-sm z-20"
                        onClick={handleNextImage}
                      >
                        <Icon path={mdiChevronRight} size={0.8} />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-maintext">Không có hình ảnh</p>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {selectedVariant &&
              selectedVariant.images &&
              selectedVariant.images.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mt-4">
                  {selectedVariant.images.map(
                    (image: IProductImage, index: number) => (
                      <motion.div
                        key={index}
                        onClick={() => handleImageChange(index)}
                        className={`
                      relative aspect-square rounded-xl overflow-hidden cursor-pointer
                      border-2 transition-all duration-300 hover:opacity-80
                      ${currentImageIndex === index
                            ? "border-primary ring-2 ring-primary/20 shadow-lg scale-105"
                            : "border-gray-200 hover:border-gray-300"
                          }
                    `}
                        whileHover={{
                          scale: currentImageIndex === index ? 1.05 : 1.02,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img
                          src={checkImageUrl(image.imageUrl)}
                          alt={`${product.name} - ${index + 1}`}
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 20vw, 10vw"
                        />
                      </motion.div>
                    )
                  )}
                </div>
              )}
          </motion.div>

          {/* Enhanced Product Information Section */}
          <motion.div
            className="w-full space-y-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Product Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">{brandName}</Badge>
                  <Badge variant="secondary">{categoryName}</Badge>
                </div>
                {/* Rating placeholder */}
                <div className="flex items-center gap-2">
                  <span className="text-base !text-maintext">
                    128 đánh giá •
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        path={i < 4 ? mdiStar : mdiStarOutline}
                        size={0.8}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                    (4.0)
                  </div>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-semibold text-maintext leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Enhanced Pricing */}
            <Card className="p-4 bg-white border-gray-200">
              <div className="space-y-4">
                {/* Discount Badge */}
                {productDiscount && productDiscount.discountPercent > 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-xl border border-white/50 backdrop-blur-sm animate-pulse flex-shrink-0 w-fit flex items-center justify-center gap-2"
                  >
                    💥
                    <span className="text-lg">
                      -{productDiscount.discountPercent}%
                    </span>
                  </motion.div>
                )}

                {/* Price Display */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className="text-4xl font-semibold text-primary"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {productDiscount && productDiscount.discountPercent > 0
                      ? formatPrice(productDiscount.discountedPrice)
                      : selectedVariant && formatPrice(selectedVariant.price)}
                  </motion.div>
                  {productDiscount && productDiscount.discountPercent > 0 && (
                    <div className="text-xl text-maintext line-through font-medium bg-gray-100 px-3 py-2 rounded-lg">
                      {formatPrice(productDiscount.originalPrice)}
                    </div>
                  )}
                </div>

                {/* Price breakdown for clarity */}
                {productDiscount && productDiscount.discountPercent > 0 && (
                  <div className="text-sm text-green-600 font-medium space-y-1">
                    <div>
                      🎉 Áp dụng khuyến mãi:{" "}
                      {productDiscount.appliedPromotion?.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-maintext">
                      <span>
                        Giá gốc:{" "}
                        <span className="line-through">
                          {formatPrice(productDiscount.originalPrice)}
                        </span>
                      </span>
                      <span>→</span>
                      <span className="text-green-600 font-semibold">
                        Giá sau giảm:{" "}
                        {formatPrice(productDiscount.discountedPrice)}
                      </span>
                    </div>
                  </div>
                )}

                {(!productDiscount || productDiscount.discountPercent === 0) &&
                  selectedVariant && (
                    <div className="text-base text-maintext">
                      <strong>Giá bán:</strong>{" "}
                      {formatPrice(selectedVariant.price)}
                    </div>
                  )}
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              {/* Enhanced Color Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      path={mdiPalette}
                      size={0.8}
                      className="!text-maintext"
                    />
                    <span className="font-semibold text-maintext">Màu sắc</span>
                  </div>
                  {selectedColor && (
                    <Badge variant="success">
                      {(() => {
                        const colorVariant = product.variants.find(
                          (v) => String(v.color.id) === String(selectedColor)
                        );
                        return colorVariant?.color?.name || "Màu sắc đã chọn";
                      })()}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4">
                  {product.variants
                    .filter((variant, index, self) => {
                      const colorId = variant.color.id;
                      return (
                        colorId &&
                        index === self.findIndex((v) => v.color.id === colorId)
                      );
                    })
                    .map((variant) => (
                      <motion.button
                        key={variant.color?.id}
                        onClick={() =>
                          handleColorSelect(String(variant.color.id))
                        }
                        className={`
                        relative group flex items-center justify-center w-10 h-10  rounded-full
                        transition-all duration-300 border-2
                        ${String(selectedColor) === String(variant.color.id)
                            ? "border-primary ring-4 ring-primary/20 scale-110"
                            : "border-gray-200 hover:border-gray-300 hover:scale-105"
                          }
                      `}
                        style={{ backgroundColor: variant.color?.code }}
                        title={variant.color?.name}
                        whileHover={{
                          scale:
                            String(selectedColor) === String(variant.color?.id)
                              ? 1.1
                              : 1.05,
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {String(selectedColor) ===
                          String(variant.color?.id) && (
                            <Icon
                              path={mdiCheck}
                              size={0.8}
                              className="text-white drop-shadow-lg"
                            />
                          )}
                      </motion.button>
                    ))}
                </div>
              </div>
              {/* Enhanced Size Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      path={mdiRuler}
                      size={0.8}
                      className="!text-maintext"
                    />
                    <span className="font-semibold text-maintext">
                      Kích thước
                    </span>
                  </div>
                  {selectedSize && (
                    <Badge variant="success">
                      {(() => {
                        const sizeVariant = product.variants.find(
                          (v) => String(v.size.id) === String(selectedSize)
                        );
                        return sizeVariant?.size?.value
                          ? String(sizeVariant.size.value)
                          : "Size đã chọn";
                      })()}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4">
                  {Array.from(
                    new Set(
                      product.variants
                        .map((v) => String(v.size.id))
                        .filter(Boolean)
                    )
                  ).map((sizeId) => {
                    const sizeVariant = product.variants.find(
                      (v) => String(v.size.id) === sizeId
                    );
                    const variantForColorAndSize = product.variants.find(
                      (v) =>
                        String(v.color.id) === String(selectedColor) &&
                        String(v.size.id) === sizeId
                    );
                    const isAvailable =
                      !!variantForColorAndSize &&
                      variantForColorAndSize.stock > 0;

                    return (
                      <Button
                        size="icon"
                        variant="outline"
                        key={sizeId}
                        onClick={() => handleSizeSelect(sizeId)}
                        disabled={!isAvailable}
                        className={`
                          ${String(selectedSize) === sizeId
                            ? "border-primary text-primary bg-primary/5 shadow-sm scale-110"
                            : "border-gray-200 text-maintext hover:border-primary hover:text-primary hover:scale-105 bg-white"
                          }
                          ${!isAvailable
                            ? "opacity-30 cursor-not-allowed bg-gray-50/50 border-gray-100"
                            : ""
                          }
                        `}
                        title={!isAvailable ? "Không có sẵn cho màu này" : ""}
                      >
                        {sizeVariant?.size?.value || ""}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Enhanced Quantity Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    path={mdiCartPlus}
                    size={0.8}
                    className="!text-maintext"
                  />
                  <span className="font-semibold text-maintext">Số lượng</span>
                </div>

                {selectedVariant && (
                  <span className="text-sm !text-maintext">
                    Còn{" "}
                    <span className="font-semibold text-primary">
                      {selectedVariant.stock}
                    </span>{" "}
                    sản phẩm
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <div className="w-10 h-10  flex items-center justify-center border text-center text-lg font-semibold bg-gray-50 rounded-md">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={
                    !selectedVariant || quantity >= (selectedVariant.stock || 0)
                  }
                >
                  +
                </Button>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => toast.success("Đã thêm vào danh sách yêu thích")}
              >
                <Icon path={mdiHeartOutline} size={0.8} className="mr-2" />
                Yêu thích
              </Button>
              <Button
                size="md"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
              >
                <Icon path={mdiCartOutline} size={0.8} className="mr-2" />
                Thêm vào giỏ hàng
              </Button>
            </div>

            {/* Enhanced Product Features */}
            <Card className="p-4 bg-white border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: mdiTruck,
                    title: "Miễn phí vận chuyển",
                    description: "Đơn hàng từ 500k",
                  },
                  {
                    icon: mdiShield,
                    title: "Bảo hành chính hãng",
                    description: "12 tháng",
                  },
                  {
                    icon: mdiRefresh,
                    title: "Đổi trả dễ dàng",
                    description: "Trong 30 ngày",
                  },
                  {
                    icon: mdiCreditCard,
                    title: "Thanh toán an toàn",
                    description: "Nhiều phương thức",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10  bg-green-100 rounded-full flex items-center justify-center border border-green-300">
                      <Icon
                        path={feature.icon}
                        size={0.8}
                        className="text-primary"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-maintext">
                        {feature.title}
                      </p>
                      <p className="text-sm !text-maintext">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Enhanced Product Information */}
            <Card className="p-4 bg-white border-gray-200">
              <h3 className="font-semibold text-maintext mb-4 flex items-center gap-2">
                <Icon
                  path={mdiInformation}
                  size={0.8}
                  className="text-primary"
                />
                Thông tin sản phẩm
              </h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium !text-maintext py-3">
                      Thương hiệu
                    </TableCell>
                    <TableCell className="text-right font-semibold text-maintext py-3">
                      {brandName}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium !text-maintext py-3">
                      Danh mục
                    </TableCell>
                    <TableCell className="text-right font-semibold text-maintext py-3">
                      {categoryName}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium !text-maintext py-3">
                      Chất liệu
                    </TableCell>
                    <TableCell className="text-right font-semibold text-maintext py-3">
                      {materialName}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium !text-maintext py-3">
                      Trọng lượng
                    </TableCell>
                    <TableCell className="text-right font-semibold text-maintext py-3">
                      {product.weight}g
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </div>
        <SimilarProducts
          similarProducts={similarProducts}
          promotionsData={promotionsData}
          onAddToCart={handleAddToCartSimilar}
          onQuickView={handleQuickViewSimilar}
          onAddToWishlist={handleAddToWishlistSimilar}
        />
      </div>
      <div className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full bg-primary p-2 hover:bg-primary/80 transition-all duration-300 w-10 h-10 flex items-center justify-center">
        <CartIcon className="text-white" />
      </div>
    </div>
  );
}
