import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@mdi/react";
import { mdiOrderBoolAscending, mdiEye, mdiKeyboardReturn } from "@mdi/js";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useUser } from "@/context/useUserContext";
import { useOrdersByUser } from "@/hooks/order";
import { useReturnableOrders } from "@/hooks/return";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  formatPrice,
  getPaymentMethodName,
  getPaymentStatusName,
} from "@/utils/formatters";
import { IOrder } from "@/interface/response/order";
import { OrderStatusBadge } from "../components/Badges";
import OrderDetailDialog from "./OrderDetailDialog";
import CreateReturnDialog from "../ReturnsTab/CreateReturnDialog";

const OrdersTab = () => {
  const { profile } = useUser();
  const userId = profile?.data?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const {
    data: ordersData,
    isLoading,
    isError,
    refetch,
  } = useOrdersByUser(`${userId || ""}`);
  const { refetch: refetchReturnableOrders } = useReturnableOrders();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [createReturnOrderId, setCreateReturnOrderId] = useState<string | null>(
    null
  );
  const [createReturnOpen, setCreateReturnOpen] = useState(false);

  const getPaymentStatusVariant = (status: string): "success" | "warning" | "secondary" => {
    switch (status) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      default:
        return "secondary";
    }
  };

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

  const isOrderReturnable = (order: IOrder): boolean => {
    const returnableStatuses = ["DA_GIAO_HANG", "HOAN_THANH"];
    if (!returnableStatuses.includes(order.orderStatus)) return false;
    if (order.paymentStatus !== "PAID") return false;

    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysSinceOrder = Math.floor(
      (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceOrder <= 7;
  };

  const handleViewOrderDetails = (orderId: string | number) => {
    setSelectedOrderId(orderId.toString());
    setOrderDetailOpen(true);
  };

  const handleCreateReturn = (orderId: string | number) => {
    setCreateReturnOrderId(orderId.toString());
    setCreateReturnOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get orders array
  const orders = ordersData?.data?.orders || [];

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  return (
    <>
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
            <span>Đơn hàng đã đặt</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[...Array(9)].map((_, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-4 w-16" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(9)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-10 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-red-500">
                Đã xảy ra lỗi khi tải đơn hàng. Vui lòng thử lại sau.
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-600 mb-4">
                Bạn chưa có đơn hàng nào.
              </p>
              <Button variant="outline" asChild>
                <Link to="/products">Mua sắm ngay</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px] px-3 py-2 whitespace-nowrap text-center">
                      STT
                    </TableHead>
                    <TableHead className="w-[120px] px-3 py-2 whitespace-nowrap">
                      Mã đơn hàng
                    </TableHead>
                    <TableHead className="w-[180px] px-3 py-2 whitespace-nowrap">
                      Ngày đặt
                    </TableHead>
                    <TableHead className="w-[200px] px-3 py-2 whitespace-nowrap">
                      Sản phẩm
                    </TableHead>
                    <TableHead className="w-[120px] text-right px-3 py-2 whitespace-nowrap">
                      Tổng tiền
                    </TableHead>
                    <TableHead className="w-[140px] px-3 py-2 whitespace-nowrap">
                      Trạng thái đơn hàng
                    </TableHead>
                    <TableHead className="w-[180px] px-3 py-2 whitespace-nowrap">
                      Phương thức thanh toán
                    </TableHead>
                    <TableHead className="w-[140px] px-3 py-2 whitespace-nowrap">
                      Trạng thái thanh toán
                    </TableHead>
                    <TableHead className="text-center px-3 py-2 whitespace-nowrap w-fit">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrders.map((order: IOrder, index: number) => {
                    const globalIndex = startIndex + index;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="px-3 py-2 whitespace-nowrap text-center text-maintext font-semibold">
                          {globalIndex + 1}
                        </TableCell>
                        <TableCell className="font-medium px-3 py-2 whitespace-nowrap text-maintext">
                          {order.code}
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap text-maintext">
                          {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <div className="flex gap-1 flex-wrap">
                            {order.items.slice(0, 3).map((item, index) => {
                              const variant = (item as any).variant;
                              const product = variant?.product;
                              const imageUrl = variant?.images?.[0]?.imageUrl;

                              return (
                                <div key={index} className="relative">
                                  <img
                                    src={imageUrl || "/images/white-image.png"}
                                    alt={product?.name || "Sản phẩm"}
                                    className="w-12 h-12 object-contain rounded border"
                                    title={
                                      product?.name || "Sản phẩm không xác định"
                                    }
                                  />
                                  <span className="absolute -top-1 -right-1 bg-primary text-white text-sm rounded-full w-5 h-5 flex items-center justify-center">
                                    {item.quantity}
                                  </span>
                                </div>
                              );
                            })}
                            {order.items.length > 3 && (
                              <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center text-sm text-gray-600">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium px-3 py-2 whitespace-nowrap text-maintext">
                          {formatPrice(parseFloat(order.total.toString()))}
                        </TableCell>
                        <TableCell className="px-3 py-2 ">
                          <OrderStatusBadge status={order.orderStatus} />
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap text-maintext">
                          <Badge variant={getPaymentMethodVariant(order.paymentMethod)}>
                            {getPaymentMethodName(order.paymentMethod)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <Badge
                            variant={getPaymentStatusVariant(order.paymentStatus)}
                            showIcon={true}
                          >
                            {getPaymentStatusName(order.paymentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center px-3 py-2">
                          <div className="flex items-center justify-start space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewOrderDetails(order.id)}
                              title="Xem chi tiết"
                            >
                              <Icon path={mdiEye} size={0.8} />
                            </Button>
                            {isOrderReturnable(order) && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleCreateReturn(order.id)}
                                title="Yêu cầu trả hàng"
                              >
                                <Icon path={mdiKeyboardReturn} size={0.8} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết đơn hàng */}
      <OrderDetailDialog
        orderId={selectedOrderId}
        open={orderDetailOpen}
        onOpenChange={setOrderDetailOpen}
      />

      {/* Dialog tạo yêu cầu trả hàng */}
      <CreateReturnDialog
        orderId={createReturnOrderId}
        open={createReturnOpen}
        onOpenChange={setCreateReturnOpen}
        onSuccess={() => {
          refetch();
          refetchReturnableOrders();
        }}
      />
    </>
  );
};

export default OrdersTab;
