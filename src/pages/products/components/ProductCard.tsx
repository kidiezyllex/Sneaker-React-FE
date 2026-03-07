import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import { mdiCartOutline, mdiHeartOutline, mdiEye, mdiTag } from "@mdi/js";
import { checkImageUrl } from "@/lib/utils";
import { formatPrice } from "@/utils/formatters";
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
      <Card className="p-0">
        {/* Image Section */}
        <div className="relative bg-white rounded-t-2xl overflow-hidden border-b border-b-slate-100 group">
          <Link
            to={`/products/${product.name
              .toLowerCase()
              .replace(/\s+/g, "-")}-${product.id}`}
            className="block"
          >
            <div className="aspect-square relative flex items-center justify-center p-8 overflow-hidden">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

              <img
                src={
                  checkImageUrl(
                    product.variants[0]?.images?.[0]?.imageUrl ||
                    product.variants[0]?.images?.[0]
                  ) || "/placeholder.svg"
                }
                alt={product.name}
                className="object-contain w-full h-full transition-all duration-700 group-hover:scale-110 z-10"
              />

              {/* Luxury SVG Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none z-20 p-2">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="cardGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#15803D" />
                    </linearGradient>
                  </defs>

                  {/* Corner Accents */}
                  <g stroke="url(#cardGoldGradient)" strokeWidth="3" strokeLinecap="round">
                    <path d="M30 15H15V30" />
                    <path d="M370 15H385V40" />
                    <path d="M30 385H15V370" />
                    <path d="M370 385H385V370" />
                  </g>

                  {/* Fine Lines */}
                  <rect x="12" y="12" width="376" height="376" rx="12" stroke="url(#cardGoldGradient)" strokeWidth="0.5" opacity="0.15" />

                  {/* Top Decorative Seal */}
                  <g transform="translate(200, 15)">
                    <rect
                      x="-10"
                      y="-10"
                      width="20"
                      height="20"
                      rx="2"
                      fill="white"
                      stroke="url(#cardGoldGradient)"
                      strokeWidth="2"
                      transform="rotate(45)"
                    />
                    <circle r="4" fill="url(#cardGoldGradient)" />
                    <circle r="1.5" fill="white" opacity="0.8" />
                  </g>

                  {/* Small Info Dots */}
                  <circle cx="200" cy="385" r="2" fill="url(#cardGoldGradient)" />
                </svg>
              </div>
            </div>
          </Link>

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
                      <Icon path={mdiTag} size={0.6} />
                      <span>-{discount.discountPercent}%</span>
                    </div>
                  );
                }
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
              <Icon path={mdiCartOutline} size={0.8} />
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
              <Icon path={mdiHeartOutline} size={0.8} />
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
              <Icon path={mdiEye} size={0.8} />
            </Button>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="p-3 flex flex-col flex-grow bg-gray-50">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {typeof product.brand === "string"
                ? product.brand
                : product.brand.name}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00B207]"></div>
          </div>
          {/* Product Name */}
          <Link
            to={`/products/${product.name
              .toLowerCase()
              .replace(/\s+/g, "-")}-${product.id}`}
            className="hover:text-primary transition-colors flex-1"
          >
            <h3 className="font-semibold text-base mb-3 line-clamp-1 leading-tight text-maintext hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

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
              <div className="flex items-center">
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
                    <span className="text-sm text-gray-700 font-medium">
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
              <div className="text-xs text-gray-700 font-medium">
                <span className="font-semibold">Size: </span>
                {Array.from(
                  new Set(
                    (product.variants || []).map((v: any) =>
                      v.size?.value ? String(v.size.value) : ""
                    )
                  )
                )
                  .filter(Boolean)
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
