import React from "react";
import { Badge } from "@/components/ui/badge";

export const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | "warning"
        | "info"
        | "purple"
        | "rose"
        | "indigo";
    }
  > = {
    CHO_XAC_NHAN: {
      label: "Chờ xác nhận",
      variant: "warning",
    },
    CHO_GIAO_HANG: {
      label: "Chờ giao hàng",
      variant: "info",
    },
    DANG_VAN_CHUYEN: {
      label: "Đang vận chuyển",
      variant: "purple",
    },
    DA_GIAO_HANG: {
      label: "Đã giao hàng",
      variant: "success",
    },
    HOAN_THANH: {
      label: "Hoàn thành",
      variant: "success",
    },
    DA_HUY: {
      label: "Đã hủy",
      variant: "destructive",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    variant: "outline",
  };

  return <Badge variant={config.variant as any}>{config.label}</Badge>;
};

export const ReturnStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | "warning"
        | "info"
        | "purple"
        | "rose"
        | "indigo";
    }
  > = {
    CHO_XU_LY: {
      label: "Chờ xử lý",
      variant: "warning",
    },
    DA_HOAN_TIEN: {
      label: "Đã hoàn tiền",
      variant: "success",
    },
    DA_HUY: {
      label: "Đã hủy",
      variant: "destructive",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    variant: "outline",
  };

  return <Badge variant={config.variant as any}>{config.label}</Badge>;
};
