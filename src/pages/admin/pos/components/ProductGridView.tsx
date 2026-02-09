import { motion } from "framer-motion";
import { Icon } from "@mdi/react";
import { mdiCartPlus } from "@mdi/js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { checkImageUrl } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

interface ProductGridViewProps {
    processedProducts: any[];
    handleProductSelect: (product: any) => void;
    handleOpenDetailDialog: (product: any) => void;
    getBrandName: (brand: any) => string;
    getVariantImageUrl: (variant: any) => string;
}

const ProductGridView = ({
    processedProducts,
    handleProductSelect,
    handleOpenDetailDialog,
    getBrandName,
    getVariantImageUrl,
}: ProductGridViewProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {processedProducts.map((product) => {
                const firstVariant = product.variants?.[0];
                const productColors = Array.from(
                    new Map(
                        product.variants?.map((v: any) => {
                            const colorData = v.color || v.colorId;
                            const id = colorData?.id || (typeof colorData === 'string' ? colorData : `clr-${Math.random()}`);
                            return [id, colorData];
                        })
                    ).values()
                ).filter((c: any) => c && typeof c === 'object');

                return (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group"
                    >
                        <div
                            className="relative h-48 w-full bg-gray-50 overflow-hidden cursor-pointer"
                            onClick={() => handleProductSelect(product)}
                        >
                            <img
                                src={checkImageUrl(
                                    getVariantImageUrl(firstVariant)
                                )}
                                alt={product.name}
                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                                style={{ width: '100%', height: '100%' }}
                            />
                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                                {(product as any).hasDiscount && (
                                    <Badge
                                        variant="success"
                                        showIcon={false}
                                    >
                                        -{(product as any).discountPercent}% OFF
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3
                                className="font-medium text-maintext group-hover:text-primary transition-colors truncate cursor-pointer"
                                onClick={() => handleProductSelect(product)}
                                title={product.name}
                            >
                                {product.name}
                            </h3>
                            <p className="text-maintext text-sm mb-2 truncate">
                                {getBrandName(product.brand)}
                            </p>
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <p className="font-medium text-primary">
                                        {firstVariant
                                            ? formatCurrency(
                                                (product as any).hasDiscount
                                                    ? (product as any).discountedPrice
                                                    : firstVariant.price
                                            )
                                            : "N/A"}
                                    </p>
                                    {(product as any).hasDiscount && (
                                        <p className="text-sm text-maintext line-through">
                                            {formatCurrency(
                                                (product as any).originalPrice
                                            )}
                                        </p>
                                    )}
                                </div>
                                {productColors.length > 0 && (
                                    <div className="flex -space-x-1">
                                        {productColors
                                            .slice(0, 3)
                                            .map((color: any, idx) => (
                                                <div
                                                    key={color.id || `color-${idx}`}
                                                    className="h-5 w-5 rounded-full border border-slate-200 shadow-sm"
                                                    style={{
                                                        backgroundColor: color.code,
                                                    }}
                                                    title={color.name}
                                                />
                                            ))}
                                        {productColors.length > 3 && (
                                            <div className="h-5 w-5 rounded-full bg-gray-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-maintext shadow-sm">
                                                +{productColors.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full mt-3"
                                disabled={product.variants.every(
                                    (v: any) => v.stock === 0
                                )}
                                onClick={() => handleOpenDetailDialog(product)}
                            >
                                <Icon path={mdiCartPlus} size={0.8} />
                                Thêm vào giỏ hàng
                            </Button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ProductGridView;
