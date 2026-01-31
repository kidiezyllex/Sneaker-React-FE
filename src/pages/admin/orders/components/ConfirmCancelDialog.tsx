import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mdiAlertCircleOutline } from "@mdi/js";

interface ConfirmCancelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending?: boolean;
}

export const ConfirmCancelDialog: React.FC<ConfirmCancelDialogProps> = ({
    open,
    onOpenChange,
    onConfirm,
    isPending,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="xl">
                <DialogHeader
                    title="Xác nhận hủy đơn hàng"
                    icon={mdiAlertCircleOutline}
                />
                <div className="py-4 px-4">
                    <p className="text-maintext">
                        Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không
                        thể hoàn tác.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Không
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? "Đang xử lý..." : "Xác nhận hủy"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
