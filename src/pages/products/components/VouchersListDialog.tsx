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
import { useAvailableVouchersForUser } from "@/hooks/voucher";
import { IVoucher } from "@/interface/response/voucher";

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
        data: vouchersData,
        isLoading,
        isError,
    } = useAvailableVouchersForUser(String(userId || ""));

    const handleCopyCode = (code: string) => {
        navigator.clipboard
            .writeText(code)
            .then(() => {
                toast.success(<CustomToast title={`Đã sao chép mã: ${code}`} />, {
                    icon: false,
                });
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

    const vouchers = Array.isArray(vouchersData?.data)
        ? vouchersData.data
        : (vouchersData?.data as any)?.vouchers;

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
                    ) : !vouchers || vouchers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Icon
                                path={mdiTicketPercentOutline}
                                size={2}
                                className="text-gray-600/20 mb-2"
                            />
                            <p className="text-gray-600">
                                Hiện không có phiếu giảm giá nào khả dụng.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vouchers.map((voucher: IVoucher) => {
                                const isExpired = new Date(voucher.endDate) < new Date();
                                const isInactive = voucher.status === "INACTIVE";
                                const isOutOfStock = voucher.quantity - voucher.usedCount <= 0;
                                const isDisabled = isExpired || isInactive || isOutOfStock;

                                return (
                                    <div
                                        key={voucher.id}
                                        className={`relative flex flex-col overflow-hidden border rounded-xl p-4 transition-all hover:shadow-md ${isDisabled
                                            ? "bg-muted/30 border-dashed opacity-60"
                                            : "bg-card border-primary/20 hover:border-primary/50"
                                            }`}
                                    >
                                        {isDisabled && (
                                            <div className="absolute top-2 right-2 z-10">
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
                                                            ? "Hết lượt dùng"
                                                            : "Ngừng hoạt động"}
                                                </Badge>
                                            </div>
                                        )}

                                        {!isDisabled && (
                                            <div className="absolute top-2 right-2">
                                                <Badge variant="success" showIcon={true}>
                                                    Khả dụng
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="space-y-3 flex flex-col flex-1">
                                            <div>
                                                <h4 className="font-semibold text-primary line-clamp-1">
                                                    {voucher.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold">Mã:</span>{" "}
                                                    <span className="font-mono bg-primary/10 px-1 rounded">
                                                        {voucher.code}
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="space-y-2 text-sm mt-auto">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 font-semibold">Ưu đãi:</span>
                                                    <span className="font-bold text-primary text-2xl">
                                                        Giảm {voucher.type === "PERCENTAGE"
                                                            ? `${voucher.value}%`
                                                            : formatPrice(voucher.value)}
                                                    </span>
                                                </div>

                                                {voucher.type === "PERCENTAGE" &&
                                                    voucher.maxDiscount && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 font-semibold">Tối đa:</span>
                                                            <span>{formatPrice(voucher.maxDiscount)}</span>
                                                        </div>
                                                    )}

                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 font-semibold">
                                                        Đơn tối thiểu:
                                                    </span>
                                                    <span>{formatPrice(voucher.minOrderValue)}</span>
                                                </div>

                                                <div className="flex justify-between text-sm text-gray-600 pt-1 border-t border-dashed">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">Hết hạn:</span>
                                                        <span className="font-medium text-maintext italic">
                                                            {formatDate(voucher.endDate)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="font-semibold">Cửa hàng:</span>
                                                        <span className="font-medium text-maintext italic">
                                                            Sneaker Shop
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-end h-full pt-2">
                                                <Button
                                                    variant={isDisabled ? "outline" : "default"}
                                                    className="w-full gap-2"
                                                    onClick={() => handleCopyCode(voucher.code)}
                                                    disabled={isDisabled}
                                                >
                                                    <Icon path={mdiContentCopy} size={0.8} />
                                                    {isDisabled ? "Không thể sử dụng" : "Chọn mã này"}
                                                </Button>
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
