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
import { mdiClose } from "@mdi/js";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode;
    isLoading?: boolean;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    icon?: string;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading = false,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    confirmVariant = "default",
    icon,
}: ConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent size="md">
                <DialogHeader title={title} icon={icon} />
                <div className="p-4 text-sm text-slate-600">{description}</div>
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
                        variant={confirmVariant}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : null}
                        {isLoading ? "Đang xử lý..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
