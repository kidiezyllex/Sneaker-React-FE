import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/pages/products/components/ProductCard";
import { IProduct } from "@/interface/response/product";

interface SimilarProductsProps {
  similarProducts: IProduct[];
  promotionsData: any;
  onAddToCart: (product: IProduct) => void;
  onQuickView: (product: IProduct) => void;
  onAddToWishlist: () => void;
}

export const SimilarProducts: React.FC<SimilarProductsProps> = ({
  similarProducts,
  promotionsData,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
}) => {
  if (similarProducts.length === 0) return null;

  return (
    <motion.div
      className="mt-20"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-maintext mb-4">
          Sản phẩm tương tự
        </h2>
        <p className="!text-maintext max-w-2xl mx-auto text-lg">
          Khám phá những sản phẩm tương tự có thể bạn sẽ thích
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
        <AnimatePresence>
          {similarProducts.map((similarProduct: IProduct, index: number) => (
            <motion.div
              key={similarProduct.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard
                product={similarProduct}
                promotionsData={promotionsData}
                onAddToCart={() => onAddToCart(similarProduct)}
                onQuickView={() => onQuickView(similarProduct)}
                onAddToWishlist={onAddToWishlist}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-center mt-12">
        <Button variant="outline" size="lg" asChild>
          <a href="/products">Xem tất cả sản phẩm</a>
        </Button>
      </div>
    </motion.div>
  );
};
