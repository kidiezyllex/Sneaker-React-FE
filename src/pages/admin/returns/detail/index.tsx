"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { formatDateTime, formatCurrency } from "@/utils/formatters";
import { useReturnDetail, useUpdateReturn, useUpdateReturnStatus } from "@/hooks/return";
import { IReturnUpdate } from "@/interface/request/return";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import {
    mdiArrowLeft,
    mdiPlus,
    mdiMinus,
    mdiContentSave,
    mdiCancel,
    mdiCheckCircle,
    mdiInformationOutline,
    mdiPackageVariantClosed,
    mdiSigma,
    mdiCog,
} from "@mdi/js";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface EditableItem {
    product: string;
    variant: {
        colorId: string;
        sizeId: string;
    };
    quantity: number;
    price: number;
    reason?: string;
    maxQuantity: number;
    productName: string;
    productCode: string;
    productImage: string;
    variantInfo: string;
}

export default function AdminReturnDetailPage() {
    const location = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);

    const { data: returnData, isLoading, isError, refetch } = useReturnDetail(id || "");
    const updateReturn = useUpdateReturn();
    const updateStatus = useUpdateReturnStatus();

    useEffect(() => {
        if (returnData?.data) {
            const returnInfo = returnData.data;
            const order = returnInfo.originalOrder;

            // Parse items from JSON string if necessary
            let rawItems: any[] = [];
            try {
                rawItems = typeof returnInfo.items === "string"
                    ? JSON.parse(returnInfo.items)
                    : returnInfo.items;
            } catch (e) {
                console.error("Error parsing return items:", e);
            }

            const items = rawItems.map((item: any) => {
                // Find corresponding item in original order to get names, images, etc.
                const originalItem = order.items?.find((oItem: any) =>
                    (oItem.variant?.id === item.variantId) ||
                    (oItem.variant?.id?.toString() === item.variantId?.toString())
                );

                return {
                    product: item.productId || (originalItem?.product?.id?.toString() || ""),
                    variant: {
                        colorId: item.colorId || (originalItem?.variant?.color?.id?.toString() || ""),
                        sizeId: item.sizeId || (originalItem?.variant?.size?.id?.toString() || ""),
                    },
                    quantity: item.quantity,
                    price: item.price,
                    reason: item.reason || "",
                    maxQuantity: originalItem ? originalItem.quantity : item.quantity + 5,
                    productName: originalItem?.product?.name || "Sản phẩm",
                    productCode: originalItem?.product?.code || originalItem?.variant?.id?.toString() || (item.productId || ""),
                    productImage: originalItem?.variant?.images?.[0]?.imageUrl || originalItem?.product?.images?.[0]?.imageUrl || originalItem?.product?.images?.[0] || "/placeholder.jpg",
                    variantInfo: originalItem
                        ? `${originalItem.variant?.color?.name || "N/A"} - ${originalItem.variant?.size?.value || originalItem.variant?.size?.name || "N/A"}`
                        : "N/A"
                };
            });
            setEditableItems(items);
        }
    }, [returnData]);



    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CHO_XU_LY":
                return (
                    <Badge variant="warning">
                        Chờ xử lý
                    </Badge>
                );
            case "DA_HOAN_TIEN":
                return (
                    <Badge variant="success">
                        Đã hoàn tiền
                    </Badge>
                );
            case "DA_HUY":
                return (
                    <Badge variant="destructive">
                        Đã hủy
                    </Badge>
                );
            default:
                return <Badge variant="outline">Không xác định</Badge>;
        }
    };

    const handleQuantityChange = (index: number, newQuantity: number) => {
        setEditableItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        quantity: Math.max(1, Math.min(newQuantity, item.maxQuantity)),
                    }
                    : item
            )
        );
    };

    const handleReasonChange = (index: number, reason: string) => {
        setEditableItems((prev) =>
            prev.map((item, i) => (i === index ? { ...item, reason } : item))
        );
    };

    const getTotalRefund = () => {
        return editableItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    const handleUpdateStatus = async (status: "DA_HOAN_TIEN" | "DA_HUY") => {
        setIsSubmitting(true);
        try {
            await updateStatus.mutateAsync({
                returnId: id || "",
                payload: { status }
            }, {
                onSuccess: () => {
                    toast.success(`Đã ${status === "DA_HOAN_TIEN" ? "hoàn tiền" : "hủy"} yêu cầu thành công`);
                    refetch();
                    setIsApproveOpen(false);
                    setIsRejectOpen(false);
                },
                onError: (error) => {
                    toast.error("Cập nhật trạng thái thất bại: " + error.message);
                }
            });
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (editableItems.length === 0) {
            toast.error("Phải có ít nhất một sản phẩm trong yêu cầu trả hàng");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: IReturnUpdate = {
                items: editableItems.map((item) => ({
                    product: item.product,
                    variant: item.variant,
                    quantity: item.quantity,
                    price: item.price,
                    reason: item.reason,
                })),
                totalRefund: getTotalRefund(),
            };

            await updateReturn.mutateAsync({ returnId: id || "", payload }, {
                onSuccess: () => {
                    toast.success("Cập nhật yêu cầu trả hàng thành công");
                    refetch();
                    setIsSaveOpen(false);
                },
                onError: (error) => {
                    toast.error("Cập nhật yêu cầu trả hàng thất bại: " + error.message);
                }
            });
        } catch (error) {
            toast.error("Cập nhật yêu cầu trả hàng thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
                <div className="h-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </div>
        );
    }

    if (isError || !returnData?.data) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 text-lg mb-4">Không thể tải thông tin yêu cầu trả hàng</p>
                <Link to={location.pathname.startsWith('/staff') ? '/staff/returns' : '/admin/returns'}>
                    <Button variant="outline">
                        <Icon path={mdiArrowLeft} size={0.8} />
                        Quay lại danh sách
                    </Button>
                </Link>
            </div>
        );
    }

    const returnInfo = returnData.data;
    const customer = returnInfo.customer;
    const order = returnInfo.originalOrder;
    const canEdit = returnInfo.status === "CHO_XU_LY";

    return (
        <div className="space-y-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to={location.pathname.startsWith('/staff') ? '/staff/pos' : '/admin/statistics'}>Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to={location.pathname.startsWith('/staff') ? '/staff/returns' : '/admin/returns'}>Quản lý trả hàng</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{canEdit ? "Chỉnh sửa" : "Chi tiết"} yêu cầu trả hàng</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {!canEdit && (
                <Card className="border-orange-200 bg-orange-50 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-orange-700">
                            <Icon path={mdiCancel} size={0.8} />
                            <p className="font-medium text-sm">
                                Yêu cầu trả hàng này đã được xử lý và không thể chỉnh sửa thêm.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    {/* Return Information */}
                    <Card className="shadow-sm border border-slate-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Icon path={mdiInformationOutline} size={0.8} className="text-primary" />
                                </div>
                                <span>Thông tin yêu cầu #{returnInfo.code}</span>
                                <div className="ml-auto">
                                    {getStatusBadge(returnInfo.status)}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                <div className="p-4 space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-maintext">Ngày tạo hệ thống</span>
                                            <span className="text-sm font-semibold text-slate-900">{formatDateTime(returnInfo.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-maintext">Mã đơn hàng gốc</span>
                                            <Badge variant="outline" className="font-mono">#{order.code}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-1 pt-3 border-t border-slate-50">
                                            <span className="text-sm font-bold text-slate-700">Giá trị đơn hàng</span>
                                            <span className="text-base font-bold text-slate-900">{formatCurrency(order.total)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold uppercase text-maintext tracking-widest">Lý do hoàn trả</p>
                                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm text-slate-700 leading-relaxed italic">
                                                "{returnInfo.reason || "Không có lý do chi tiết"}"
                                            </div>
                                        </div>

                                        {returnInfo.note && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold uppercase text-maintext tracking-widest">Ghi chú bổ sung</p>
                                                <div className="bg-blue-50/30 border border-blue-100/50 p-4 rounded-xl text-sm text-slate-600">
                                                    {returnInfo.note}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold uppercase text-maintext tracking-widest">Thông tin khách hàng</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm">
                                                <img
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.id}`}
                                                    alt={customer.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-slate-900 text-base">{customer.fullName}</p>
                                                <p className="text-maintext text-sm flex items-center gap-1">
                                                    {customer.email}
                                                </p>
                                                <p className="text-maintext text-sm">{customer.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {order.shippingName && (
                                        <div className="space-y-3 pt-4 border-t border-slate-50">
                                            <p className="text-xs font-bold uppercase text-maintext tracking-widest">Địa chỉ đơn hàng gốc</p>
                                            <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                                <p className="text-sm font-bold text-slate-800">{order.shippingName} <span className="text-slate-400 font-normal mx-1">|</span> {order.shippingPhoneNumber}</p>
                                                <p className="text-xs text-slate-600 leading-relaxed">{order.shippingSpecificAddress}</p>
                                            </div>
                                        </div>
                                    )}

                                    {returnInfo.staff && (
                                        <div className="space-y-3 pt-4 border-t border-slate-50">
                                            <p className="text-xs font-bold uppercase text-maintext tracking-widest">Nhân viên phụ trách</p>
                                            <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white">
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${returnInfo.staff.id}`}
                                                        alt={returnInfo.staff.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm leading-tight">{returnInfo.staff.fullName}</p>
                                                    <p className="text-maintext text-xs font-medium uppercase tracking-tighter mt-0.5">{returnInfo.staff.role || "Quản trị viên"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Editable Items */}
                    <Card className="shadow-sm border-none bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Icon path={mdiPackageVariantClosed} size={0.8} className="text-primary" />
                                </div>
                                <span>Sản phẩm hoàn trả</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {editableItems.map((item, index) => (
                                    <div key={index} className="group border rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 bg-white shadow-sm overflow-hidden relative">
                                        {canEdit && (
                                            <div className="absolute top-0 right-0 w-1 h-full bg-primary/0 group-hover:bg-primary/40 transition-all" />
                                        )}
                                        <div className="flex flex-col sm:flex-row items-start gap-4">
                                            <div className="relative">
                                                <img
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    className="w-24 h-24 rounded-xl object-cover border shadow-sm"
                                                />
                                                <Badge className="absolute -top-2 -right-2">
                                                    x{item.quantity}
                                                </Badge>
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{item.productName}</h4>
                                                        <p className="text-xs font-mono text-maintext">SKU: {item.productCode}</p>
                                                    </div>
                                                    <p className="font-bold text-slate-900">{formatCurrency(item.price)}</p>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Badge variant="secondary">
                                                        {item.variantInfo}
                                                    </Badge>
                                                </div>

                                                {canEdit && (
                                                    <div className="flex items-center gap-4 pt-4">
                                                        <div className="space-y-1.5">
                                                            <p className="text-xs font-bold uppercase text-maintext tracking-wider">Số lượng trả</p>
                                                            <div className="flex items-center bg-slate-100 rounded-md p-1 border">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-md hover:bg-white transition-colors"
                                                                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    <Icon path={mdiMinus} size={0.5} />
                                                                </Button>
                                                                <Input
                                                                    type="number"
                                                                    className="w-12 h-7 bg-transparent border-none text-center font-bold text-sm focus-visible:ring-0 p-0"
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-md hover:bg-white transition-colors"
                                                                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                                    disabled={item.quantity >= item.maxQuantity}
                                                                >
                                                                    <Icon path={mdiPlus} size={0.5} />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 space-y-1.5">
                                                            <p className="text-xs font-bold uppercase text-maintext tracking-wider">Lý do cụ thể</p>
                                                            <Input
                                                                placeholder="Nhập lý do riêng cho sp này..."
                                                                className="h-9 text-sm rounded-md"
                                                                value={item.reason || ""}
                                                                onChange={(e) => handleReasonChange(index, e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {!canEdit && item.reason && (
                                                    <div className="mt-3 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                                                        <p className="text-xs font-bold uppercase text-maintext tracking-wider mb-1">Lý do trả hàng</p>
                                                        <p className="text-xs text-slate-600 italic">"{item.reason}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center bg-slate-50/30 -mx-5 px-5">
                                            <span className="text-xs text-maintext font-medium uppercase tracking-wider">Thành tiền hoàn</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Summary Card */}
                    <Card className="shadow-sm border border-slate-200 bg-white overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Icon path={mdiSigma} size={0.8} className="text-primary" />
                                </div>
                                <span>Tổng kết hoàn trả</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                <div className="space-y-3 pb-4 border-b border-slate-100 border-dashed">
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-maintext">Số loại sản phẩm:</span>
                                        <span className="font-semibold text-slate-900">{editableItems.length} sản phẩm</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-maintext">Tổng số lượng trả:</span>
                                        <span className="font-semibold text-slate-900">{editableItems.reduce((acc, curr) => acc + curr.quantity, 0)} cái</span>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2">
                                    <p className="text-xs font-bold uppercase text-maintext tracking-widest">Số tiền hoàn (Dự kiến)</p>
                                    <div className="bg-green-50/50 border border-green-200 p-4 rounded-xl text-center">
                                        <p className="text-3xl font-black text-primary">{formatCurrency(getTotalRefund())}</p>
                                    </div>
                                </div>

                                {getTotalRefund() !== returnInfo.totalRefund && (
                                    <div className="pt-2">
                                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-md flex justify-between items-center text-xs">
                                            <span className="text-maintext font-medium">Tiền hoàn gốc:</span>
                                            <span className="font-semibold text-slate-700 line-through opacity-60">{formatCurrency(returnInfo.totalRefund)}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2 text-right italic">* Số tiền thay đổi sau khi điều chỉnh số lượng</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions (only if pending) */}
                    {canEdit && (
                        <Card className="shadow-sm border-none bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <Icon path={mdiCog} size={0.8} className="text-primary" />
                                    </div>
                                    <span>Xử lý yêu cầu</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <Button
                                    className="w-full"
                                    onClick={() => setIsApproveOpen(true)}
                                    disabled={isSubmitting}
                                >
                                    <Icon path={mdiCheckCircle} size={0.8} />
                                    Phê duyệt hoàn tiền
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => setIsRejectOpen(true)}
                                    disabled={isSubmitting}
                                >
                                    <Icon path={mdiCancel} size={0.8} />
                                    Từ chối yêu cầu
                                </Button>
                                <div className="pt-4 border-t mt-4 flex gap-3">
                                    <Button
                                        className="flex-1"
                                        onClick={() => setIsSaveOpen(true)}
                                        disabled={isSubmitting || editableItems.length === 0}
                                    >
                                        <Icon path={mdiContentSave} size={0.8} />
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={isApproveOpen}
                onClose={() => setIsApproveOpen(false)}
                onConfirm={() => handleUpdateStatus("DA_HOAN_TIEN")}
                title="Xác nhận phê duyệt"
                description="Bạn có chắc chắn muốn phê duyệt hoàn tiền cho yêu cầu này không? Hành động này sẽ thay đổi trạng thái yêu cầu sang 'Đã hoàn tiền'."
                isLoading={isSubmitting}
                confirmText="Xác nhận phê duyệt"
                icon={mdiCheckCircle}
            />

            <ConfirmDialog
                isOpen={isRejectOpen}
                onClose={() => setIsRejectOpen(false)}
                onConfirm={() => handleUpdateStatus("DA_HUY")}
                title="Xác nhận từ chối"
                description="Bạn có chắc chắn muốn từ chối yêu cầu trả hàng này không? Hành động này sẽ hủy yêu cầu và không thể hoàn tác."
                isLoading={isSubmitting}
                confirmText="Từ chối yêu cầu"
                confirmVariant="destructive"
                icon={mdiCancel}
            />

            <ConfirmDialog
                isOpen={isSaveOpen}
                onClose={() => setIsSaveOpen(false)}
                onConfirm={handleSubmit}
                title="Lưu thay đổi"
                description="Bạn có chắc chắn muốn lưu các thay đổi về số lượng và lý do trả hàng không?"
                isLoading={isSubmitting}
                confirmText="Lưu thay đổi"
                icon={mdiContentSave}
            />
        </div>
    );
}
