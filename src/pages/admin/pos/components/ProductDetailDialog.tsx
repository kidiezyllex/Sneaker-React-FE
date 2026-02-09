import { useState, useEffect } from "react";
import { Icon } from "@mdi/react";
import {
    mdiCartPlus,
    mdiCheck,
    mdiClose,
    mdiPalette,
    mdiRuler
} from "@mdi/js";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { checkImageUrl } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "react-toastify";
import { CustomToast } from "@/components/ui/custom-toast";

interface ProductDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    addItemToCorrectCart: (product: any, variant: any, isAlreadyConverted?: boolean, quantity?: number) => void;
}

const ProductDetailDialog = ({
    isOpen,
    onClose,
    product,
    addItemToCorrectCart,
}: ProductDetailDialogProps) => {
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);

    useEffect(() => {
        if (product && product.variants?.length > 0) {
            const firstAvailable = product.variants.find((v: any) => v.stock > 0) || product.variants[0];
            setSelectedColor(firstAvailable.colorId?.id || firstAvailable.color?.id || "");
            setSelectedSize(firstAvailable.sizeId?.id || firstAvailable.size?.id || "");
            setQuantity(1);
        }
    }, [product, isOpen]);

    useEffect(() => {
        if (product && selectedColor && selectedSize) {
            const variant = product.variants.find((v: any) => {
                const cId = v.colorId?.id || v.color?.id;
                const sId = v.sizeId?.id || v.size?.id;
                return String(cId) === String(selectedColor) && String(sId) === String(selectedSize);
            });
            setSelectedVariant(variant || null);
        }
    }, [product, selectedColor, selectedSize]);

    const handleColorSelect = (colorId: string) => {
        setSelectedColor(colorId);
        const firstSizeForColor = product.variants.find((v: any) => {
            const cId = v.colorId?.id || v.color?.id;
            return String(cId) === String(colorId) && v.stock > 0;
        }) || product.variants.find((v: any) => {
            const cId = v.colorId?.id || v.color?.id;
            return String(cId) === String(colorId);
        });

        if (firstSizeForColor) {
            setSelectedSize(firstSizeForColor.sizeId?.id || firstSizeForColor.size?.id || "");
        }
    };

    const handleAddToCart = () => {
        if (!selectedVariant) {
            toast.error(<CustomToast title="Vui lòng chọn đầy đủ thuộc tính" type="error" />);
            return;
        }

        if (selectedVariant.stock <= 0) {
            toast.error(<CustomToast title="Sản phẩm đã hết hàng" type="error" />);
            return;
        }

        if (quantity > selectedVariant.stock) {
            toast.error(<CustomToast title={`Chỉ còn ${selectedVariant.stock} sản phẩm trong kho`} type="error" />);
            return;
        }
        addItemToCorrectCart(product, selectedVariant, false, quantity);
        onClose();
    };

    if (!product) return null;

    const colors = Array.from(
        new Map(
            product.variants?.map((v: any) => {
                const color = v.colorId || v.color;
                return [color.id, color];
            })
        ).values()
    );

    const sizes = product.variants?.filter((v: any) => {
        const cId = v.colorId?.id || v.color?.id;
        return String(cId) === String(selectedColor);
    }).map((v: any) => v.sizeId || v.size);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-2xl font-bold text-primary">Chi tiết sản phẩm POS</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {/* Left: Product Image */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-50 rounded-xl border overflow-hidden flex items-center justify-center relative">
                            <img
                                src={checkImageUrl(selectedVariant?.images?.[0]?.imageUrl || selectedVariant?.images?.[0] || product.variants?.[0]?.images?.[0]?.imageUrl)}
                                alt={product.name}
                                className="object-contain w-full h-full p-4"
                            />
                            {product.hasDiscount && (
                                <Badge variant="success" className="absolute top-4 right-4 text-lg px-3 py-1">
                                    -{product.discountPercent}%
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Selection */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-maintext mb-1">{product.name}</h2>
                            <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Mã SP: {product.code}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-primary">
                                {formatCurrency(product.hasDiscount ? product.discountedPrice : selectedVariant?.price || 0)}
                            </span>
                            {product.hasDiscount && (
                                <span className="text-xl text-muted-foreground line-through">
                                    {formatCurrency(product.originalPrice)}
                                </span>
                            )}
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-maintext flex items-center gap-2">
                                <Icon path={mdiPalette} size={0.7} /> Chọn màu sắc
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {colors.map((color: any) => (
                                    <button
                                        key={color.id}
                                        onClick={() => handleColorSelect(color.id)}
                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${String(selectedColor) === String(color.id)
                                            ? "border-primary ring-2 ring-primary/20 scale-110 shadow-md"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        style={{ backgroundColor: color.code }}
                                        title={color.name}
                                    >
                                        {String(selectedColor) === String(color.id) && (
                                            <Icon path={mdiCheck} size={0.6} className="text-white drop-shadow-md" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-maintext flex items-center gap-2">
                                <Icon path={mdiRuler} size={0.7} /> Chọn kích thước
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {sizes?.map((size: any) => {
                                    const variant = product.variants.find((v: any) => {
                                        const cId = v.colorId?.id || v.color?.id;
                                        const sId = v.sizeId?.id || v.size?.id;
                                        return String(cId) === String(selectedColor) && String(sId) === String(size.id);
                                    });
                                    const isOutOfStock = !variant || variant.stock <= 0;

                                    return (
                                        <Button
                                            key={size.id}
                                            variant={String(selectedSize) === String(size.id) ? "default" : "outline"}
                                            disabled={isOutOfStock}
                                            onClick={() => setSelectedSize(size.id)}
                                            className={`min-w-[60px] ${String(selectedSize) === String(size.id)
                                                ? "bg-primary text-white shadow-md"
                                                : "hover:border-primary hover:text-primary"
                                                }`}
                                        >
                                            {size.value || size.name}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quantity Selection */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-maintext flex items-center gap-2">
                                Chọn số lượng
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-lg overflow-hidden h-10">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="px-4 hover:bg-gray-100 border-r"
                                    >-</button>
                                    <div className="px-6 font-semibold">{quantity}</div>
                                    <button
                                        onClick={() => setQuantity(prev => Math.min(selectedVariant?.stock || 1, prev + 1))}
                                        className="px-4 hover:bg-gray-100 border-l"
                                    >+</button>
                                </div>
                                <span className="text-sm text-gray-500">
                                    Kho còn: <span className="font-bold text-primary">{selectedVariant?.stock || 0}</span> sản phẩm
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Hủy
                    </Button>
                    <Button onClick={handleAddToCart}>
                        <Icon path={mdiCartPlus} size={0.8} />
                        Thêm vào giỏ hàng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetailDialog;
