"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getOrdersByUser } from "@/api/order";
import { IOrder } from "@/interface/response/order";

type OrderStatus =
  | "CHO_XAC_NHAN"
  | "CHO_GIAO_HANG"
  | "DANG_VAN_CHUYEN"
  | "DA_GIAO_HANG"
  | "HOAN_THANH"
  | "DA_HUY";

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user?.id) {
          navigate("/login");
          return;
        }

        const response = await getOrdersByUser(user.id.toString());

        if (response.statusCode === 200) {
          setOrders(response.data.orders);
        } else {
          throw new Error(
            response.message || "Không thể tải danh sách đơn hàng"
          );
        }
      } catch (error: any) {
        showToast({
          title: "Lỗi",
          message: error.message || "Đã có lỗi xảy ra khi tải đơn hàng",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate, showToast]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "CHO_XAC_NHAN":
        return "bg-yellow-500";
      case "CHO_GIAO_HANG":
        return "bg-blue-400";
      case "DANG_VAN_CHUYEN":
        return "bg-blue-500";
      case "DA_GIAO_HANG":
        return "bg-green-400";
      case "HOAN_THANH":
        return "bg-green-500";
      case "DA_HUY":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "CHO_XAC_NHAN":
        return "Chờ xác nhận";
      case "CHO_GIAO_HANG":
        return "Chờ giao hàng";
      case "DANG_VAN_CHUYEN":
        return "Đang vận chuyển";
      case "DA_GIAO_HANG":
        return "Đã giao hàng";
      case "HOAN_THANH":
        return "Hoàn thành";
      case "DA_HUY":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8 flex items-center justify-center">
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-2xl font-semibold mb-4">Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Bạn chưa có đơn hàng nào
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Đơn hàng #{order.code}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`${getStatusColor(
                      order.orderStatus
                    )} text-white`}
                  >
                    {getStatusText(order.orderStatus)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Thông tin giao hàng</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingName}
                        <br />
                        {order.shippingPhoneNumber}
                        <br />
                        {order.shippingSpecificAddress}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Chi tiết thanh toán</h3>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Phương thức:</span>
                          <span>
                            {order.paymentMethod === "COD"
                              ? "Thanh toán khi nhận hàng"
                              : order.paymentMethod === "CASH"
                              ? "Tiền mặt"
                              : order.paymentMethod === "BANK_TRANSFER"
                              ? "Chuyển khoản"
                              : "Hỗn hợp"}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Tạm tính:</span>
                          <span>{formatPrice(order.subTotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between mt-1 text-red-500">
                            <span>Giảm giá:</span>
                            <span>-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium mt-2">
                          <span>Tổng tiền:</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Sản phẩm</h3>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded relative overflow-hidden">
                            <img
                              src={
                                item.variant.images[0]?.imageUrl ||
                                "/placeholder.png"
                              }
                              alt={`Size ${item.variant.size.value} - ${item.variant.color.name}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">
                              Size {item.variant.size.value} -{" "}
                              {item.variant.color.name}
                            </h4>
                            <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                              <span>x{item.quantity}</span>
                              <span>{formatPrice(item.price)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
