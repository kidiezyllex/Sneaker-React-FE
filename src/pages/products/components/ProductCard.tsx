import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import { mdiCartOutline, mdiHeartOutline, mdiEye } from "@mdi/js";
import { checkImageUrl } from "@/lib/utils";
import { formatPrice } from "@/utils/formatters";
import { getSizeLabel } from "@/utils/sizeMapping";
import { calculateProductDiscount } from "@/lib/promotions";

interface ProductCardProps {
  product: any;
  promotionsData?: any;
  onAddToCart: () => void;
  onQuickView: () => void;
  onAddToWishlist: () => void;
}

export const ProductCard = ({
  product,
  promotionsData,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group overflow-hidden rounded-2xl hover:shadow-xl shadow-md transition-all duration-300 border-2 border-white h-full flex flex-col bg-white">
        {/* Image Section */}
        <div className="relative bg-[#f5f5f5] rounded-t-2xl overflow-hidden">
          <a
            href={`/products/${product.name
              .toLowerCase()
              .replace(/\s+/g, "-")}-${product.id}`}
            className="block"
          >
            <div className="aspect-square relative flex items-center justify-center p-4">
              <img
                src={
                  checkImageUrl(
                    product.variants[0]?.images?.[0]?.imageUrl ||
                      product.variants[0]?.images?.[0]
                  ) || "/placeholder.svg"
                }
                alt={product.name}
                className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </a>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
            {(() => {
              if (
                promotionsData?.data?.promotions &&
                product.variants?.[0]?.price
              ) {
                const discount = calculateProductDiscount(
                  product.id,
                  product.variants[0]?.price || 0,
                  promotionsData.data.promotions
                );

                if (discount.discountPercent > 0) {
                  return (
                    <div className="bg-[#00B207] text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12.76 3.76a6 6 0 0 1 8.48 8.48l-8.53 8.54a2 2 0 0 1-2.83 0l-8.53-8.54a6 6 0 0 1 8.48-8.48l.76.75.76-.75z" />
                      </svg>
                      <span>-{discount.discountPercent}%</span>
                    </div>
                  );
                }
              }
              return null;
            })()}

            {/* Stock badge */}
            {(() => {
              const totalStock = (product.variants || []).reduce(
                (sum: number, variant: any) => sum + (variant.stock || 0),
                0
              );
              if (totalStock === 0) {
                return (
                  <div className="bg-red-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
                    </svg>
                    <span>Hết hàng</span>
                  </div>
                );
              } else if (totalStock <= 5) {
                return (
                  <div className="bg-[#FF8A00] text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    <span>Low Stock</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Quick Action Buttons */}
          <motion.div
            className="absolute right-4 top-4 flex flex-col gap-2 z-30"
            initial={{ x: 60, opacity: 0 }}
            animate={{
              x: isHovered ? 0 : 60,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
              }}
              aria-label="Thêm vào giỏ hàng"
            >
              <Icon path={mdiCartOutline} size={0.7} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-pink-500 hover:border-pink-500"
              onClick={(e) => {
                e.preventDefault();
                onAddToWishlist();
              }}
              aria-label="Yêu thích"
            >
              <Icon path={mdiHeartOutline} size={0.7} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full hover:bg-blue-500 hover:border-blue-500"
              onClick={(e) => {
                e.preventDefault();
                onQuickView();
              }}
              aria-label="Xem nhanh"
            >
              <Icon path={mdiEye} size={0.7} />
            </Button>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="p-3 flex flex-col flex-grow bg-white">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {typeof product.brand === "string"
                ? product.brand
                : product.brand.name}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00B207]"></div>
          </div>
          {/* Product Name */}
          <a
            href={`/products/${product.name
              .toLowerCase()
              .replace(/\s+/g, "-")}-${product.id}`}
            className="hover:text-primary transition-colors flex-1"
          >
            <h3 className="font-semibold text-base mb-3 line-clamp-2 leading-tight text-maintext hover:text-primary transition-colors">
              {product.name}
            </h3>
          </a>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-semibold text-xl text-[#00B207]">
              {(() => {
                if (
                  promotionsData?.data?.promotions &&
                  product.variants?.[0]?.price
                ) {
                  const discount = calculateProductDiscount(
                    product.id,
                    product.variants[0]?.price || 0,
                    promotionsData.data.promotions
                  );

                  if (discount.discountPercent > 0) {
                    return formatPrice(discount.discountedPrice);
                  }
                }

                return formatPrice(product.variants?.[0]?.price || 0);
              })()}
            </span>
            {(() => {
              if (
                promotionsData?.data?.promotions &&
                product.variants?.[0]?.price
              ) {
                const discount = calculateProductDiscount(
                  product.id,
                  product.variants[0]?.price || 0,
                  promotionsData.data.promotions
                );

                if (discount.discountPercent > 0) {
                  return (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(discount.originalPrice)}
                    </span>
                  );
                }
              }
              return null;
            })()}
          </div>

          {/* Colors and Sizes */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center justify-between px-2 py-1 rounded-full border bg-[#eee]">
              {/* Colors */}
              <div className="flex items-center gap-1">
                {Array.from(
                  new Set(
                    (product.variants || []).map(
                      (v: any) => v.color?.id || v.colorId
                    )
                  )
                )
                  .slice(0, 3)
                  .map((colorId, index: number) => {
                    const variant = (product.variants || []).find(
                      (v: any) => (v.color?.id || v.colorId) === colorId
                    );
                    const color = variant?.color || {
                      code: "#000000",
                      name: "Unknown",
                    };

                    return (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-gray-200 cursor-pointer hover:border-primary transition-colors"
                        style={{ backgroundColor: color.code }}
                        title={color.name}
                      />
                    );
                  })}

                {Array.from(
                  new Set(
                    (product.variants || []).map(
                      (v: any) => v.color?.id || v.colorId
                    )
                  )
                ).length > 3 && (
                  <span className="text-sm text-gray-500 font-medium">
                    +
                    {Array.from(
                      new Set(
                        (product.variants || []).map(
                          (v: any) => v.color?.id || v.colorId
                        )
                      )
                    ).length - 3}
                  </span>
                )}
              </div>

              {/* Sizes */}
              <div className="text-sm text-gray-600 font-medium">
                <span className="font-semibold">Size: </span>
                {Array.from(
                  new Set(
                    (product.variants || []).map((v: any) =>
                      v.size?.value
                        ? getSizeLabel(v.size.value)
                        : v.size?.code || v.size?.name || "Unknown"
                    )
                  )
                )
                  .slice(0, 4)
                  .join(", ")}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
