import React from "react";
import { Icon } from "@mdi/react";
import { mdiCancel, mdiEye } from "@mdi/js";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";
import { useMyReturnDetail, useCancelMyReturn } from "@/hooks/return";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatters";
import { ReturnStatusBadge } from "../components/Badges";

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
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
            <DialogHeader>
              <DialogTitle>
                Chi tiết trả hàng #{returnData.data.code}
              </DialogTitle>
              <DialogDescription>
                Ngày tạo:{" "}
                {format(
                  new Date(returnData.data.createdAt),
                  "dd/MM/yyyy HH:mm",
                  { locale: vi }
                )}
              </DialogDescription>
              <div className="mt-2">
                <ReturnStatusBadge status={returnData.data.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Thông tin đơn hàng gốc */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Thông tin đơn hàng gốc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Mã đơn hàng:{" "}
                    <span className="font-medium">
                      {typeof returnData.data.originalOrder === "string"
                        ? returnData.data.originalOrder
                        : returnData.data.originalOrder.code}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Sản phẩm trả hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {returnData.data.items.map((item: any, index: number) => {
                      const variant = item.variant;
                      const product = variant?.product || item.product;
                      const imageUrl =
                        variant?.images?.[0]?.imageUrl ||
                        product?.variants?.[0]?.images?.[0];
                      const color = variant?.color;
                      const size = variant?.size;

                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          <img
                            src={imageUrl || "/images/white-image.png"}
                            alt={product?.name || "Sản phẩm"}
                            className="w-12 h-12 object-contain rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">
                              {product?.name || "Sản phẩm không xác định"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Số lượng: {item.quantity} | Giá:{" "}
                              {formatPrice(item.price)}
                            </p>
                            {product?.code && (
                              <p className="text-sm text-muted-foreground">
                                Mã: {product.code}
                              </p>
                            )}
                            {color && (
                              <p className="text-sm text-muted-foreground">
                                Màu: {color.name}
                              </p>
                            )}
                            {size && (
                              <p className="text-sm text-muted-foreground">
                                Size: {size.value}
                              </p>
                            )}
                            {item.reason && (
                              <p className="text-sm text-muted-foreground">
                                Lý do: {item.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Tổng tiền hoàn */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Thông tin hoàn tiền
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Tổng tiền hoàn:</span>
                    <span className="text-primary">
                      {formatPrice(returnData.data.totalRefund)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              {returnData.data.status === "CHO_XU_LY" && (
                <Button
                  variant="destructive"
                  onClick={handleCancelReturn}
                  disabled={cancelReturnMutation.isPending}
                  className="gap-2"
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
                Đóng
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy thông tin trả hàng.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReturnDetailDialog;
