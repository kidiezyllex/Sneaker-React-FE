import { useState, useEffect } from "react";
import { Icon } from "@mdi/react";
import {
    mdiCartPlus,
    mdiCheck,
    mdiClose,
    mdiPalette, mdiRuler
} from "@mdi/js";
import {
    Dialog,
    DialogContent,
    DialogHeader, DialogFooter
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
    activeCartName?: string;
}

const ProductDetailDialog = ({
    isOpen,
    onClose,
    product,
    addItemToCorrectCart,
    activeCartName = "Checkout",
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
            <DialogContent size="md">
                <DialogHeader title="Chi tiết sản phẩm POS" icon={mdiCartPlus} />

                <div className="space-y-4 py-2 px-4">
                    {/* content start */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column: Image & Basic Info */}
                        <div className="space-y-4">
                            <div className="relative group aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center transition-all duration-300 hover:shadow-inner">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                                <img
                                    src={checkImageUrl(selectedVariant?.images?.[0]?.imageUrl || selectedVariant?.images?.[0] || product.variants?.[0]?.images?.[0]?.imageUrl)}
                                    alt={product.name}
                                    className="object-contain w-full h-full p-2 transition-transform duration-500 group-hover:scale-105 z-10"
                                />

                                {product.hasDiscount && (
                                    <div className="absolute top-3 right-3 z-20">
                                        <Badge variant="success" className="text-sm font-bold shadow-lg bg-[#00B207] ring-2 ring-white">
                                            -{product.discountPercent}%
                                        </Badge>
                                    </div>
                                )}

                                {/* Corner Accents Overlay (SVG) */}
                                <div className="absolute inset-0 pointer-events-none z-20 p-2 opacity-40">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                                        <path d="M10 5H5V10" stroke="currentColor" strokeWidth="1" className="text-primary" />
                                        <path d="M90 5H95V10" stroke="currentColor" strokeWidth="1" className="text-primary" />
                                        <path d="M10 95H5V90" stroke="currentColor" strokeWidth="1" className="text-primary" />
                                        <path d="M90 95H95V90" stroke="currentColor" strokeWidth="1" className="text-primary" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-primary">{product.name}</h2>
                                <div className="flex flex-col items-start gap-2">
                                    <Badge variant="secondary">Mã: {product.code}</Badge>
                                    <Badge variant="success">
                                        Giá bán:
                                        {formatCurrency(product.hasDiscount ? product.discountedPrice : selectedVariant?.price || 0)}
                                        {product.hasDiscount && (
                                            formatCurrency(product.originalPrice)
                                        )}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Selection Options */}
                        <div className="space-y-4">
                            {/* Color Selection */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-primary flex items-center gap-1">
                                    <Icon path={mdiPalette} size={0.8} /> Màu sắc
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {colors.map((color: any) => (
                                        <button
                                            key={color.id}
                                            onClick={() => handleColorSelect(color.id)}
                                            className={`group relative w-8 h-8 rounded-full transition-all duration-300 ${String(selectedColor) === String(color.id)
                                                ? "ring-2 ring-primary ring-offset-2 shadow-lg"
                                                : "hover:scale-105 ring-2 ring-gray-100"
                                                }`}
                                            style={{ backgroundColor: color.code }}
                                            title={color.name}
                                        >
                                            <div className={`absolute inset-0 rounded-full border border-black/5 ${String(selectedColor) === String(color.id) ? "opacity-100" : "opacity-0"}`}></div>
                                            {String(selectedColor) === String(color.id) && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Icon path={mdiCheck} size={0.8} className="text-white drop-shadow-md" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-primary flex items-center gap-1">
                                    <Icon path={mdiRuler} size={0.8} /> Kích thước
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
                                            <button
                                                key={size.id}
                                                disabled={isOutOfStock}
                                                onClick={() => setSelectedSize(size.id)}
                                                className={`min-w-[48px] h-9 px-3 rounded-lg text-sm font-bold transition-all border ${String(selectedSize) === String(size.id)
                                                    ? "bg-primary text-white border-primary shadow-md transform -translate-y-0.5"
                                                    : isOutOfStock
                                                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                                                    }`}
                                            >
                                                {size.value || size.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quantity Selection */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-primary flex items-center gap-1">
                                    <Icon path={mdiCartPlus} size={0.8} /> Số lượng
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Kho còn: <span className="text-primary font-black">{selectedVariant?.stock || 0}</span></p>
                                </div>

                                <div className="flex items-center bg-white rounded-xl border border-primary/60 w-fit h-10">
                                    <button
                                        className="min-w-10"
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    >
                                        <span className="text-primary text-lg font-bold">−</span>
                                    </button>
                                    <div className="w-8 text-center font-bold text-black">{quantity}</div>
                                    <button
                                        className="min-w-10"
                                        onClick={() => setQuantity(prev => Math.min(selectedVariant?.stock || 1, prev + 1))}
                                    >
                                        <span className="text-primary text-lg font-bold">+</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* content end */}
                </div>

                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Hủy
                    </Button>
                    <Button onClick={handleAddToCart}>
                        <Icon path={mdiCartPlus} size={0.8} />
                        Thêm vào {activeCartName}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetailDialog;
