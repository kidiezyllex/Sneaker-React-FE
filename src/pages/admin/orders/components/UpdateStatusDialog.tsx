import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { mdiClose, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";

interface UpdateStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStatus: string;
    currentPaymentStatus?: string;
    onUpdate: (status: string, paymentStatus?: string) => void;
    isUpdating?: boolean;
    showPaymentStatus?: boolean;
}

export const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
    open,
    onOpenChange,
    currentStatus,
    currentPaymentStatus,
    onUpdate,
    isUpdating,
    showPaymentStatus = true,
}) => {
    const [status, setStatus] = React.useState(currentStatus);
    const [paymentStatus, setPaymentStatus] = React.useState(currentPaymentStatus || "PENDING");

    React.useEffect(() => {
        if (open) {
            setStatus(currentStatus);
            setPaymentStatus(currentPaymentStatus || "PENDING");
        }
    }, [open, currentStatus, currentPaymentStatus]);

    const getAvailableOrderStatuses = (current: string) => {
        const statusOrder = [
            "CHO_XAC_NHAN",
            "CHO_GIAO_HANG",
            "DANG_VAN_CHUYEN",
            "DA_GIAO_HANG",
            "HOAN_THANH",
        ];
        const currentIndex = statusOrder.indexOf(current);
        if (currentIndex === -1) return statusOrder;
        return statusOrder.slice(currentIndex);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="md">
                <DialogHeader
                    title="Cập nhật trạng thái"
                    icon={mdiPencil}
                />
                <div className="space-y-4 py-2 px-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Trạng thái đơn hàng</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái đơn hàng" />
                            </SelectTrigger>
                            <SelectContent>
                                {getAvailableOrderStatuses(currentStatus).map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s === "CHO_XAC_NHAN" && "Chờ xác nhận"}
                                        {s === "CHO_GIAO_HANG" && "Chờ giao hàng"}
                                        {s === "DANG_VAN_CHUYEN" && "Đang vận chuyển"}
                                        {s === "DA_GIAO_HANG" && "Đã giao hàng"}
                                        {s === "HOAN_THANH" && "Hoàn thành"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {showPaymentStatus && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Trạng thái thanh toán</label>
                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái thanh toán" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Chưa thanh toán</SelectItem>
                                    <SelectItem value="PARTIAL_PAID">Thanh toán một phần</SelectItem>
                                    <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        <Icon path={mdiClose} size={0.8} />
                        Hủy
                    </Button>
                    <Button
                        onClick={() => onUpdate(status, paymentStatus)}
                        disabled={isUpdating}
                    >
                        <Icon path={mdiPencil} size={0.8} />
                        {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
