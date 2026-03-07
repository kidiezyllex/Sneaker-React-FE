import React, { useState, useRef } from "react";
import { Icon } from "@mdi/react";
import { mdiPrinter, mdiFileDocument, mdiClose } from "@mdi/js";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime, getOrderStatusName, getPaymentStatusName } from "@/utils/formatters";
import { usePOSCartStore } from "@/stores/usePOSCartStore";

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const SHOP_INFO = {
  name: "SNEAKER STORE",
  address: "123 Đường Giày Sneaker, Quận 1, TP. HCM",
  phone: "0123 456 789",
  email: "contact@sneakerstore.vn",
};

const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { cashReceived: storeCashReceived, changeDue: storeChangeDue } = usePOSCartStore();

  if (!order) return null;

  // Extract data from order object (backend structure)
  const orderId = order.code || order.id || "(Đơn mới)";
  const createdAt = order.createdAt || new Date().toISOString();
  const customerInfo = {
    name: order.shippingName || order.customerName || order.account?.fullName || "Khách lẻ",
    phone: order.shippingPhoneNumber || order.customerPhone || order.account?.phoneNumber || "Chưa có SĐT",
    address: order.shippingSpecificAddress || "Bán tại quầy",
  };
  const employeeName = order.employee?.fullName || order.employeeName || "Nhân viên POS";
  const items = order.items || order.orderItems || [];
  const subTotal = order.subTotal || order.totalAmount || 0;
  const discountAmount = order.discount || order.discountAmount || 0;
  const totalAmount = order.total || order.totalAmount || 0;

  // Use values from store if not provided by backend (POS Case)
  const cashReceived = order.cashReceived || storeCashReceived || totalAmount;
  const changeGiven = order.changeDue !== undefined ? order.changeDue : (storeChangeDue || Math.max(0, cashReceived - totalAmount));
  const orderStatus = getOrderStatusName(order.orderStatus);
  const paymentStatus = getPaymentStatusName(order.paymentStatus);
  const paymentMethodName = (order.paymentMethod || "").toUpperCase() === "CASH" ? "Tiền mặt" : (order.paymentMethod || "Chuyển khoản");

  const handlePrintToPdf = async () => {
    try {
      setIsProcessing(true);

      const input = invoiceRef.current;
      if (!input) throw new Error("Invoice element not found");

      const canvas = await toPng(input, {
        quality: 0.95,
        pixelRatio: 2,
        skipAutoScale: true,
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(canvas);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(canvas, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save(
        `HoaDon_${orderId.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
      );

      toast.success("Đã lưu hoá đơn PDF thành công!");
    } catch (error) {
      toast.error("Lỗi khi in hoá đơn PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="4xl">
        <DialogHeader
          title="Hoá đơn bán hàng"
          icon={mdiFileDocument}
        />
        <CustomScrollArea className="flex-1 min-h-0 p-4">
          <div ref={invoiceRef} className="bg-white" id="invoice-content">
            <div className="w-full justify-center mb-4">
              <img
                draggable="false"
                src="/images/logo.png"
                alt="logo"
                className="w-auto mx-auto h-24 object-contain"
              />
            </div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold uppercase text-primary">
                {SHOP_INFO.name}
              </h2>
              <p className="text-sm text-gray-700">{SHOP_INFO.address}</p>
              <p className="text-sm text-gray-700">
                ĐT: {SHOP_INFO.phone} - Email: {SHOP_INFO.email}
              </p>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
              <div className="space-y-1">
                <p>
                  <span className="font-semibold">Mã HĐ:</span> {orderId}
                </p>
                <p>
                  <span className="font-semibold">Ngày:</span>{" "}
                  {formatDateTime(createdAt)}
                </p>
                <p>
                  <span className="font-semibold">Nhân viên:</span> {employeeName}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p>
                  <span className="font-semibold">Khách hàng:</span> {customerInfo.name}
                </p>
                <p>
                  <span className="font-semibold">Điện thoại:</span> {customerInfo.phone}
                </p>
                {customerInfo.address && customerInfo.address !== "Bán tại quầy" && customerInfo.address !== "Trống" && (
                  <p>
                    <span className="font-semibold">Địa chỉ:</span> {customerInfo.address}
                  </p>
                )}
                <div className="flex justify-end gap-2 mt-2">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                    HĐ: {orderStatus}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                    TT: {getPaymentStatusName(order.paymentStatus || "PAID")}
                  </span>
                </div>
              </div>
            </div>

            <Table className="mb-8 border">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center border">STT</TableHead>
                  <TableHead className="w-[80px] text-center border">Ảnh</TableHead>
                  <TableHead className="border">Sản phẩm</TableHead>
                  <TableHead className="text-right w-[60px] border">SL</TableHead>
                  <TableHead className="text-right w-[120px] border">Đơn giá</TableHead>
                  <TableHead className="text-right w-[130px] border">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any, index: number) => {
                  const variant = item.variant || item.productVariant || {};
                  const price = item.price || 0;
                  const qty = item.quantity || 0;
                  const name = item.productName || variant.product?.name || item.name || "Sản phẩm";
                  const color = variant.color?.name || item.colorName || "Mặc định";
                  const size = variant.size?.value || variant.size?.name || item.sizeName || "Tiêu chuẩn";
                  const imageUrl = variant.images?.[0]?.imageUrl || "/images/placeholder.png";

                  return (
                    <TableRow key={index}>
                      <TableCell className="text-center border">{index + 1}</TableCell>
                      <TableCell className="text-center border p-1">
                        <div className="w-12 h-12 mx-auto overflow-hidden rounded-md border border-gray-100">
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/placeholder.png";
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="border">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">{name}</span>
                          <span className="text-[11px] text-gray-700">
                            Phân loại: {color} / {size}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right border">{qty}</TableCell>
                      <TableCell className="text-right border">
                        {formatCurrency(price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold border">
                        {formatCurrency(price * qty)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex justify-end mb-8">
              <div className="w-full max-w-sm space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tổng tiền hàng:</span>
                  <span className="font-medium">{formatCurrency(subTotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span className="flex items-center gap-1">
                      Giảm giá:
                    </span>
                    <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="text-black">TỔNG THANH TOÁN:</span>
                  <span className="text-primary">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <Separator />
                <div className="space-y-1 pt-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Hình thức thanh toán:</span>
                    <span className="text-black font-medium">{paymentMethodName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiền khách đưa:</span>
                    <span className="text-black font-medium">{formatCurrency(cashReceived)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiền thừa trả khách:</span>
                    <span className="text-primary font-bold">{formatCurrency(changeGiven)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 mt-12">
              <p className="font-bold text-lg italic">Cảm ơn Quý khách và hẹn gặp lại!</p>
              <p className="text-sm text-gray-700 underline">www.sneakerstore.vn</p>
            </div>
          </div>
        </CustomScrollArea>
        <DialogFooter className="p-4 bg-slate-50 border-t">
          <Button variant="outline" onClick={onClose}>
            <Icon path={mdiClose} size={0.8} />
            Đóng
          </Button>
          <Button onClick={handlePrintToPdf} disabled={isProcessing}>
            <Icon path={mdiPrinter} size={0.8} />
            {isProcessing ? "Đang xử lý..." : "Lưu PDF & In"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;