import React, { useState, useEffect } from "react";
import { Icon } from "@mdi/react";
import {
  mdiPlus,
  mdiMinus,
  mdiTrashCanOutline,
  mdiKeyboardReturn,
  mdiLoading,
  mdiPackageVariant,
  mdiTextBoxOutline,
  mdiClose,
  mdiAlertCircleOutline,
} from "@mdi/js";
import { toast } from "react-toastify";
import { useReturnableOrders, useCreateReturnRequest } from "@/hooks/return";
import { ICustomerReturnRequest } from "@/interface/request/return";
import { IOrder } from "@/interface/response/order";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/utils/formatters";

interface SelectedReturnItem {
  productId?: number;
  productVariantId: number;
  quantity: number;
  maxQuantity: number;
  productName: string;
  variantLabel: string;
  price: number;
  imageUrl?: string;
}

interface CreateReturnDialogProps {
  orderId: string | null;
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateReturnDialog: React.FC<CreateReturnDialogProps> = ({
  orderId,
  order,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const createReturnMutation = useCreateReturnRequest();

  // Dùng useReturnableOrders chỉ để check eligibility
  const { data: returnableOrdersData, isLoading: isLoadingReturnable } =
    useReturnableOrders({ page: 1, limit: 100 });

  const [selectedItems, setSelectedItems] = useState<SelectedReturnItem[]>([]);
  const [reason, setReason] = useState("");

  // Reset khi dialog đóng
  useEffect(() => {
    if (!open) {
      setSelectedItems([]);
      setReason("");
    }
  }, [open]);

  // Kiểm tra order có nằm trong danh sách returnable không
  const isEligible =
    returnableOrdersData?.data?.content?.some(
      (o) => o.id.toString() === orderId
    ) ?? false;

  const handleAddItem = (item: any, index: number) => {
    const variant = item.variant;
    // Lấy product nếu có (variant.product) — không bắt buộc
    const product = variant?.product;

    if (!variant?.id) {
      console.error("[CreateReturnDialog] variant.id missing:", { item, variant });
      toast.error("Không thể xác định sản phẩm này");
      return;
    }

    const productVariantId = Number(variant.id);
    const productId = product?.id ? Number(product.id) : undefined;

    // Deduplicate by productVariantId
    const existingIndex = selectedItems.findIndex(
      (si) => si.productVariantId === productVariantId
    );

    if (existingIndex >= 0) {
      if (selectedItems[existingIndex].quantity < item.quantity) {
        const newItems = [...selectedItems];
        newItems[existingIndex].quantity += 1;
        setSelectedItems(newItems);
      } else {
        toast.warning(`Tối đa ${item.quantity} sản phẩm có thể trả`);
      }
    } else {
      const colorName = variant?.color?.name || "";
      const sizeValue = variant?.size?.value
        ? String(variant.size.value)
        : "";
      const variantLabel = [colorName, sizeValue ? `Size ${sizeValue}` : ""]
        .filter(Boolean)
        .join(" / ");
      const imageUrl = variant?.images?.[0]?.imageUrl;
      const productName =
        product?.name ||
        `Sản phẩm (Variant #${productVariantId})`;

      setSelectedItems([
        ...selectedItems,
        {
          productId,
          productVariantId,
          quantity: 1,
          maxQuantity: item.quantity,
          productName,
          variantLabel,
          price: item.price,
          imageUrl,
        },
      ]);
    }
  };

  const handleDecreaseItem = (index: number) => {
    const newItems = [...selectedItems];
    if (newItems[index].quantity > 1) {
      newItems[index].quantity -= 1;
    } else {
      newItems.splice(index, 1);
    }
    setSelectedItems(newItems);
  };

  const handleIncreaseItem = (index: number) => {
    const newItems = [...selectedItems];
    if (newItems[index].quantity < newItems[index].maxQuantity) {
      newItems[index].quantity += 1;
    } else {
      toast.warning(`Tối đa ${newItems[index].maxQuantity} sản phẩm có thể trả`);
    }
    setSelectedItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const handleSubmit = () => {
    if (!orderId || selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm muốn trả");
      return;
    }
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do trả hàng");
      return;
    }

    const payload: ICustomerReturnRequest = {
      originalOrderId: Number(orderId),
      reason: reason.trim(),
      items: selectedItems.map((item) => ({
        ...(item.productId !== undefined ? { productId: item.productId } : {}),
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      })),
    };

    createReturnMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Yêu cầu trả hàng đã được gửi thành công!");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: () => {
        toast.error("Đã xảy ra lỗi khi gửi yêu cầu trả hàng. Vui lòng thử lại.");
      },
    });
  };

  const totalRefund = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!open || !orderId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="4xl">
        {isLoadingReturnable ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-2">
                Tạo yêu cầu trả hàng
                {order && (
                  <Badge variant="outline">#{order.code}</Badge>
                )}
                {!isEligible && (
                  <Badge variant="destructive">Không đủ điều kiện</Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-4 bg-gray-100">
              {/* Cảnh báo nếu không đủ điều kiện */}
              {!isEligible && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <Icon
                    path={mdiAlertCircleOutline}
                    size={0.9}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Đơn hàng này không đủ điều kiện trả hàng
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Chỉ đơn hàng HOÀN THÀNH, đã thanh toán trong vòng 30
                      ngày mới có thể trả.
                    </p>
                  </div>
                </div>
              )}

              {/* Sản phẩm trong đơn hàng */}
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
                    <span>Chọn sản phẩm muốn trả</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!order?.items || order.items.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-sm text-gray-700">
                        Không có sản phẩm trong đơn hàng này.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Hình ảnh</TableHead>
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead className="text-right">Đơn giá</TableHead>
                          <TableHead className="text-center">
                            SL trong đơn
                          </TableHead>
                          <TableHead className="text-center w-[140px]">
                            Thao tác
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item: any, index: number) => {
                          const variant = item.variant;
                          const product = variant?.product;
                          const colorName = variant?.color?.name || "";
                          const sizeValue = variant?.size?.value
                            ? String(variant.size.value)
                            : "";
                          const variantLabel = [
                            colorName,
                            sizeValue ? `Size ${sizeValue}` : "",
                          ]
                            .filter(Boolean)
                            .join(" / ");
                          const imageUrl = variant?.images?.[0]?.imageUrl;
                          const productName =
                            product?.name ||
                            `Variant #${variant?.id || index + 1}`;

                          const itemVariantId = variant?.id
                            ? Number(variant.id)
                            : -(index + 1);
                          const alreadySelected = selectedItems.find(
                            (si) => si.productVariantId === itemVariantId
                          );
                          const selectedQty = alreadySelected?.quantity || 0;
                          const canAdd = selectedQty < item.quantity;

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <img
                                  src={imageUrl || "/images/white-image.png"}
                                  alt={productName}
                                  className="w-16 h-16 object-contain rounded-md"
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                <div>
                                  <div className="font-medium">
                                    {productName}
                                  </div>
                                  {product?.code && (
                                    <div className="text-sm text-gray-700">
                                      Mã: {product.code}
                                    </div>
                                  )}
                                  {variantLabel && (
                                    <div className="text-sm text-gray-700">
                                      {variantLabel}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPrice(parseFloat(item.price.toString()))}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddItem(item, index)}
                                  disabled={!canAdd || !isEligible}
                                  className="gap-1.5"
                                >
                                  <Icon path={mdiPlus} size={0.7} />
                                  {selectedQty > 0
                                    ? `Thêm (${selectedQty}/${item.quantity})`
                                    : "Chọn"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Sản phẩm đã chọn trả */}
              {selectedItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon
                          path={mdiKeyboardReturn}
                          size={0.8}
                          className="text-primary"
                        />
                      </div>
                      <span>Sản phẩm sẽ trả ({selectedItems.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50/50"
                        >
                          <div className="relative">
                            <img
                              src={item.imageUrl || "/images/white-image.png"}
                              alt={item.productName}
                              className="w-16 h-16 object-contain rounded border bg-white"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-maintext truncate">
                              {item.productName}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              {item.variantLabel && (
                                <span className="text-sm text-gray-700">
                                  {item.variantLabel}
                                </span>
                              )}
                              <span className="text-sm text-gray-700">
                                Đơn giá:{" "}
                                <span className="font-medium text-gray-700">
                                  {formatPrice(item.price)}
                                </span>
                              </span>
                            </div>
                          </div>
                          {/* Điều chỉnh số lượng */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDecreaseItem(index)}
                            >
                              <Icon path={mdiMinus} size={0.65} />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleIncreaseItem(index)}
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Icon path={mdiPlus} size={0.65} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 bg-red-50 border-red-500"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Icon path={mdiTrashCanOutline} size={0.65} />
                            </Button>
                          </div>
                          {/* Thành tiền */}
                          <div className="text-right flex-shrink-0 w-24">
                            <p className="font-bold text-primary">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tổng tiền hoàn dự kiến */}
                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm font-semibold">
                          Tổng tiền hoàn dự kiến:
                        </span>
                        <span className="text-primary text-lg font-bold">
                          {formatPrice(totalRefund)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lý do trả hàng */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon
                        path={mdiTextBoxOutline}
                        size={0.8}
                        className="text-primary"
                      />
                    </div>
                    <span>Lý do trả hàng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Nhập lý do bạn muốn trả hàng (ví dụ: sản phẩm bị lỗi, không đúng mô tả, không vừa size...)..."
                      rows={4}
                      className="resize-none"
                      disabled={!isEligible}
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      {reason.length}/500 ký tự
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="bg-gray-100">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createReturnMutation.isPending}
              >
                <Icon path={mdiClose} size={0.8} />
                Đóng
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  createReturnMutation.isPending ||
                  selectedItems.length === 0 ||
                  !reason.trim() ||
                  !isEligible
                }
                className="gap-2"
              >
                {createReturnMutation.isPending ? (
                  <Icon
                    path={mdiLoading}
                    size={0.8}
                    className="animate-spin"
                  />
                ) : (
                  <Icon path={mdiKeyboardReturn} size={0.8} />
                )}
                Gửi yêu cầu trả hàng
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateReturnDialog;
