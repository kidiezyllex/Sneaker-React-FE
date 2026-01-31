import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import { mdiFileDocument, mdiPrinter } from "@mdi/js";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
} from "@/components/ui/table";
import { OrderStatusBadge } from "./OrderBadges";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { checkImageUrl } from "@/lib/utils";

interface OrderInvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: any;
}

export const OrderInvoiceDialog: React.FC<OrderInvoiceDialogProps> = ({
    open,
    onOpenChange,
    order,
}) => {
    if (!order) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    };

    const getVariantImage = (item: any) => {
        if (item.variant?.images?.[0]?.imageUrl) {
            return checkImageUrl(item.variant.images[0].imageUrl);
        }

        if (item.product?.variants) {
            const variantWithImage = item.product.variants.find(
                (v: any) => v.images && v.images.length > 0
            );
            return checkImageUrl(variantWithImage?.images?.[0]?.imageUrl);
        }

        return checkImageUrl(null);
    };

    const getPaymentMethodName = (method: string) => {
        switch (method) {
            case "CASH":
                return "Tiền mặt";
            case "BANK_TRANSFER":
                return "Chuyển khoản ngân hàng";
            case "COD":
                return "Thanh toán khi nhận hàng";
            case "MIXED":
                return "Thanh toán nhiều phương thức";
            default:
                return "Không xác định";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="4xl">
                <DialogHeader
                    title={`Hóa đơn đơn hàng #${order.code}`}
                    icon={mdiFileDocument}
                />
                <div className="p-4">
                    <div className="border-b pb-4 mb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-xl mb-2">STREET SNEAKER</h3>
                                <p className="text-sm text-maintext">Hóa đơn bán hàng</p>
                                <p className="text-sm text-maintext">
                                    Ngày: {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-xl mb-2">
                                    Mã hóa đơn: #{order.code}
                                </h3>
                                <div className="flex justify-end">
                                    <OrderStatusBadge status={order.orderStatus} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <h3 className="font-semibold mb-2">Thông tin khách hàng:</h3>
                            <p>Tên: {order.customer?.fullName || order.shippingName}</p>
                            <p>SĐT: {order.customer?.phoneNumber || order.shippingPhoneNumber}</p>
                            {(order.customer?.email || order.shippingEmail) && (
                                <p>Email: {order.customer?.email || order.shippingEmail}</p>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Địa chỉ giao hàng:</h3>
                            <p>
                                {order.shippingSpecificAddress ||
                                    order.shippingAddress?.specificAddress ||
                                    "Tại quầy"}
                            </p>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead className="text-right">Đơn giá</TableHead>
                                <TableHead className="text-right">Số lượng</TableHead>
                                <TableHead className="text-right">Thành tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item: any, index: number) => {
                                const variantImage = getVariantImage(item);

                                return (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {variantImage && (
                                                    <div className="w-10 h-10 rounded border overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img
                                                            src={variantImage}
                                                            alt={item.product?.name || "Sản phẩm"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-sm">
                                                        {item.product?.name || "Sản phẩm không rõ"}
                                                    </div>
                                                    <div className="text-xs text-maintext/70 mt-0.5">
                                                        {item.variant?.color?.name} /{" "}
                                                        {item.variant?.size?.value}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.price * item.quantity)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between">
                            <span>Tổng tiền hàng:</span>
                            <span>{formatCurrency(order.subTotal)}</span>
                        </div>
                        {order.voucher && (
                            <div className="flex justify-between">
                                <span>Giảm giá ({order.voucher.code}):</span>
                                <span className="text-red-500">
                                    -{formatCurrency(order.discount)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t font-bold">
                            <span>Tổng thanh toán:</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Phương thức thanh toán:</span>
                            <span>{getPaymentMethodName(order.paymentMethod)}</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-maintext">
                        <p>Cảm ơn quý khách đã mua hàng tại STREET SNEAKER</p>
                        <p>Hotline: 1900 1234</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Đóng
                    </Button>
                    <Button>
                        <Icon path={mdiPrinter} size={0.7} className="mr-2" />
                        In hóa đơn
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
