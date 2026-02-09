import React, { useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import { mdiClose, mdiFileDocument, mdiPrinter } from "@mdi/js";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
} from "@/components/ui/table";
import { OrderStatusBadge } from "./OrderBadges";
import { checkImageUrl } from "@/lib/utils";
import {
    formatCurrency,
    formatDateTime,
    getPaymentMethodName
} from "@/utils/formatters";

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
    const [isProcessing, setIsProcessing] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    if (!order) return null;

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



    const handlePrintToPdf = async () => {
        try {
            setIsProcessing(true);
            const input = invoiceRef.current;
            if (!input) throw new Error("Invoice element not found");

            const canvas = await toPng(input, {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
            });

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(canvas);
            const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

            pdf.addImage(canvas, "PNG", 0, 0, pageWidth, imgHeight);
            pdf.save(`HoaDon_${order.code}.pdf`);
            toast.success("Đã tải xuống hóa đơn PDF!");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tạo file PDF");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="4xl">
                <DialogHeader
                    title={`Hóa đơn đơn hàng #${order.code}`}
                    icon={mdiFileDocument}
                />
                <div className="p-4" ref={invoiceRef}>
                    <div className="border-b pb-4 mb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-xl mb-2">STREET SNEAKER</h3>
                                <p className="text-sm text-maintext">Hóa đơn bán hàng</p>
                                <p className="text-sm text-maintext">
                                    Ngày: {formatDateTime(order.createdAt)}
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
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button
                        onClick={handlePrintToPdf}
                        disabled={isProcessing}
                        className="flex items-center gap-2"
                    >
                        <Icon path={mdiPrinter} size={0.8} />
                        {isProcessing ? "Đang xử lý..." : "Lưu PDF & In"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
