"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import { mdiAlertCircleOutline } from "@mdi/js";
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmCancelModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmCancelModal({
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmCancelModalProps) {
  return (
    <DialogContent size="lg">
      <DialogHeader
        title="Xác nhận hủy yêu cầu"
        icon={mdiAlertCircleOutline}
      />

      <div className="py-4">
        <p className="text-maintext">
          Bạn có chắc chắn muốn hủy yêu cầu trả hàng này không? Hành động này
          không thể hoàn tác.
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Không, giữ lại
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Đang hủy..." : "Có, hủy yêu cầu"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
