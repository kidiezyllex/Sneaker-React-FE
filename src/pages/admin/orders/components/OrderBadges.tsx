import { Badge } from "@/components/ui/badge";

export const OrderStatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "CHO_XAC_NHAN":
                return {
                    label: "Chờ xác nhận",
                    variant: "warning" as const,
                };
            case "CHO_GIAO_HANG":
                return {
                    label: "Chờ giao hàng",
                    variant: "info" as const,
                };
            case "DANG_VAN_CHUYEN":
                return {
                    label: "Đang vận chuyển",
                    variant: "outline" as const,
                };
            case "DA_GIAO_HANG":
                return {
                    label: "Đã giao hàng",
                    variant: "success" as const,
                };
            case "HOAN_THANH":
                return {
                    label: "Hoàn thành",
                    variant: "success" as const,
                };
            case "DA_HUY":
                return {
                    label: "Đã hủy",
                    variant: "destructive" as const,
                };
            default:
                return {
                    label: "Không xác định",
                    variant: "default" as const,
                };
        }
    };

    const config = getStatusConfig(status);

    return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const PaymentStatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PENDING":
                return {
                    label: "Chưa thanh toán",
                    variant: "warning" as const,
                };
            case "PARTIAL_PAID":
                return {
                    label: "Thanh toán một phần",
                    variant: "secondary" as const,
                };
            case "PAID":
                return {
                    label: "Đã thanh toán",
                    variant: "success" as const,
                };
            default:
                return {
                    label: "Không xác định",
                    variant: "default" as const,
                };
        }
    };

    const config = getStatusConfig(status);

    return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const OrderTypeBadge = ({ orderCode }: { orderCode: string }) => {
    const getOrderType = (code: string) => {
        if (code && code.includes("POS")) {
            return {
                label: "Tại quầy",
                variant: "purple" as const,
            };
        } else if (code && code.includes("DH")) {
            return {
                label: "Online",
                variant: "info" as const,
            };
        } else {
            return {
                label: "Không xác định",
                variant: "secondary" as const,
            };
        }
    };

    const config = getOrderType(orderCode);

    return <Badge variant={config.variant}>{config.label}</Badge>;
};
