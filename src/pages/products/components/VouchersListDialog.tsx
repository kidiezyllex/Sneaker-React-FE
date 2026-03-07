import React from "react";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiContentCopy, mdiTicketPercentOutline } from "@mdi/js";

import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomToast } from "@/components/ui/custom-toast";
import { formatPrice, formatDate } from "@/utils/formatters";
import { useAvailableVouchersForUser, useVouchers } from "@/hooks/voucher";
import { usePromotions } from "@/hooks/promotion";

interface VouchersListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectVoucher: (code: string) => void;
    userId?: string | number;
}

export const VouchersListDialog: React.FC<VouchersListDialogProps> = ({
    open,
    onOpenChange,
    onSelectVoucher,
    userId,
}) => {
    const {
        data: guestVouchersData,
        isLoading: isLoadingGuest,
        isError: isErrorGuest,
    } = useVouchers({ status: "ACTIVE" });

    const {
        data: userVouchersData,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = useAvailableVouchersForUser(String(userId || ""));

    const {
        data: promotionsData,
        isLoading: isLoadingPromotions,
        isError: isErrorPromotions,
    } = usePromotions({ status: "ACTIVE" });

    const isLoading = (userId ? isLoadingUser : isLoadingGuest) || isLoadingPromotions;
    const isError = (userId ? isErrorUser : isErrorGuest) || isErrorPromotions;
    const vouchersData = userId ? userVouchersData : guestVouchersData;

    const handleCopyCode = (code: string) => {
        navigator.clipboard
            .writeText(code)
            .then(() => {
                toast.success(`Đã sao chép mã: ${code}`);
                onSelectVoucher(code);
                onOpenChange(false);
            })
            .catch((err) => {
                toast.error(
                    <CustomToast title="Không thể sao chép mã." type="error" />,
                    { icon: false }
                );
            });
    };

    const rawVouchers = Array.isArray(vouchersData?.data)
        ? vouchersData.data
        : (vouchersData?.data as any)?.vouchers || [];

    const rawPromotions = Array.isArray(promotionsData?.data)
        ? promotionsData.data
        : (promotionsData?.data as any)?.promotions || [];

    const items = [
        ...rawVouchers.map((v: any) => ({ ...v, _itemType: 'voucher' })),
        ...rawPromotions.map((p: any) => ({ ...p, _itemType: 'promotion' }))
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="4xl">
                <DialogHeader
                    title="Danh sách mã giảm giá"
                    icon={mdiTicketPercentOutline}
                />
                <ScrollArea className="overflow-y-auto p-4 bg-gray-100">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : isError ? (
                        <p className="text-red-500 text-center py-4">
                            Lỗi khi tải danh sách phiếu giảm giá.
                        </p>
                    ) : !items || items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Icon
                                path={mdiTicketPercentOutline}
                                size={2}
                                className="text-gray-700/20 mb-2"
                            />
                            <p className="text-gray-700">
                                Hiện không có mã giảm giá hoặc chương trình khuyến mãi nào khả dụng.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((item: any) => {
                                const isVoucher = item._itemType === 'voucher';
                                const code = item.code || "";
                                const name = item.name || "N/A";
                                const isExpired = new Date(item.endDate) < new Date();
                                const isInactive = item.status === "INACTIVE"; // Changed from voucher.status to item.status
                                const isOutOfStock = isVoucher && item.quantity - item.usedCount <= 0; // Only vouchers have quantity/usedCount
                                const isDisabled = isExpired || isInactive || isOutOfStock;

                                return (
                                    <div
                                        key={item.id + (isVoucher ? '-v' : '-p')}
                                        className={`relative flex flex-col overflow-hidden border rounded-xl p-4 transition-all hover:shadow-md ${isDisabled
                                            ? "bg-muted/30 border-dashed opacity-60"
                                            : isVoucher
                                                ? "bg-card border-primary/20 hover:border-primary/50"
                                                : "bg-blue-50/30 border-blue-200 hover:border-blue-400"
                                            }`}
                                    >
                                        <div className="absolute top-2 right-2 z-10 flex gap-1">
                                            {!isVoucher && (
                                                <Badge variant="info">Khuyến mãi</Badge>
                                            )}
                                            {isDisabled ? (
                                                <Badge
                                                    variant={
                                                        isExpired
                                                            ? "destructive"
                                                            : isOutOfStock
                                                                ? "warning"
                                                                : "secondary"
                                                    }
                                                    showIcon={true}
                                                >
                                                    {isExpired
                                                        ? "Đã hết hạn"
                                                        : isOutOfStock
                                                            ? "Hết lượt dùng" // Corrected typo from "lược" to "lượt"
                                                            : "Ngừng hoạt động"}
                                                </Badge>
                                            ) : (
                                                <Badge variant="success" showIcon={true}>
                                                    Khả dụng
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-3 flex flex-col flex-1">
                                            <div>
                                                <h4 className="font-semibold text-primary line-clamp-1 pr-16">
                                                    {name}
                                                </h4>
                                                {isVoucher ? (
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-semibold">Mã:</span>{" "}
                                                        <span className="font-mono bg-primary/10 px-1 rounded">
                                                            {code}
                                                        </span>
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-blue-600 italic">
                                                        Chương trình khuyến mãi tự động
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2 text-sm mt-auto">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700 font-semibold">Ưu đãi:</span>
                                                    <span className="font-bold text-primary text-2xl">
                                                        {isVoucher
                                                            ? (item.type === "PERCENTAGE" ? `Giảm ${item.value}%` : `Giảm ${formatPrice(item.value)}`)
                                                            : `Giảm ${item.discountPercent}%`
                                                        }
                                                    </span>
                                                </div>

                                                {isVoucher && item.type === "PERCENTAGE" &&
                                                    item.maxDiscount && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-700 font-semibold">Tối đa:</span>
                                                            <span>{formatPrice(item.maxDiscount)}</span>
                                                        </div>
                                                    )}

                                                {isVoucher && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-700 font-semibold">
                                                            Đơn tối thiểu:
                                                        </span>
                                                        <span>{formatPrice(item.minOrderValue)}</span>
                                                    </div>
                                                )}

                                                {!isVoucher && (
                                                    <div className="text-xs text-gray-700 line-clamp-2">
                                                        {item.description}
                                                    </div>
                                                )}

                                                <div className="flex justify-between text-sm text-gray-700 pt-1 border-t border-dashed">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">Hết hạn:</span>
                                                        <span className="font-medium text-maintext italic">
                                                            {formatDate(item.endDate)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="font-semibold">Phạm vi:</span>
                                                        <span className="font-medium text-maintext italic">
                                                            {isVoucher ? "Toàn bộ" : "Sản phẩm chọn lọc"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-end h-full pt-2">
                                                {isVoucher ? (
                                                    <Button
                                                        variant={isDisabled ? "outline" : "default"}
                                                        className="w-full gap-2"
                                                        onClick={() => handleCopyCode(code)}
                                                        disabled={isDisabled}
                                                    >
                                                        <Icon path={mdiContentCopy} size={0.8} />
                                                        {isDisabled ? "Không thể sử dụng" : "Chọn mã này"}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full text-blue-600 border border-blue-200 hover:bg-blue-50 cursor-default"
                                                        disabled={isDisabled}
                                                    >
                                                        Giảm trực tiếp vào sản phẩm
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
