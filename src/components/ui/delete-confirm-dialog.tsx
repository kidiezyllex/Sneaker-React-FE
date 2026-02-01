"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import { mdiClose, mdiDelete } from "@mdi/js";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  description = "Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.",
  isLoading = false,
  confirmText = "Xóa",
  cancelText = "Hủy",
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="xl">
        <DialogHeader title={title} icon={mdiDelete} />
        <div className="p-4 text-sm text-maintext">{description}</div>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <Icon path={mdiClose} size={0.8} />
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Icon path={mdiDelete} size={0.8} />
            )}
            {isLoading ? "Đang xử lý..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
