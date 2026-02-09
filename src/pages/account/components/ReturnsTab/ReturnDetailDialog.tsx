import React from "react";
import { Icon } from "@mdi/react";
import { mdiCancel, mdiCash, mdiOrderBoolAscending, mdiPackageVariant, mdiClose } from "@mdi/js";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";
import { useMyReturnDetail, useCancelMyReturn } from "@/hooks/return";
import {
  Dialog,
  DialogContent, DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatters";
import { ReturnStatusBadge } from "../components/Badges";
import { Badge } from "@/components/ui/badge";

interface ReturnDetailDialogProps {
  returnId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void;
}

const ReturnDetailDialog: React.FC<ReturnDetailDialogProps> = ({
  returnId,
  open,
  onOpenChange,
  onCancel,
}) => {
  const {
    data: returnData,
    isLoading,
    isError,
  } = useMyReturnDetail(returnId || "");
  const cancelReturnMutation = useCancelMyReturn();

  const handleCancelReturn = () => {
    if (!returnId) return;

    cancelReturnMutation.mutate(returnId, {
      onSuccess: () => {
        toast.success("Đã hủy yêu cầu trả hàng");
        onCancel?.();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error("Đã xảy ra lỗi khi hủy yêu cầu");
      },
    });
  };

  if (!open || !returnId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="4xl">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-red-500">
              Đã xảy ra lỗi khi tải thông tin trả hàng.
            </p>
          </div>
        ) : returnData && returnData.data ? (
          <>
            <DialogHeader className="border-b">
              <DialogTitle className="flex items-center gap-2">
                Chi tiết trả hàng #{returnData.data.code}
                <ReturnStatusBadge status={returnData.data.status} />
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 p-4 bg-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thông tin đơn hàng gốc */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon path={mdiOrderBoolAscending} size={0.8} className="text-primary" />
                      </div>
                      <span>Thông tin đơn gốc</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold text-sm">Mã đơn hàng:</span>
                      <span className="font-medium">
                        {typeof returnData.data.originalOrder === "string"
                          ? returnData.data.originalOrder
                          : returnData.data.originalOrder.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold text-sm">Ngày tạo đơn:</span>
                      <span className="font-medium">
                        {typeof returnData.data.originalOrder !== "string" && returnData.data.originalOrder.createdAt
                          ? format(new Date(returnData.data.originalOrder.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold text-sm">Ngày yêu cầu:</span>
                      <span className="font-medium">
                        {format(new Date(returnData.data.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Lý do & Ghi chú */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon path={mdiPackageVariant} size={0.8} className="text-primary" />
                      </div>
                      <span>Lý do & Ghi chú</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold text-sm">Lý do trả:</span>
                      <Badge variant="outline" className="font-medium">
                        {returnData.data.reason}
                      </Badge>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-gray-600 font-semibold text-sm w-20">Ghi chú:</span>
                      <span className="text-right italic text-gray-500">
                        {returnData.data.note || "Không có ghi chú"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon path={mdiPackageVariant} size={0.8} className="text-primary" />
                    </div>
                    <span>Sản phẩm trả hàng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      try {
                        const items = typeof returnData.data.items === 'string'
                          ? JSON.parse(returnData.data.items)
                          : returnData.data.items;

                        if (!Array.isArray(items)) return null;

                        return items.map((item: any, index: number) => {
                          const orderItems = typeof returnData.data.originalOrder !== 'string'
                            ? returnData.data.originalOrder.items
                            : [];

                          const orderItem = orderItems?.find(
                            (oi: any) => oi.variant?.id === item.variantId
                          );

                          const variant = item.variant || orderItem?.variant;
                          const product = variant?.product || item.product;
                          const imageUrl =
                            variant?.images?.[0]?.imageUrl ||
                            product?.variants?.[0]?.images?.[0];
                          const color = variant?.color;
                          const size = variant?.size;

                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50/50"
                            >
                              <div className="relative">
                                <img
                                  src={imageUrl || "/images/white-image.png"}
                                  alt={product?.name || "Sản phẩm"}
                                  className="w-16 h-16 object-contain rounded border bg-white"
                                />
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                  {item.quantity}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-maintext truncate">
                                  {product?.name || "Sản phẩm không xác định"}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                  {color && (
                                    <span className="text-xs text-gray-500 flex items-center">
                                      Màu: <span className="font-medium text-gray-700 ml-1">{color.name}</span>
                                    </span>
                                  )}
                                  {size && (
                                    <span className="text-xs text-gray-500 flex items-center">
                                      Size: <span className="font-medium text-gray-700 ml-1">{size.value}</span>
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 flex items-center">
                                    Đơn giá: <span className="font-medium text-gray-700 ml-1">{formatPrice(item.price)}</span>
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          );
                        });
                      } catch (e) {
                        console.error("Error parsing return items:", e);
                        return <p className="text-sm text-red-500">Lỗi hiển thị danh sách sản phẩm</p>;
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Tổng tiền hoàn */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon path={mdiCash} size={0.8} className="text-primary" />
                    </div>
                    <span>Thông tin hoàn tiền</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-semibold">Tiền hàng trả:</span>
                    <span className="font-medium text-gray-700">
                      {(() => {
                        try {
                          const items = typeof returnData.data.items === 'string'
                            ? JSON.parse(returnData.data.items)
                            : returnData.data.items;
                          const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                          return formatPrice(subtotal);
                        } catch { return "0đ"; }
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold border-t pt-3">
                    <span className="text-gray-600 text-sm">Tổng tiền hoàn:</span>
                    <span className="text-primary text-xl">
                      {formatPrice(returnData.data.totalRefund)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="bg-gray-100 flex gap-2">
              {returnData.data.status === "CHO_XU_LY" && (
                <Button
                  variant="destructive"
                  onClick={handleCancelReturn}
                  disabled={cancelReturnMutation.isPending}
                >
                  {cancelReturnMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                  ) : (
                    <Icon path={mdiCancel} size={0.8} />
                  )}
                  Hủy yêu cầu
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <Icon path={mdiClose} size={0.8} />
                Đóng
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600">
              Không tìm thấy thông tin trả hàng.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReturnDetailDialog;
