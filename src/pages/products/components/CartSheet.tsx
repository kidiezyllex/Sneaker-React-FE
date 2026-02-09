import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import {
    mdiMinus,
    mdiPlus,
    mdiDelete,
    mdiCheck,
    mdiClose,
    mdiShopping,
    mdiCreditCardOutline,
    mdiLoading,
    mdiTicketPercentOutline,
} from "@mdi/js";
import { motion, AnimatePresence } from "framer-motion";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { CustomToast } from "@/components/ui/custom-toast";
import { useCartStore } from "@/stores/useCartStore";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/context/useUserContext";
import { useValidateVoucher } from "@/hooks/voucher";
import { checkImageUrl } from "@/lib/utils";
import { formatPrice } from "@/utils/formatters";
import { VouchersListDialog } from "./VouchersListDialog";

interface CartSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ open, onOpenChange }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const { showToast } = useToast();
    const { profile } = useUser();
    const userId = profile?.data?.id;
    const {
        items,
        removeFromCart,
        updateQuantity,
        appliedVoucher,
        voucherDiscount,
        setAppliedVoucher,
        removeVoucher,
        subtotal: finalSubtotal,
        tax: finalTax,
        shipping: finalShipping,
        total: finalTotal,
    } = useCartStore();
    const [voucher, setVoucher] = React.useState("");
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [showVouchersDialog, setShowVouchersDialog] = React.useState(false);
    const [quantityInputs, setQuantityInputs] = React.useState<{
        [key: string]: string;
    }>({});

    const validateVoucherMutation = useValidateVoucher();

    React.useEffect(() => {
        const newInputs: { [key: string]: string } = {};
        items.forEach((item) => {
            if (!quantityInputs[item.id]) {
                newInputs[item.id] = item.quantity.toString();
            }
        });
        if (Object.keys(newInputs).length > 0) {
            setQuantityInputs((prev) => ({ ...prev, ...newInputs }));
        }
    }, [items]);

    const handleQuantityInputChange = (id: string, value: string) => {
        const item = items.find((item) => item.id === id);
        if (!item) return;

        // Allow empty string for user typing
        if (value === "") {
            setQuantityInputs((prev) => ({ ...prev, [id]: value }));
            return;
        }

        const newQuantity = parseInt(value) || 0;

        // Immediate validation feedback
        if (newQuantity < 0) {
            showToast({
                title: "Lỗi",
                message: "Số lượng không thể âm",
                type: "error",
            });
            setQuantityInputs((prev) => ({
                ...prev,
                [id]: item.quantity.toString(),
            }));
            return;
        }

        if (item.stock && newQuantity > item.stock) {
            showToast({
                title: "Lỗi",
                message: `Số lượng không thể vượt quá tồn kho (${item.stock})`,
                type: "error",
            });
            setQuantityInputs((prev) => ({ ...prev, [id]: item.stock!.toString() }));
            return;
        }

        setQuantityInputs((prev) => ({ ...prev, [id]: value }));
    };

    const handleQuantityInputBlur = (id: string) => {
        const item = items.find((item) => item.id === id);
        if (!item) return;

        const inputValue = quantityInputs[id];
        const newQuantity = parseInt(inputValue) || 0;

        if (newQuantity <= 0) {
            showToast({
                title: "Lỗi",
                message: "Số lượng phải lớn hơn 0",
                type: "error",
            });
            setQuantityInputs((prev) => ({
                ...prev,
                [id]: item.quantity.toString(),
            }));
            return;
        }

        if (item.stock && newQuantity > item.stock) {
            showToast({
                title: "Lỗi",
                message: `Số lượng không thể vượt quá tồn kho (${item.stock})`,
                type: "error",
            });
            setQuantityInputs((prev) => ({ ...prev, [id]: item.stock!.toString() }));
            return;
        }

        updateQuantity(id, newQuantity);
    };

    const handleQuantityChange = (id: string, delta: number) => {
        const item = items.find((item) => item.id === id);
        if (!item) return;

        const newQuantity = item.quantity + delta;

        if (newQuantity <= 0) {
            removeFromCart(id);
            return;
        }

        if (item.stock && newQuantity > item.stock) {
            showToast({
                title: "Lỗi",
                message: `Số lượng không thể vượt quá tồn kho (${item.stock})`,
                type: "error",
            });
            return;
        }

        updateQuantity(id, newQuantity);
        setQuantityInputs((prev) => ({ ...prev, [id]: newQuantity.toString() }));
    };

    const handleApplyVoucher = async () => {
        if (!userId) {
            showToast({
                title: "Lỗi",
                message: "Vui lòng đăng nhập để sử dụng mã giảm giá",
                type: "error",
            });
            return;
        }

        try {
            setIsProcessing(true);
            const result = await validateVoucherMutation.mutateAsync({
                code: voucher,
                orderValue: finalSubtotal,
            });

            if (result.statusCode === 200 && result.data?.voucher) {
                const voucherData = result.data.voucher;
                setAppliedVoucher({
                    code: voucherData.code,
                    discount: result.data.discountAmount,
                    voucherId: voucherData.id.toString(),
                    discountType: voucherData.type,
                    discountValue: voucherData.value,
                    maxDiscount: voucherData.maxDiscount || undefined,
                });
                setVoucher("");
                toast.success(
                    <CustomToast
                        title={`Áp dụng mã ${voucherData.code} thành công`}
                        description={`Bạn được giảm ${formatPrice(
                            result.data.discountAmount
                        )} cho đơn hàng này`}
                        type="success"
                    />,
                    { icon: false }
                );
            } else {
                showToast({
                    title: "Lỗi",
                    message: result.message || "Mã giảm giá không hợp lệ",
                    type: "error",
                });
            }
        } catch (error: any) {
            showToast({
                title: "Lỗi",
                message: error.message || "Không thể kiểm tra mã giảm giá",
                type: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveVoucher = () => {
        removeVoucher();
        toast.success(<CustomToast title="Đã xóa mã giảm giá" type="success" />, {
            icon: false,
        });
    };

    const handleSelectVoucher = (code: string) => {
        setVoucher(code);
    };

    const handleCheckout = async () => {
        try {
            if (items.length === 0) {
                toast.error(<CustomToast title="Giỏ hàng trống" type="error" />, {
                    icon: false,
                });
                return;
            }
            toast.info(
                <CustomToast title="Đang chuyển đến trang thanh toán" type="info" />,
                { icon: false }
            );
            navigate("/checkout/shipping");
            onOpenChange(false);
        } catch (error) {
            console.error("Error during checkout:", error);
            showToast({
                title: "Lỗi",
                message: "Đã có lỗi xảy ra khi xử lý đơn hàng",
                type: "error",
            });
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    className="w-full sm:max-w-2xl flex flex-col text-maintext p-4 pr-3"
                    side="right"
                >
                    <SheetHeader className="border-b pb-4">
                        <SheetTitle>Giỏ hàng của bạn ({items.length})</SheetTitle>
                    </SheetHeader>

                    {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <p className="text-gray-600">
                                Giỏ hàng của bạn đang trống
                            </p>
                            <Button
                                onClick={() => onOpenChange(false)}
                                className="mt-4 gap-2"
                            >
                                <Icon path={mdiShopping} size={0.8} />
                                Tiếp tục mua sắm
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="flex-1 mb-4 pr-2">
                            <>
                                <div className="space-y-4 pr-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="relative h-24 w-24 bg-muted rounded overflow-hidden">
                                                <img
                                                    src={checkImageUrl(item.image)}
                                                    alt={item.name}
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between  mb-2">
                                                    <h4 className="font-medium line-clamp-1">
                                                        {item.name}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="hover:text-red-400 text-sm text-red-500 p-2 rounded-full bg-red-50"
                                                    >
                                                        <Icon path={mdiDelete} size={0.8} />
                                                    </button>
                                                </div>
                                                <div className="text-sm text-gray-600 flex items-center justify-between mb-2">
                                                    <span>Thương hiệu: {item.brand}</span>
                                                    {item.stock !== undefined && (
                                                        <span
                                                            className={`ml-2 text-sm px-2 py-0.5 rounded-full ${item.stock > 10
                                                                ? "bg-green-100 text-green-700"
                                                                : item.stock > 0
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            Tồn kho: {item.stock}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center border rounded">
                                                        <button
                                                            className="px-2 py-1 text-sm hover:bg-muted transition-colors"
                                                            onClick={() => handleQuantityChange(item.id, -1)}
                                                        >
                                                            <Icon path={mdiMinus} size={0.8} />
                                                        </button>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={item.stock}
                                                            value={quantityInputs[item.id] || item.quantity}
                                                            onChange={(e) =>
                                                                handleQuantityInputChange(
                                                                    item.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            onBlur={() => handleQuantityInputBlur(item.id)}
                                                            className={`w-16 h-8 text-center border-0 focus:ring-0 text-sm ${item.stock && item.quantity >= item.stock
                                                                ? "bg-green-50 text-green-800"
                                                                : ""
                                                                }`}
                                                            title={
                                                                item.stock
                                                                    ? `Tồn kho: ${item.stock}`
                                                                    : undefined
                                                            }
                                                        />
                                                        <button
                                                            className="px-2 py-1 text-sm hover:bg-muted transition-colors"
                                                            onClick={() => handleQuantityChange(item.id, 1)}
                                                            disabled={
                                                                item.stock ? item.quantity >= item.stock : false
                                                            }
                                                        >
                                                            <Icon path={mdiPlus} size={0.8} />
                                                        </button>
                                                    </div>
                                                    <div>
                                                        {item.hasDiscount && item.originalPrice && (
                                                            <div className="text-right">
                                                                <span className="text-sm line-through text-gray-600 block">
                                                                    {formatPrice(item.originalPrice)}
                                                                </span>
                                                                <span className="font-medium text-green-600">
                                                                    {formatPrice(item.price)}
                                                                </span>
                                                                {item.discountPercent && (
                                                                    <span className="text-sm text-green-600 ml-1">
                                                                        (-{item.discountPercent}%)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {!item.hasDiscount && (
                                                            <span className="font-medium">
                                                                {formatPrice(item.price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-4 mt-4">
                                    {/* Voucher Section */}
                                    <div className="space-y-2">
                                        <AnimatePresence mode="wait">
                                            {appliedVoucher ? (
                                                <motion.div
                                                    key="applied-voucher"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-md"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Icon
                                                            path={mdiCheck}
                                                            size={0.8}
                                                            className="text-green-600"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-sm text-primary flex items-center gap-1.5">
                                                                <Icon
                                                                    path={mdiTicketPercentOutline}
                                                                    size={0.8}
                                                                />
                                                                {appliedVoucher.code}
                                                            </div>
                                                            <div className="text-sm text-green-600 font-semibold">
                                                                Giảm {formatPrice(voucherDiscount)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleRemoveVoucher}
                                                        className="hover:text-red-400 text-sm text-red-500 p-2 rounded-full bg-red-50 border border-red-300"
                                                    >
                                                        <Icon path={mdiClose} size={0.8} />
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="voucher-input"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="space-y-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            placeholder="Mã giảm giá"
                                                            className="flex-1"
                                                            value={voucher}
                                                            onChange={(e) => setVoucher(e.target.value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === "Enter") {
                                                                    handleApplyVoucher();
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            variant="default"
                                                            onClick={handleApplyVoucher}
                                                            disabled={isProcessing || !voucher.trim()}
                                                            className="px-4 gap-2"
                                                        >
                                                            {isProcessing ? (
                                                                <Icon
                                                                    path={mdiLoading}
                                                                    size={0.8}
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <Icon path={mdiCheck} size={0.8} />
                                                            )}
                                                            {isProcessing ? "Đang kiểm tra..." : "Áp dụng"}
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="link"
                                                        className="text-sm text-primary p-0 h-auto flex items-center gap-2"
                                                        onClick={() => setShowVouchersDialog(true)}
                                                    >
                                                        <Icon path={mdiTicketPercentOutline} size={0.8} />
                                                        Xem danh sách mã giảm giá
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm font-semibold">
                                                Tạm tính
                                            </span>
                                            <span>{formatPrice(finalSubtotal)}</span>
                                        </div>

                                        {/* Hiển thị tổng tiết kiệm từ khuyến mãi sản phẩm */}
                                        {(() => {
                                            const totalSavings = items.reduce((total, item) => {
                                                if (item.hasDiscount && item.originalPrice) {
                                                    return (
                                                        total +
                                                        (item.originalPrice - item.price) * item.quantity
                                                    );
                                                }
                                                return total;
                                            }, 0);

                                            if (totalSavings > 0) {
                                                return (
                                                    <div className="flex justify-between text-green-600">
                                                        <span className="text-sm font-semibold">
                                                            Tiết kiệm từ khuyến mãi
                                                        </span>
                                                        <span>-{formatPrice(totalSavings)}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {/* Hiển thị giảm giá từ voucher */}
                                        {voucherDiscount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span className="text-sm font-semibold">
                                                    Giảm giá voucher
                                                </span>
                                                <span>-{formatPrice(voucherDiscount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm font-semibold">
                                                Thuế VAT (5%)
                                            </span>
                                            <span>{formatPrice(finalTax)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm font-semibold">
                                                Phí vận chuyển
                                                {finalShipping === 0 && (
                                                    <span className="text-green-600 ml-1">
                                                        (Miễn phí)
                                                    </span>
                                                )}
                                            </span>
                                            <span>{formatPrice(finalShipping)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-medium">
                                            <span className="text-sm font-semibold">Tổng</span>
                                            <span className="text-base font-semibold">
                                                {formatPrice(finalTotal)}
                                            </span>
                                        </div>
                                    </div>

                                    <SheetFooter className="flex gap-2 items-center">
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2"
                                            onClick={() => {
                                                onOpenChange(false);
                                                if (!pathname.includes("products")) {
                                                    navigate("/products");
                                                }
                                            }}
                                        >
                                            <Icon path={mdiShopping} size={0.8} />
                                            Tiếp tục mua hàng
                                        </Button>
                                        <Button
                                            className="w-full gap-2"
                                            onClick={handleCheckout}
                                            disabled={isProcessing || items.length === 0}
                                        >
                                            {isProcessing ? (
                                                <Icon
                                                    path={mdiLoading}
                                                    size={0.8}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Icon path={mdiCreditCardOutline} size={0.8} />
                                            )}
                                            {isProcessing ? "Đang xử lý..." : "Thanh toán"}
                                        </Button>
                                    </SheetFooter>
                                </div>
                            </>
                        </ScrollArea>
                    )}
                </SheetContent>
            </Sheet>

            {/* Vouchers List Dialog */}
            <VouchersListDialog
                open={showVouchersDialog}
                onOpenChange={setShowVouchersDialog}
                onSelectVoucher={handleSelectVoucher}
                userId={userId}
            />
        </>
    );
};
