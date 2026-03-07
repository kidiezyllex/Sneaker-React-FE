import React from "react";
import { Icon } from "@mdi/react";
import {
  mdiCancel,
  mdiCash,
  mdiOrderBoolAscending,
  mdiPackageVariant,
  mdiClose,
} from "@mdi/js";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";
import { useMyReturnDetail, useCancelMyReturn } from "@/hooks/return";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatters";
import { ReturnStatusBadge } from "../components/Badges";

interface ReturnDetailDialogProps {
  returnId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void;
}

// Parse items JSON string → mảng
const parseReturnItems = (items: any): any[] => {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const findOrderItemFromOrder = (orderItems: any[], variantId: number | string): any | null => {
  if (!orderItems || !variantId) return null;
  return orderItems.find(
    (oi: any) => String(oi.variant?.id) === String(variantId)
  );
};

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
      onError: () => {
        toast.error("Đã xảy ra lỗi khi hủy yêu cầu");
      },
    });
  };

  if (!returnId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="4xl">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary/50"></div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-red-500">Đã xảy ra lỗi khi tải thông tin trả hàng.</p>
          </div>
        ) : returnData && returnData.data ? (
          (() => {
            const ret = returnData.data;
            const originalOrder =
              typeof ret.originalOrder === "object"
                ? ret.originalOrder
                : null;
            const orderItems: any[] = originalOrder?.items || [];
            const returnItems = parseReturnItems(ret.items);

            return (
              <>
                <DialogHeader className="border-b pb-4">
                  <DialogTitle className="flex items-center gap-2">
                    Chi tiết trả hàng #{ret.code}
                    <ReturnStatusBadge status={ret.status} />
                  </DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-4 bg-gray-100">
                  {/* Grid: Thông tin đơn gốc + Lý do & Ghi chú */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Thông tin đơn gốc */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon
                              path={mdiOrderBoolAscending}
                              size={0.8}
                              className="text-primary"
                            />
                          </div>
                          <span>Thông tin đơn gốc</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Mã đơn hàng:</span>
                          <span className="font-medium">
                            {originalOrder?.code || (ret.originalOrder as any)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Ngày tạo đơn:</span>
                          <span className="font-medium">
                            {originalOrder?.createdAt
                              ? format(
                                new Date(originalOrder.createdAt),
                                "dd/MM/yyyy HH:mm",
                                { locale: vi }
                              )
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-semibold">Ngày yêu cầu:</span>
                          <span className="font-medium">
                            {format(
                              new Date(ret.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )}
                          </span>
                        </div>
                        {ret.staff && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-semibold">
                              Nhân viên xử lý:
                            </span>
                            <span className="font-medium">
                              {ret.staff.fullName}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Lý do & Ghi chú */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon
                              path={mdiPackageVariant}
                              size={0.8}
                              className="text-primary"
                            />
                          </div>
                          <span>Lý do & Ghi chú</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-gray-700 font-semibold shrink-0">
                            Lý do trả:
                          </span>
                          <span className="text-right italic text-gray-700">
                            {ret.reason || "—"}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-gray-700 font-semibold shrink-0 w-16">
                            Ghi chú:
                          </span>
                          <span className="text-right italic text-gray-700">
                            {ret.note || "Không có ghi chú"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sản phẩm trả hàng */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon
                            path={mdiPackageVariant}
                            size={0.8}
                            className="text-primary"
                          />
                        </div>
                        <span>Sản phẩm trả hàng</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {returnItems.length === 0 ? (
                        <p className="text-sm text-gray-700 text-center py-4">
                          Không có dữ liệu sản phẩm.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Hình ảnh</TableHead>
                              <TableHead>Phân loại</TableHead>
                              <TableHead className="text-center">Số lượng</TableHead>
                              <TableHead className="text-right">Đơn giá</TableHead>
                              <TableHead className="text-right">Thành tiền</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {returnItems.map((ri: any, index: number) => {
                              // Lấy variantId từ items: ưu tiên variantId, rồi productVariantId
                              const variantId = ri.variantId ?? ri.productVariantId;
                              const orderItem = findOrderItemFromOrder(orderItems, variantId);
                              const variant = orderItem?.variant;

                              const imageUrl = variant?.images?.[0]?.imageUrl;
                              const colorName = variant?.color?.name || "";
                              const sizeValue = variant?.size?.value;
                              const variantLabel = [
                                colorName,
                                sizeValue ? `Size ${sizeValue}` : "",
                              ]
                                .filter(Boolean)
                                .join(" / ");

                              const qty = ri.quantity || 0;
                              const price = orderItem?.price || 0;

                              return (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div className="relative w-fit">
                                      <img
                                        src={
                                          imageUrl || "/images/white-image.png"
                                        }
                                        alt={`Sản phẩm ${index + 1}`}
                                        className="w-16 h-16 object-contain rounded border bg-white"
                                      />
                                      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                        {qty}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {variantLabel ? (
                                      <div>
                                        {colorName && (
                                          <div className="text-sm text-gray-700">
                                            Màu:{" "}
                                            <span className="font-medium">
                                              {colorName}
                                            </span>
                                          </div>
                                        )}
                                        {sizeValue && (
                                          <div className="text-sm text-gray-700">
                                            Size:{" "}
                                            <span className="font-medium">
                                              {sizeValue}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400 italic">
                                        Variant #{variantId ?? "N/A"}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center font-semibold">
                                    {qty}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatPrice(price)}
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-primary">
                                    {formatPrice(price * qty)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>

                  {/* Thông tin hoàn tiền */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon
                            path={mdiCash}
                            size={0.8}
                            className="text-primary"
                          />
                        </div>
                        <span>Thông tin hoàn tiền</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">
                          Tiền hàng trả:
                        </span>
                        <span className="font-medium text-gray-700">
                          {formatPrice(
                            returnItems.reduce((sum: number, ri: any) => {
                              const oi = findOrderItemFromOrder(
                                orderItems,
                                ri.variantId ?? ri.productVariantId
                              );
                              return sum + (oi?.price || 0) * (ri.quantity || 0);
                            }, 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center font-bold border-t pt-3">
                        <span className="text-gray-700 text-sm">
                          Tổng tiền hoàn:
                        </span>
                        <span className="text-primary text-xl">
                          {formatPrice(ret.totalRefund)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter className="bg-gray-100 flex">
                  {ret.status === "CHO_XU_LY" && (
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
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    <Icon path={mdiClose} size={0.8} />
                    Đóng
                  </Button>
                </DialogFooter>
              </>
            );
          })()
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-700">Không tìm thấy thông tin trả hàng.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReturnDetailDialog;
