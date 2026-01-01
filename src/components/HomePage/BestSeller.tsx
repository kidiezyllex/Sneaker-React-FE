import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import {
  mdiCartOutline,
  mdiHeartOutline,
  mdiStar,
  mdiEye,
  mdiArrowRight,
  mdiArrowLeft,
} from "@mdi/js";
import { InteractiveHoverButton } from "../Common/InteractiveHoverButton";

const bestSellerData = [
  {
    id: 1,
    name: "Nike Air 1/2 Cent Black",
    price: 4750000,
    originalPrice: 5000000,
    discount: 5,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/000/032/117/original/344646_001.png.png",
    rating: 5,
    slug: "nike-air-1-2-cent-black",
    brand: "Nike",
    colors: ["Đen"],
    isBestSeller: true,
    stock: 12,
  },
  {
    id: 2,
    name: "Nike Air 1/2 Cent Black Green Spark",
    price: 4750000,
    originalPrice: 5000000,
    discount: 5,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/000/032/118/original/344646_002.png.png",
    rating: 5,
    slug: "nike-air-1-2-cent-black-green-spark",
    brand: "Nike",
    colors: ["Đen", "Xanh lá"],
    isBestSeller: true,
    stock: 10,
  },
  {
    id: 3,
    name: "Nike Air 1/2 Cent Silver",
    price: 4750000,
    originalPrice: 5000000,
    discount: 5,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/100/579/287/original/21956_00.png.png",
    rating: 5,
    slug: "nike-air-1-2-cent-silver",
    brand: "Nike",
    colors: ["Bạc"],
    isBestSeller: true,
    stock: 8,
  },
  {
    id: 4,
    name: "Nike Air 1/2 Cent Royal",
    price: 4750000,
    originalPrice: 5000000,
    discount: 5,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/098/477/735/original/21878_00.png.png",
    rating: 5,
    slug: "nike-air-1-2-cent-royal",
    brand: "Nike",
    colors: ["Xanh dương"],
    isBestSeller: true,
    stock: 15,
  },
  {
    id: 5,
    name: "Nike Air 1/2 Cent Cranberry",
    price: 4750000,
    originalPrice: 5000000,
    discount: 5,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/000/032/122/original/344646_600.png.png",
    rating: 5,
    slug: "nike-air-1-2-cent-cranberry",
    brand: "Nike",
    colors: ["Đỏ"],
    isBestSeller: true,
    stock: 6,
  },
  {
    id: 6,
    name: "Nike Air Force 1 Low SP 1017 ALYX 9SM Black",
    price: 3875000,
    originalPrice: 4500000,
    discount: 14,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/096/779/934/original/1328101_00.png.png",
    rating: 5,
    slug: "nike-air-force-1-low-sp-1017-alyx-9sm-black",
    brand: "Nike",
    colors: ["Đen"],
    isBestSeller: true,
    stock: 9,
  },
  {
    id: 7,
    name: "Nike Air Force 1 Low SP 1017 ALYX 9SM White",
    price: 3875000,
    originalPrice: 4500000,
    discount: 14,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/096/910/209/original/1328103_00.png.png",
    rating: 5,
    slug: "nike-air-force-1-low-sp-1017-alyx-9sm-white",
    brand: "Nike",
    colors: ["Trắng"],
    isBestSeller: true,
    stock: 11,
  },
  {
    id: 8,
    name: "Nike Air Force 1 High 1017 ALYX 9SM Black Red",
    price: 11250000,
    originalPrice: 12500000,
    discount: 10,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/089/001/207/original/CQ4018_004.png.png",
    rating: 5,
    slug: "nike-air-force-1-high-1017-alyx-9sm-black-red",
    brand: "Nike",
    colors: ["Đen", "Đỏ"],
    isBestSeller: true,
    stock: 5,
  },
  {
    id: 9,
    name: "Nike Air Force 1 High 1017 ALYX 9SM Red Black",
    price: 11250000,
    originalPrice: 12500000,
    discount: 10,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/062/778/469/original/CQ4018_601.png.png",
    rating: 5,
    slug: "nike-air-force-1-high-1017-alyx-9sm-red-black",
    brand: "Nike",
    colors: ["Đỏ", "Đen"],
    isBestSeller: true,
    stock: 7,
  },
  {
    id: 10,
    name: "Nike Air Force 1 High 1017 ALYX 9SM White Grey (2021)",
    price: 11525000,
    originalPrice: 12500000,
    discount: 8,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/064/337/111/original/766833_00.png.png",
    rating: 4,
    slug: "nike-air-force-1-high-1017-alyx-9sm-white-grey-2021",
    brand: "Nike",
    colors: ["Trắng", "Xám"],
    isBestSeller: false,
    stock: 4,
  },
  {
    id: 11,
    name: "Nike Air Force 1 High 1017 ALYX 9SM Black Grey (2021)",
    price: 11525000,
    originalPrice: 12500000,
    discount: 8,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/061/833/440/original/763416_00.png.png",
    rating: 4,
    slug: "nike-air-force-1-high-1017-alyx-9sm-black-grey-2021",
    brand: "Nike",
    colors: ["Đen", "Xám"],
    isBestSeller: false,
    stock: 6,
  },
  {
    id: 12,
    name: "Nike Air Force 1 High 1017 ALYX 9SM Black White",
    price: 11250000,
    originalPrice: 12500000,
    discount: 10,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/079/969/012/original/593004_00.png.png",
    rating: 5,
    slug: "nike-air-force-1-high-1017-alyx-9sm-black-white",
    brand: "Nike",
    colors: ["Đen", "Trắng"],
    isBestSeller: true,
    stock: 8,
  },
  {
    id: 13,
    name: "Nike The 1971 Black White",
    price: 6000000,
    originalPrice: 6500000,
    discount: 8,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/064/893/056/original/DC9964_010.png.png",
    rating: 5,
    slug: "nike-the-1971-black-white",
    brand: "Nike",
    colors: ["Đen", "Trắng"],
    isBestSeller: true,
    stock: 10,
  },
  {
    id: 14,
    name: "Nike 1972 Dark Brown",
    price: 3500000,
    originalPrice: 4000000,
    discount: 13,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/000/036/735/original/586367_200.png.png",
    rating: 4,
    slug: "nike-1972-dark-brown",
    brand: "Nike",
    colors: ["Nâu"],
    isBestSeller: false,
    stock: 12,
  },
  {
    id: 15,
    name: "Nike 1972 Dress Code",
    price: 4000000,
    originalPrice: 4500000,
    discount: 11,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/000/036/736/original/586367_600.png.png",
    rating: 4,
    slug: "nike-1972-dress-code",
    brand: "Nike",
    colors: ["Đen"],
    isBestSeller: false,
    stock: 9,
  },
  {
    id: 16,
    name: "Nike Air Force 1 Pure Platinum (GS)",
    price: 1875000,
    originalPrice: 2200000,
    discount: 15,
    image:
      "https://image.goat.com/750/attachments/product_template_pictures/images/006/875/424/original/314192_097.png.png",
    rating: 5,
    slug: "nike-air-force-1-pure-platinum-gs",
    brand: "Nike",
    colors: ["Bạc"],
    isBestSeller: true,
    stock: 15,
  },
];

const fallbackImages = [
  "https://image.goat.com/750/attachments/product_template_pictures/images/000/032/117/original/344646_001.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/000/032/118/original/344646_002.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/100/579/287/original/21956_00.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/098/477/735/original/21878_00.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/000/032/122/original/344646_600.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/096/779/934/original/1328101_00.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/096/910/209/original/1328103_00.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/089/001/207/original/CQ4018_004.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/000/036/735/original/586367_200.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/000/036/736/original/586367_600.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/006/875/424/original/314192_097.png.png",
  "https://image.goat.com/750/attachments/product_template_pictures/images/108/411/867/original/326768_001.png.png",
];

//                                                                                                                     Component hiển thị rating stars
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1 items-center">
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          path={mdiStar}
          size={0.7}
          className={i < rating ? "text-amber-500" : "text-gray-300"}
        />
      ))}
      <span className="text-xs text-maintext ml-1">({rating}.0)</span>
    </div>
  );
};

//                                                                                                                     Component thẻ giảm giá
const DiscountBadge = ({ discount }: { discount: number }) => {
  if (!discount) return null;

  return (
    <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-none font-medium text-xs text-white bg-gradient-to-r from-red-500 to-amber-500">
      -{discount}%
    </div>
  );
};

//                                                                                                                     Component thẻ best seller
const BestSellerBadge = ({ isBestSeller }: { isBestSeller: boolean }) => {
  if (!isBestSeller) return null;

  return (
    <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-none font-medium text-xs text-white bg-gradient-to-r from-[#2C8B3D] to-[#88C140]">
      Best Seller
    </div>
  );
};

//                                                                                                                     Component hiển thị màu sắc
const ColorOptions = ({ colors }: { colors: string[] }) => {
  return (
    <div className="flex gap-1 items-center">
      {colors.map((color, i) => (
        <div key={i} className="group relative">
          <div
            className="w-4 h-4 rounded-full border cursor-pointer hover:scale-110 transition-transform duration-200"
            style={{
              backgroundColor:
                color === "Đen"
                  ? "black"
                  : color === "Trắng"
                  ? "white"
                  : color === "Xanh"
                  ? "#3B82F6"
                  : color === "Xanh đen"
                  ? "#1e293b"
                  : color === "Đỏ"
                  ? "#EF4444"
                  : color === "Hồng"
                  ? "#EC4899"
                  : color === "Xám"
                  ? "#6B7280"
                  : color === "Cam"
                  ? "#F97316"
                  : color === "Vàng"
                  ? "#EAB308"
                  : color === "Kem"
                  ? "#FEF3C7"
                  : color === "Xanh rêu"
                  ? "#4D7C0F"
                  : "#9CA3AF",
            }}
          />
        </div>
      ))}
    </div>
  );
};

//                                                                                                                     Component card sản phẩm
const ProductCard = ({
  product,
  index,
}: {
  product: (typeof bestSellerData)[0];
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  //                                                                                                                     Format giá tiền sang VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white dark:bg-gray-800 rounded-[6px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 pb-4 flex flex-col border border-gray-100"
    >
      <a
        href={`/products/${product.slug}`}
        className="block relative overflow-hidden"
      >
        <div className="relative aspect-square w-full overflow-hidden">
          {product.discount > 0 && (
            <DiscountBadge discount={product.discount} />
          )}
          {product.isBestSeller && (
            <BestSellerBadge isBestSeller={product.isBestSeller} />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

          <img
            src={
              product.image.startsWith("//")
                ? `https:${product.image}`
                : product.image
            }
            alt={product.name}
            className="object-cover transition-transform duration-700 group-hover:scale-110 w-full h-full"
            draggable="false"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = fallbackImages[index % fallbackImages.length];
            }}
          />
        </div>
        {/* Quick action buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center items-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full w-9 h-9 bg-white/80 hover:bg-white shadow-md backdrop-blur-sm flex items-center justify-center"
            title="Xem nhanh"
          >
            <Icon path={mdiEye} size={0.7} className="text-maintext" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full w-9 h-9 bg-white/80 hover:bg-white shadow-md backdrop-blur-sm flex items-center justify-center"
            title="Yêu thích"
          >
            <Icon path={mdiHeartOutline} size={0.7} className="text-maintext" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full w-9 h-9 bg-white/80 hover:bg-white shadow-md backdrop-blur-sm flex items-center justify-center"
            title="Thêm vào giỏ hàng"
          >
            <Icon path={mdiCartOutline} size={0.7} className="text-maintext" />
          </Button>
        </div>
      </a>

      <div className="p-4 pb-0 flex flex-col gap-1">
        <div className="text-xs font-medium text-[#2C8B3D] uppercase tracking-wider">
          {product.brand}
        </div>
        <h3 className="text-maintext dark:text-white font-semibold text-lg truncate group-hover:text-[#2C8B3D] transition-colors duration-200">
          <a href={`/products/${product.slug}`}>{product.name}</a>
        </h3>
        <div className="">
          <RatingStars rating={product.rating} />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold text-lg bg-gradient-to-r from-[#2C8B3D] to-[#88C140] bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </span>
          {product.discount > 0 && (
            <span className="text-sm text-maintext line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <div className="flex gap-1 items-center justify-between mb-4">
          <ColorOptions colors={product.colors} />

          {product.stock <= 10 && (
            <div className="text-xs text-orange-600 font-medium">
              (Chỉ còn {product.stock} sản phẩm)
            </div>
          )}
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-end flex-1">
        <InteractiveHoverButton className="rounded-none uppercase font-normal w-fit">
          Xem chi tiết
          <Icon
            path={mdiArrowRight}
            size={0.7}
            className="ml-2 group-hover:translate-x-1 transition-transform"
          />
        </InteractiveHoverButton>
      </div>
    </motion.div>
  );
};

export const BestSeller = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-20 pt-12 bg-[#FAFAFB] dark:bg-gray-900">
      <div className="container mx-auto">
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-[#2C8B3D] uppercase bg-[#E9F5E2] rounded-full">
            Bán chạy nhất
          </span>
          <h2 className="text-3xl font-bold text-center mb-4 relative">
            <span className="inline-block relative">
              <span className="uppercase bg-gradient-to-r from-[#2C8B3D] to-[#88C140] bg-clip-text text-transparent drop-shadow-sm">
                Sản phẩm bán chạy
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </span>
          </h2>
          <p className="text-maintext dark:text-gray-300 max-w-2xl mx-auto">
            Khám phá những sản phẩm bán chạy nhất với chất lượng và thiết kế
            vượt trội
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestSellerData.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        <div className="flex w-full flex-col items-center justify-end flex-1 mt-8">
          <InteractiveHoverButton className="!rounded-full uppercase font-normal w-fit">
            Xem tất cả
            <Icon
              path={mdiArrowLeft}
              size={0.9}
              className="
        ml-2 group-hover:translate-x-1 transition-transform transform scale-x-[-1]"
            />
          </InteractiveHoverButton>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
