import { Icon } from "@mdi/react";
import { mdiInformationOutline, mdiCartPlus } from "@mdi/js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "react-toastify";
import { CustomToast } from "@/components/ui/custom-toast";
import { checkImageUrl } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

interface ProductTableViewProps {
    processedProducts: any[];
    handleProductSelect: (product: any) => void;
    addItemToCorrectCart: (product: any, variant: any, isAlreadyConverted?: boolean) => void;
    getBrandName: (brand: any) => string;
    getVariantImageUrl: (variant: any) => string;
}

const ProductTableView = ({
    processedProducts,
    handleProductSelect,
    addItemToCorrectCart,
    getBrandName,
    getVariantImageUrl,
}: ProductTableViewProps) => {
    return (
        <div className="rounded-xl border border-border overflow-hidden bg-white shadow-sm">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-[280px]">Sản phẩm</TableHead>
                        <TableHead>Mã SP</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Thương hiệu</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Thuộc tính</TableHead>
                        <TableHead>Kho</TableHead>
                        <TableHead className="text-center">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {processedProducts.map((product) => {
                        const firstVariant = product.variants?.[0];
                        const totalStock = product.variants?.reduce(
                            (sum: number, v: any) => sum + (v.stock || 0),
                            0
                        ) || 0;

                        const productColors = Array.from(
                            new Map(
                                product.variants?.map((v: any) => {
                                    const colorData = v.color || v.colorId;
                                    const id = colorData?.id || (typeof colorData === 'string' ? colorData : `clr-${Math.random()}`);
                                    return [id, colorData];
                                })
                            ).values()
                        ).filter((c: any) => c && typeof c === 'object');

                        const productSizes = Array.from(
                            new Set(
                                product.variants?.map((v: any) => {
                                    const sizeData = v.size || v.sizeId;
                                    return sizeData?.value || (typeof sizeData === 'object' ? sizeData.name : sizeData);
                                })
                            )
                        ).filter(Boolean).sort((a: any, b: any) => Number(a) - Number(b));

                        return (
                            <TableRow
                                key={product.id}
                                className="group cursor-pointer hover:bg-primary/5 transition-colors"
                                onClick={() => handleProductSelect(product)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border flex-shrink-0 group-hover:border-primary/30 transition-colors">
                                            <img
                                                src={checkImageUrl(
                                                    getVariantImageUrl(firstVariant)
                                                )}
                                                alt={product.name}
                                                className="object-contain w-full h-full p-1"
                                            />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span
                                                className="font-semibold text-maintext truncate group-hover:text-primary transition-colors max-w-[200px] block"
                                                title={product.name}
                                            >
                                                {product.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                ID: {product.id}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" showIcon={false}>
                                        {product.code || "N/A"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-maintext/70">
                                        {typeof product.category === 'object' ? product.category.name : (product.category || "N/A")}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium text-maintext/80">
                                        {getBrandName(product.brand)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-primary">
                                            {firstVariant
                                                ? formatCurrency(
                                                    (product as any).hasDiscount
                                                        ? (product as any).discountedPrice
                                                        : firstVariant.price
                                                )
                                                : "N/A"}
                                        </span>
                                        {(product as any).hasDiscount && (
                                            <span className="text-[10px] text-muted-foreground line-through">
                                                {formatCurrency(
                                                    (product as any).originalPrice
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1.5">
                                        {/* Colors Dots */}
                                        <div className="flex -space-x-1 items-center">
                                            {productColors.slice(0, 3).map((color: any, idx) => (
                                                <div
                                                    key={color.id || `clr-${idx}`}
                                                    className="h-4 w-4 rounded-full border border-slate-200 shadow-sm"
                                                    style={{ backgroundColor: color.code }}
                                                    title={color.name}
                                                />
                                            ))}
                                            {productColors.length > 3 && (
                                                <div className="h-4 w-4 rounded-full bg-gray-100 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-maintext shadow-sm">
                                                    +{productColors.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        {/* Sizes Badges */}
                                        <div className="flex flex-wrap gap-1">
                                            {productSizes.slice(0, 2).map((size: any, idx) => (
                                                <Badge key={`sz-${idx}`} variant="secondary" showIcon={false}>
                                                    {size}
                                                </Badge>
                                            ))}
                                            {productSizes.length > 2 && (
                                                <span className="text-[9px] text-muted-foreground font-medium">
                                                    +{productSizes.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            totalStock > 10
                                                ? "success"
                                                : totalStock > 0
                                                    ? "warning"
                                                    : "destructive"
                                        }
                                        showIcon={false}
                                    >
                                        {totalStock > 10 ? "Còn hàng: " : totalStock > 0 ? "Sắp hết " : ""}
                                        {totalStock}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => window.open(`/products/${product.name.toLowerCase().replace(/\s+/g, "-")}-${product.id}`, "_blank")}
                                                    >
                                                        <Icon
                                                            path={mdiInformationOutline}
                                                            size={0.8}
                                                        />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Chi tiết</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        disabled={product.variants.every(
                                                            (v: any) => v.stock === 0
                                                        )}
                                                        onClick={() => {
                                                            const firstAvailableVariant =
                                                                product.variants.find(
                                                                    (v: any) => v.stock > 0
                                                                );
                                                            if (firstAvailableVariant) {
                                                                addItemToCorrectCart(
                                                                    product,
                                                                    firstAvailableVariant,
                                                                    false
                                                                );
                                                            } else {
                                                                toast.warn(
                                                                    <CustomToast
                                                                        title="Sản phẩm này đã hết hàng."
                                                                        type="warning"
                                                                    />,
                                                                    { icon: false }
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Icon path={mdiCartPlus} size={0.8} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Thêm vào giỏ</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default ProductTableView;