import React from "react";
import { Icon } from "@mdi/react";
import {
  mdiMapMarker,
  mdiCreditCardOutline,
  mdiCashMultiple,
  mdiOrderBoolAscending,
  mdiClockOutline,
  mdiPackageVariant,
  mdiCheckCircle,
  mdiTruck,
  mdiCancel,
  mdiClose,
} from "@mdi/js";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useOrderDetail } from "@/hooks/order";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  formatPrice,
  getPaymentMethodName,
  getPaymentStatusName,
} from "@/utils/formatters";
import { OrderStatusBadge } from "../components/Badges";

interface OrderDetailDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  orderId,
  open,
  onOpenChange,
}) => {
  const { data: orderData, isLoading, isError } = useOrderDetail(orderId || "");

  const getPaymentMethodVariant = (method: string): "default" | "secondary" | "outline" | "success" | "warning" => {
    switch (method) {
      case "VNPAY":
        return "success";
      case "BANK_TRANSFER":
        return "warning";
      case "COD":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getShippingProgress = (orderStatus: string, createdAt: string) => {
    const orderDate = new Date(createdAt);

    const generateTimestamp = (hoursOffset: number) => {
      const timestamp = new Date(
        orderDate.getTime() + hoursOffset * 60 * 60 * 1000
      );
      return format(timestamp, "HH:mm dd/MM/yyyy", { locale: vi });
    };

    const baseProgress = [
      {
        time: generateTimestamp(0),
        title: "Đơn hàng được tạo",
        message:
          "GHN có thông tin chi tiết về gói hàng của bạn và đang chuẩn bị để vận chuyển",
        completed: true,
        icon: mdiClockOutline,
        color: "bg-blue-500",
      },
      {
        time: generateTimestamp(2),
        title: "Đang xử lý",
        message:
          "Kiện hàng của bạn đang được gửi đến trung tâm GHN và đang trong quá trình xử lý giao hàng",
        completed: true,
        icon: mdiPackageVariant,
        color: "bg-orange-500",
      },
    ];

    switch (orderStatus) {
      case "CHO_XAC_NHAN":
        return [
          {
            time: generateTimestamp(0),
            title: "Chờ xác nhận",
            message: "Đơn hàng đã được tạo và đang chờ xác nhận từ cửa hàng",
            completed: true,
            icon: mdiClockOutline,
            color: "bg-yellow-500",
          },
        ];

      case "CHO_GIAO_HANG":
        return [
          ...baseProgress,
          {
            time: generateTimestamp(4),
            title: "Đã xác nhận",
            message: "GHN đã xác nhận gói hàng của bạn bằng cách quét nhãn",
            completed: true,
            icon: mdiCheckCircle,
            color: "bg-green-500",
          },
          {
            time: generateTimestamp(6),
            title: "Chuẩn bị giao hàng",
            message: "Kiện hàng của bạn đã được gửi đi từ trung tâm GHN",
            completed: true,
            icon: mdiPackageVariant,
            color: "bg-blue-500",
          },
        ];

      case "DANG_VAN_CHUYEN":
        return [
          ...baseProgress,
          {
            time: generateTimestamp(4),
            title: "Đã xác nhận",
            message: "GHN đã xác nhận gói hàng của bạn bằng cách quét nhãn",
            completed: true,
            icon: mdiCheckCircle,
            color: "bg-green-500",
          },
          {
            time: generateTimestamp(6),
            title: "Đang vận chuyển",
            message: "Kiện hàng của bạn đã được gửi đi từ trung tâm GHN",
            completed: true,
            icon: mdiTruck,
            color: "bg-blue-500",
          },
          {
            time: generateTimestamp(12),
            title: "Đang phân loại",
            message:
              "Kiện hàng của bạn đang được chuyển đến trung tâm GHN để phân loại",
            completed: true,
            icon: mdiPackageVariant,
            color: "bg-orange-500",
          },
          {
            time: generateTimestamp(18),
            title: "Sẵn sàng giao hàng",
            message:
              "Kiện hàng của bạn đang ở cơ sở địa phương và sẵn sàng để giao hàng",
            completed: true,
            icon: mdiMapMarker,
            color: "bg-purple-500",
          },
        ];

      case "DA_GIAO_HANG":
      case "HOAN_THANH":
        return [
          ...baseProgress,
          {
            time: generateTimestamp(4),
            title: "Đã xác nhận",
            message: "GHN đã xác nhận gói hàng của bạn bằng cách quét nhãn",
            completed: true,
            icon: mdiCheckCircle,
            color: "bg-green-500",
          },
          {
            time: generateTimestamp(6),
            title: "Đang vận chuyển",
            message: "Kiện hàng của bạn đã được gửi đi từ trung tâm GHN",
            completed: true,
            icon: mdiTruck,
            color: "bg-blue-500",
          },
          {
            time: generateTimestamp(12),
            title: "Đang phân loại",
            message:
              "Kiện hàng của bạn đang được chuyển đến trung tâm GHN để phân loại",
            completed: true,
            icon: mdiPackageVariant,
            color: "bg-orange-500",
          },
          {
            time: generateTimestamp(18),
            title: "Sẵn sàng giao hàng",
            message:
              "Kiện hàng của bạn đang ở cơ sở địa phương và sẵn sàng để giao hàng",
            completed: true,
            icon: mdiMapMarker,
            color: "bg-purple-500",
          },
          {
            time: generateTimestamp(24),
            title: "Đang giao hàng",
            message:
              "Kiện hàng của bạn đang được vận chuyển bằng xe GHN và sẽ được giao trong ngày hôm nay",
            completed: true,
            icon: mdiTruck,
            color: "bg-indigo-500",
          },
          {
            time: generateTimestamp(26),
            title: "Đã đến khu vực",
            message:
              "Kiện hàng của bạn đã đến cơ sở GHN tại khu vực của người nhận",
            completed: true,
            icon: mdiMapMarker,
            color: "bg-teal-500",
          },
          {
            time: generateTimestamp(28),
            title: "Giao hàng thành công",
            message: "Giao hàng thành công. Cảm ơn bạn đã sử dụng dịch vụ!",
            completed: true,
            icon: mdiCheckCircle,
            color: "bg-emerald-500",
          },
        ];

      case "DA_HUY":
        return [
          {
            time: generateTimestamp(0),
            title: "Đơn hàng được tạo",
            message: "Đơn hàng đã được tạo",
            completed: true,
            icon: mdiClockOutline,
            color: "bg-blue-500",
          },
          {
            time: generateTimestamp(2),
            title: "Đơn hàng đã hủy",
            message: "Đơn hàng đã bị hủy theo yêu cầu",
            completed: true,
            icon: mdiCancel,
            color: "bg-red-500",
          },
        ];

      default:
        return baseProgress;
    }
  };

  if (!open || !orderId) return null;

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
              Đã xảy ra lỗi khi tải thông tin đơn hàng.
            </p>
          </div>
        ) : orderData && orderData.data ? (
          <>
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center gap-2">
                Chi tiết đơn hàng #{(orderData.data as any)?.code}
                <OrderStatusBadge status={orderData.data.orderStatus} />
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-4 bg-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thông tin giao hàng */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon path={mdiMapMarker} size={0.8} className="text-primary" />
                      </div>
                      <span>Địa chỉ giao hàng</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 w-32 font-semibold">
                        Người nhận:
                      </span>
                      <span className="font-medium">
                        {(orderData.data as any).shippingName ||
                          orderData.data.customer?.fullName ||
                          "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 w-32 font-semibold">
                        Số điện thoại:
                      </span>
                      <span>
                        {(orderData.data as any).shippingPhoneNumber ||
                          orderData.data.customer?.phoneNumber ||
                          "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 w-32 font-semibold">
                        Địa chỉ:
                      </span>
                      <span className="text-end">
                        {(orderData.data as any).shippingSpecificAddress ||
                          "Chưa cập nhật địa chỉ giao hàng"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                {/* Thông tin thanh toán */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon
                          path={mdiCreditCardOutline}
                          size={0.8}
                          className="text-primary"
                        />
                      </div>
                      <span>Thông tin thanh toán</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 w-32 font-semibold">
                        Phương thức:
                      </span>
                      <div className="flex items-center">
                        <Badge
                          variant={getPaymentMethodVariant(orderData.data.paymentMethod)}
                          icon={
                            orderData.data.paymentMethod === "COD"
                              ? mdiCashMultiple
                              : mdiCreditCardOutline
                          }
                        >
                          {getPaymentMethodName(orderData.data.paymentMethod)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 w-32 font-semibold">
                        Trạng thái:
                      </span>
                      <span>
                        <Badge
                          variant={
                            orderData.data.paymentStatus === "PAID"
                              ? "success"
                              : "warning"
                          }
                        >
                          {getPaymentStatusName(orderData.data.paymentStatus)}
                        </Badge>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Thông tin đơn hàng */}
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
                    <span>Chi tiết đơn hàng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Hình ảnh</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderData.data.items.map((item, index) => {
                        const variant = (item as any).variant;
                        const product = variant?.product;
                        const imageUrl = variant?.images?.[0]?.imageUrl;
                        const color = variant?.color;
                        const size = variant?.size;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <img
                                src={imageUrl || "/images/white-image.png"}
                                alt={product?.name || ""}
                                className="w-16 h-16 object-contain rounded-md"
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">
                                  {product?.name || "Sản phẩm không xác định"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Mã: {product?.code || "N/A"}
                                </div>
                                {product?.brand && (
                                  <div className="text-sm text-gray-600">
                                    Thương hiệu: {product.brand.name}
                                  </div>
                                )}
                                {color && (
                                  <div className="text-sm text-gray-600">
                                    Màu: {color.name}
                                  </div>
                                )}
                                {size && (
                                  <div className="text-sm text-gray-600">
                                    Size: {size.value}
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
                            <TableCell className="text-right font-medium">
                              {formatPrice(
                                parseFloat(item.price.toString()) *
                                item.quantity
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <div className="mt-6 space-y-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-semibold text-sm">Tạm tính:</span>
                      <span>
                        {formatPrice(
                          parseFloat(orderData.data.subTotal.toString())
                        )}
                      </span>
                    </div>
                    {parseFloat(orderData.data.discount.toString()) > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-semibold text-sm">Giảm giá:</span>
                        <span>
                          -
                          {formatPrice(
                            parseFloat(orderData.data.discount.toString())
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-semibold text-sm">
                        Phí vận chuyển:
                      </span>
                      <span>
                        {formatPrice(
                          parseFloat(orderData.data.total.toString()) -
                          parseFloat(orderData.data.subTotal.toString()) +
                          parseFloat(orderData.data.discount.toString()) || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-base font-semibold border-t pt-3">
                      <span className="text-gray-600 text-sm">Tổng tiền:</span>
                      <span className="text-primary">
                        {formatPrice(
                          parseFloat(orderData.data.total.toString())
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tiến trình đơn hàng */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon
                        path={mdiTruck}
                        size={0.8}
                        className="text-primary"
                      />
                    </div>
                    <span>Tiến trình đơn hàng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="relative">
                    {getShippingProgress(
                      orderData.data.orderStatus,
                      orderData.data.createdAt
                    ).map((step, index, array) => (
                      <div
                        key={index}
                        className="relative flex items-start pb-8 last:pb-0"
                      >
                        {/* Timeline line */}
                        {index < array.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-gray-300 to-gray-200"></div>
                        )}

                        {/* Icon container */}
                        <div className="relative flex-shrink-0 mr-4">
                          <div
                            className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center shadow-lg ring-4 ring-white`}
                          >
                            <Icon
                              path={step.icon}
                              size={0.8}
                              className="text-white"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 bg-white rounded-md border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-maintext">
                              {step.title}
                            </h4>
                            <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-sm text-maintext leading-relaxed">
                            {step.message}
                          </p>
                          {step.completed && (
                            <div className="mt-3 flex items-center text-sm text-green-600">
                              <Icon
                                path={mdiCheckCircle}
                                size={0.8}
                                className="mr-1"
                              />
                              Hoàn thành
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="bg-gray-100">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <Icon path={mdiClose} size={0.8} />
                Đóng
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600">
              Không tìm thấy thông tin đơn hàng.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
