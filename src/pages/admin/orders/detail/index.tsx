"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import {
    mdiPrinter,
    mdiPencil,
    mdiArrowLeft,
    mdiFileDocument,
    mdiDelete,
    mdiFileSign,
    mdiPackageVariantClosedPlus,
    mdiTruckDeliveryOutline,
    mdiMapMarkerCheckOutline,
    mdiCheckDecagramOutline,
    mdiAccount,
    mdiAccountBadgeOutline,
    mdiMapMarker,
    mdiPackageVariant,
    mdiCash,
    mdiInformation,
    mdiAlertCircleOutline,
} from "@mdi/js";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
} from "@/components/ui/dialog";
import { UpdateStatusDialog } from "../components/UpdateStatusDialog";
import { ConfirmCancelDialog } from "../components/ConfirmCancelDialog";
import { OrderInvoiceDialog } from "../components/OrderInvoiceDialog";
import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from "../components/OrderBadges";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    useOrderDetail,
    useUpdateOrderStatus,
    useCancelOrder,
} from "@/hooks/order";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { checkImageUrl } from "@/lib/utils";

interface OrderStep {
    status: string;
    label: string;
    icon: string; // MDI path
    colors: {
        bgClass: string;
        textClass: string;
        borderClass: string;
        progressFillClass: string;
    };
}

const orderSteps: OrderStep[] = [
    {
        status: "CHO_XAC_NHAN",
        label: "Chờ xác nhận",
        icon: mdiFileSign,
        colors: {
            bgClass: "bg-amber-100 dark:bg-amber-800/30",
            textClass: "text-amber-600 dark:text-amber-400",
            borderClass: "border-amber-500 dark:border-amber-500",
            progressFillClass: "bg-amber-500",
        },
    },
    {
        status: "CHO_GIAO_HANG",
        label: "Chờ lấy hàng",
        icon: mdiPackageVariantClosedPlus,
        colors: {
            bgClass: "bg-blue-100 dark:bg-blue-800/30",
            textClass: "text-blue-600 dark:text-blue-400",
            borderClass: "border-blue-500 dark:border-blue-500",
            progressFillClass: "bg-blue-500",
        },
    },
    {
        status: "DANG_VAN_CHUYEN",
        label: "Đang giao hàng",
        icon: mdiTruckDeliveryOutline,
        colors: {
            bgClass: "bg-orange-100 dark:bg-orange-800/30",
            textClass: "text-orange-600 dark:text-orange-400",
            borderClass: "border-orange-500 dark:border-orange-500",
            progressFillClass: "bg-orange-500",
        },
    },
    {
        status: "DA_GIAO_HANG",
        label: "Đã giao hàng",
        icon: mdiMapMarkerCheckOutline,
        colors: {
            bgClass: "bg-teal-100 dark:bg-teal-800/30",
            textClass: "text-teal-600 dark:text-teal-400",
            borderClass: "border-teal-500 dark:border-teal-500",
            progressFillClass: "bg-teal-500",
        },
    },
    {
        status: "HOAN_THANH",
        label: "Hoàn thành",
        icon: mdiCheckDecagramOutline,
        colors: {
            bgClass: "bg-green-100 dark:bg-green-800/30",
            textClass: "text-primary dark:text-green-400",
            borderClass: "border-green-500 dark:border-green-500",
            progressFillClass: "bg-green-500",
        },
    },
];

const OrderStepper = ({ currentStatus }: { currentStatus: string }) => {
    const getCurrentStep = () => {
        const index = orderSteps.findIndex((step) => step.status === currentStatus);
        if (index === -1 && currentStatus === "DA_HUY") return -1;
        if (index === -1) return 0;
        return index;
    };
    const currentStepIdx = getCurrentStep();
    return (
        <Card className="mb-4 overflow-hidden">
            <CardContent>
                <div className="flex justify-between items-start relative">
                    {orderSteps.map((step, index) => {
                        const isCompleted = index < currentStepIdx;
                        const isCurrent = index === currentStepIdx;
                        const isActive = index <= currentStepIdx;

                        let circleClasses =
                            "bg-gray-100 dark:bg-gray-700 text-maintext dark:text-maintext border-gray-300 dark:border-gray-600";
                        let iconToShow;
                        let labelClasses = "text-maintext dark:text-maintext font-medium";

                        if (isActive) {
                            circleClasses = `${step.colors.bgClass} ${step.colors.textClass} ${step.colors.borderClass} border-2 shadow-sm`;
                            labelClasses = `${step.colors.textClass} font-semibold`;
                            if (isCompleted) {
                                iconToShow = (
                                    <CheckCircle size={28} className={step.colors.textClass} />
                                );
                            } else {
                                iconToShow = (
                                    <Icon
                                        path={step.icon}
                                        size={1}
                                        className={step.colors.textClass}
                                    />
                                );
                            }
                        } else {
                            iconToShow = (
                                <Icon
                                    path={step.icon}
                                    size={1}
                                    className="text-maintext/50 dark:text-maintext"
                                />
                            );
                        }

                        return (
                            <div
                                key={step.status}
                                className="flex flex-col items-center z-10 flex-1 min-w-0 px-1"
                            >
                                <motion.div
                                    className={`flex h-14 w-14 items-center justify-center rounded-full ${circleClasses}`}
                                    initial={false}
                                    animate={{ scale: isCurrent ? 1.15 : 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    {iconToShow}
                                </motion.div>
                                <div
                                    className={`mt-2.5 text-xs sm:text-sm text-center text-nowrap ${labelClasses} w-full sm:w-24 break-words leading-tight`}
                                >
                                    {step.label}
                                </div>
                            </div>
                        );
                    })}
                    {/* Progress lines container */}
                    <div className="absolute top-7 left-0 right-0 flex items-center -z-0 px-4 sm:px-8 md:px-12">
                        {orderSteps.map((step, index) => {
                            if (index === orderSteps.length - 1) return null;
                            const lineProgressClass =
                                index < currentStepIdx
                                    ? orderSteps[index].colors.progressFillClass
                                    : "bg-gray-300 dark:bg-gray-600";
                            return (
                                <div
                                    key={`line-${index}`}
                                    className={`h-1 flex-1 ${lineProgressClass}`}
                                    style={{ margin: "0 2px" }}
                                />
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export default function OrderDetailPage() {
    const params = useParams();
    const navigate = useNavigate();
    const { orderId } = params;
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isConfirmCancelDialogOpen, setIsConfirmCancelDialogOpen] =
        useState(false);
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
    const {
        data: orderDetail,
        isLoading,
        isError,
    } = useOrderDetail(orderId as string);
    const updateOrderStatus = useUpdateOrderStatus();
    const cancelOrder = useCancelOrder();
    const queryClient = useQueryClient();

    const handleStatusUpdate = async (status: string, paymentStatus?: string) => {
        // Validation: Check if trying to complete order with pending payment
        if (
            status === "HOAN_THANH" &&
            paymentStatus === "PENDING"
        ) {
            toast.error("Không thể hoàn thành đơn hàng khi chưa thanh toán");
            return;
        }

        try {
            const payload: any = { status };
            if (paymentStatus) {
                payload.paymentStatus = paymentStatus;
            }

            await updateOrderStatus.mutateAsync(
                {
                    orderId: orderId as string,
                    payload,
                },
                {
                    onSuccess: () => {
                        toast.success("Cập nhật trạng thái đơn hàng thành công");
                        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
                        setIsStatusDialogOpen(false);
                    },
                }
            );
        } catch (error) {
            toast.error("Cập nhật trạng thái đơn hàng thất bại");
        }
    };

    const handleCancelOrder = async () => {
        try {
            await cancelOrder.mutateAsync(orderId as string, {
                onSuccess: () => {
                    toast.success("Hủy đơn hàng thành công");
                    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
                    setIsConfirmCancelDialogOpen(false);
                },
            });
        } catch (error) {
            toast.error("Hủy đơn hàng thất bại");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    };

    // Helper function to get variant image for both online and POS orders
    const getVariantImage = (item: any) => {
        if (item.variant?.images?.[0]?.imageUrl) {
            return checkImageUrl(item.variant.images[0].imageUrl);
        }

        // For online orders: item doesn't have variant field, use first variant with image
        if (item.product?.variants) {
            const variantWithImage = item.product.variants.find(
                (v: any) => v.images && v.images.length > 0
            );
            return checkImageUrl(variantWithImage?.images?.[0]?.imageUrl);
        }

        return checkImageUrl(null);
    };

    const getPaymentMethodName = (method: string) => {
        switch (method) {
            case "CASH":
                return "Tiền mặt";
            case "BANK_TRANSFER":
                return "Chuyển khoản ngân hàng";
            case "COD":
                return "Thanh toán khi nhận hàng";
            case "MIXED":
                return "Thanh toán nhiều phương thức";
            default:
                return "Không xác định";
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {/* Header skeleton */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="mb-0 md:mb-0">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <Link
                                        to="/admin/statistics"
                                        className="!text-white/80 hover:!text-white"
                                    >
                                        Dashboard
                                    </Link>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <Link
                                        to="/admin/orders"
                                        className="!text-white/80 hover:!text-white"
                                    >
                                        Quản lý đơn hàng
                                    </Link>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-medium">
                                        Chi tiết đơn hàng #{orderId}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </div>

                {/* Order stepper skeleton */}
                <Card className="mb-4 overflow-hidden">
                    <CardContent>
                        <div className="flex justify-between items-start relative">
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center z-10 flex-1 min-w-0 px-1"
                                >
                                    <Skeleton className="h-14 w-14 rounded-full" />
                                    <Skeleton className="h-4 w-16 mt-2.5" />
                                </div>
                            ))}
                        </div>
                        <Skeleton className="mt-6 h-2 w-full rounded-full" />
                    </CardContent>
                </Card>

                {/* Main content skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Order info card skeleton */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <Icon path={mdiInformation} size={0.8} className="text-primary" />
                                    </div>
                                    <span>Thông tin đơn hàng</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center"
                                        >
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer info card skeleton */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <Icon path={mdiAccount} size={0.8} className="text-primary" />
                                    </div>
                                    <span>Thông tin khách hàng</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center"
                                        >
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping address card skeleton */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <Icon path={mdiMapMarker} size={0.8} className="text-primary" />
                                    </div>
                                    <span>Địa chỉ giao hàng</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Products card skeleton */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <Icon path={mdiPackageVariant} size={0.8} className="text-primary" />
                                    </div>
                                    <span>Sản phẩm đã đặt</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Sản phẩm</TableHead>
                                            <TableHead className="text-right">Đơn giá</TableHead>
                                            <TableHead className="text-right">SL</TableHead>
                                            <TableHead className="text-right">Tổng</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...Array(3)].map((_, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="w-10 h-10 rounded" />
                                                        <div>
                                                            <Skeleton className="h-4 w-32 mb-1" />
                                                            <Skeleton className="h-3 w-20" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Skeleton className="h-4 w-16 ml-auto" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Skeleton className="h-4 w-8 ml-auto" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Skeleton className="h-4 w-20 ml-auto" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Order summary card skeleton */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <Icon path={mdiCash} size={0.8} className="text-primary" />
                                    </div>
                                    <span>Tổng quan đơn hàng</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[...Array(2)].map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center"
                                        >
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-3 border-t">
                                        <Skeleton className="h-5 w-36" />
                                        <Skeleton className="h-6 w-28" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !orderDetail) {
        return (
            <div>
                <div className="text-center py-10 text-white">
                    <p className="text-red-500">
                        Đã xảy ra lỗi khi tải thông tin đơn hàng hoặc đơn hàng không tồn
                        tại.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate("/admin/orders")}
                    >
                        Quay lại danh sách đơn hàng
                    </Button>
                </div>
            </div>
        );
    }
    const order = orderDetail.data;
    return (
        <div className="space-y-4 text-maintext">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="mb-0 md:mb-0">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <Link
                                    to="/admin/statistics"
                                >
                                    Dashboard
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <Link
                                    to="/admin/orders"
                                >
                                    Quản lý đơn hàng
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Chi tiết đơn hàng #{order.code}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsInvoiceDialogOpen(true)}
                    >
                        <Icon path={mdiFileDocument} size={0.8} className="mr-2" />
                        Xem hóa đơn
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={["DA_HUY", "HOAN_THANH"].includes(order.orderStatus)}
                        onClick={() => setIsConfirmCancelDialogOpen(true)}
                    >
                        <Icon path={mdiDelete} size={0.8} className="mr-2" />
                        Hủy đơn hàng
                    </Button>
                    <Button
                        disabled={["DA_HUY", "HOAN_THANH"].includes(order.orderStatus)}
                        onClick={() => setIsStatusDialogOpen(true)}
                    >
                        Cập nhật trạng thái
                    </Button>
                </div>
            </div>
            {order.orderStatus !== "DA_HUY" && (
                <OrderStepper currentStatus={order.orderStatus} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Icon path={mdiInformation} size={0.8} className="text-primary" />
                                </div>
                                <span>Thông tin đơn hàng</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-maintext">Mã đơn hàng:</span>
                                    <span className="font-medium text-maintext">
                                        {order.code}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-maintext">Ngày tạo:</span>
                                    <span className="text-maintext">
                                        {formatDate(order.createdAt)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-maintext">Trạng thái đơn hàng:</span>
                                    <OrderStatusBadge status={order.orderStatus} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-maintext">Trạng thái thanh toán:</span>
                                    <PaymentStatusBadge status={order.paymentStatus} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-maintext">Phương thức thanh toán:</span>
                                    <span className="text-maintext">
                                        {getPaymentMethodName(order.paymentMethod)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Icon path={mdiAccount} size={0.8} className="text-primary" />
                                </div>
                                <span>Thông tin khách hàng</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-maintext">Tên khách hàng:</span>
                                    <span className="font-medium text-maintext">
                                        {order.customer?.fullName || order.shippingName}
                                    </span>
                                </div>
                                {(order.customer?.email || order.shippingEmail) && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-maintext">Email:</span>
                                        <span className="text-maintext">
                                            {order.customer?.email || order.shippingEmail}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-maintext">Số điện thoại:</span>
                                    <span className="text-maintext">
                                        {order.customer?.phoneNumber || order.shippingPhoneNumber}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Staff Information (Optional) */}
                    {order.staff && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <Icon path={mdiAccountBadgeOutline} size={0.8} className="text-primary" />
                                    </div>
                                    <span>Thông tin nhân viên</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-maintext">Tên nhân viên:</span>
                                        <span className="font-medium text-maintext">
                                            {order.staff.fullName}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Icon path={mdiMapMarker} size={0.8} className="text-primary" />
                                </div>
                                <span>Địa chỉ giao hàng</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.shippingAddress || order.shippingSpecificAddress ? (
                                <div className="space-y-2">
                                    <p className="text-maintext font-medium">
                                        {order.shippingName}
                                    </p>
                                    <p className="text-maintext">{order.shippingPhoneNumber}</p>
                                    <p className="text-maintext">
                                        {order.shippingSpecificAddress ||
                                            order.shippingAddress?.specificAddress}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-maintext">
                                    Không có thông tin địa chỉ giao hàng
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Icon path={mdiPackageVariant} size={0.8} className="text-primary" />
                                </div>
                                <span>Sản phẩm đã đặt</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead className="text-right">Đơn giá</TableHead>
                                        <TableHead className="text-right">SL</TableHead>
                                        <TableHead className="text-right">Tổng</TableHead>
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
                                                            <div className="w-12 h-12 rounded border overflow-hidden bg-gray-100 flex-shrink-0">
                                                                <img
                                                                    draggable={false}
                                                                    src={variantImage}
                                                                    alt={item.product?.name || "Sản phẩm"}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-medium text-sm text-maintext line-clamp-2">
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
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Icon path={mdiCash} size={0.8} className="text-primary" />
                                </div>
                                <span>Tổng quan đơn hàng</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-maintext">Tổng tiền hàng:</span>
                                    <span className="text-maintext">
                                        {formatCurrency(order.subTotal)}
                                    </span>
                                </div>
                                {order.voucher && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-maintext">
                                            Mã giảm giá ({order.voucher.code}):
                                        </span>
                                        <span className="text-red-500">
                                            -{formatCurrency(order.discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="font-bold text-maintext">
                                        Tổng thanh toán:
                                    </span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Status Update Dialog */}
            <UpdateStatusDialog
                open={isStatusDialogOpen}
                onOpenChange={setIsStatusDialogOpen}
                currentStatus={order.orderStatus}
                currentPaymentStatus={order.paymentStatus}
                onUpdate={handleStatusUpdate}
                isUpdating={updateOrderStatus.isPending}
            />

            {/* Confirm Cancel Dialog */}
            <ConfirmCancelDialog
                open={isConfirmCancelDialogOpen}
                onOpenChange={setIsConfirmCancelDialogOpen}
                onConfirm={handleCancelOrder}
                isPending={cancelOrder.isPending}
            />

            {/* Invoice Dialog */}
            <OrderInvoiceDialog
                open={isInvoiceDialogOpen}
                onOpenChange={setIsInvoiceDialogOpen}
                order={order}
            />
        </div>
    );
}
