import React, { useState } from "react";
import { Icon } from "@mdi/react";
import { mdiPlus, mdiMinus, mdiDelete, mdiKeyboardReturn } from "@mdi/js";
import { toast } from "react-toastify";
import { useUser } from "@/context/useUserContext";
import { useOrdersByUser } from "@/hooks/order";
import { useReturnableOrders, useCreateReturnRequest } from "@/hooks/return";
import { ICustomerReturnRequest } from "@/interface/request/return";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/utils/formatters";

interface CreateReturnDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateReturnDialog: React.FC<CreateReturnDialogProps> = ({
  orderId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const createReturnMutation = useCreateReturnRequest();
  const { data: returnableOrdersData } = useReturnableOrders();
  const { profile } = useUser();
  const userId = profile?.data?.id;
  const { data: ordersData } = useOrdersByUser(userId || "");

  const [selectedItems, setSelectedItems] = useState<
    Array<{
      product: string;
      variant: { colorId: string; sizeId: string };
      quantity: number;
      maxQuantity: number;
      productName: string;
      price: number;
    }>
  >([]);
  const [reason, setReason] = useState("");

  const returnableOrder = returnableOrdersData?.data?.orders?.find(
    (o) => o.id === orderId
  );
  const displayOrder = ordersData?.data?.orders?.find((o) => o.id === orderId);
  const order = displayOrder || returnableOrder;

  const handleAddItem = (item: any) => {
    const variant = item.variant;
    const product = variant?.product;

    if (!product || !variant) {
      toast.error("Không thể xác định thông tin sản phẩm");
      return;
    }

    const existingIndex = selectedItems.findIndex(
      (si) =>
        si.product === product.id &&
        si.variant.colorId === variant.colorId &&
        si.variant.sizeId === variant.sizeId
    );

    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      if (newItems[existingIndex].quantity < item.quantity) {
        newItems[existingIndex].quantity += 1;
        setSelectedItems(newItems);
      }
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          product: product.id,
          variant: {
            colorId: variant.colorId,
            sizeId: variant.sizeId,
          },
          quantity: 1,
          maxQuantity: item.quantity,
          productName: product.name,
          price: item.price,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems];
    if (newItems[index].quantity > 1) {
      newItems[index].quantity -= 1;
    } else {
      newItems.splice(index, 1);
    }
    setSelectedItems(newItems);
  };

  const handleSubmit = () => {
    if (!orderId || selectedItems.length === 0 || !reason.trim()) {
      toast.error("Vui lòng chọn sản phẩm và nhập lý do trả hàng");
      return;
    }

    const payload: ICustomerReturnRequest = {
      originalOrder: orderId,
      items: selectedItems.map((item) => ({
        product: item.product,
        variant: item.variant,
        quantity: item.quantity,
      })),
      reason: reason.trim(),
    };

    createReturnMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Yêu cầu trả hàng đã được gửi thành công");
        setSelectedItems([]);
        setReason("");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error("Đã xảy ra lỗi khi tạo yêu cầu trả hàng");
      },
    });
  };

  if (!open || !orderId || !order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu trả hàng - Đơn #{order.code}</DialogTitle>
          <DialogDescription>
            Chọn sản phẩm bạn muốn trả và nhập lý do trả hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Sản phẩm trong đơn hàng:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {order.items.map((item, index) => {
                const variant = (item as any).variant;
                const product = variant?.product;
                const imageUrl = variant?.images?.[0]?.imageUrl;
                const color = variant?.color;
                const size = variant?.size;

                if (!product) {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src="/images/white-image.png"
                          alt="Sản phẩm không xác định"
                          className="w-12 h-12 object-contain rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-600">
                            Sản phẩm không xác định
                          </p>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.quantity} | Giá:{" "}
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="gap-2"
                      >
                        Không thể trả
                      </Button>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={imageUrl || "/images/white-image.png"}
                        alt={product?.name || "Sản phẩm"}
                        className="w-12 h-12 object-contain rounded"
                      />
                      <div>
                        <p className="font-medium">
                          {product?.name || "Sản phẩm không xác định"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity} | Giá:{" "}
                          {formatPrice(item.price)}
                        </p>
                        {product?.code && (
                          <p className="text-sm text-gray-600">
                            Mã: {product.code}
                          </p>
                        )}
                        {color && (
                          <p className="text-sm text-gray-600">
                            Màu: {color.name}
                          </p>
                        )}
                        {size && (
                          <p className="text-sm text-gray-600">
                            Size: {size.value}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddItem(item)}
                      className="gap-2"
                    >
                      <Icon path={mdiPlus} size={0.8} />
                      Thêm
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sản phẩm đã chọn trả */}
          {selectedItems.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Sản phẩm trả hàng:</h4>
              <div className="space-y-2">
                {selectedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-md"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity} | Giá:{" "}
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="gap-1"
                      >
                        <Icon path={mdiMinus} size={0.8} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItems = [...selectedItems];
                          newItems.splice(index, 1);
                          setSelectedItems(newItems);
                        }}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Icon path={mdiDelete} size={0.8} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lý do trả hàng */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Lý do trả hàng *
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do bạn muốn trả hàng..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              createReturnMutation.isPending ||
              selectedItems.length === 0 ||
              !reason.trim()
            }
            className="gap-2"
          >
            {createReturnMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
            ) : (
              <Icon path={mdiKeyboardReturn} size={0.8} />
            )}
            Gửi yêu cầu trả hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReturnDialog;
