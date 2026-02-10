import React, { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiPlus, mdiClose, mdiLoading } from "@mdi/js";
import { useCreateSize, useSizes } from "@/hooks/attributes";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import {
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CreateSizeDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateSizeDialog({ isOpen, onClose }: CreateSizeDialogProps) {
    const queryClient = useQueryClient();
    const createSize = useCreateSize();
    const { data: existingSizesData, isLoading: isLoadingExisting } = useSizes({
        limit: 1000,
    });

    const [formData, setFormData] = useState({
        value: 0,
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    });

    const [errors, setErrors] = useState({
        value: "",
    });

    const availableSizes = useMemo(() => {
        if (isLoadingExisting) return [];

        const shoeSizes = [];
        for (let i = 34; i <= 46; i += 0.5) {
            shoeSizes.push(i);
        }

        const allPotentialValues = shoeSizes;
        const existingValues = existingSizesData?.data?.map((s) => s.value) || [];

        return allPotentialValues.filter(
            (val) => !existingValues.some((ex) => Math.abs(ex - val) < 0.001)
        );
    }, [existingSizesData, isLoadingExisting]);

    const handleSizeChange = (value: string) => {
        const sizeValue = parseFloat(value);
        if (!isNaN(sizeValue)) {
            setFormData((prev) => ({ ...prev, value: sizeValue }));
            if (errors.value) {
                setErrors((prev) => ({ ...prev, value: "" }));
            }
        }
    };

    const handleStatusChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            status: value as "ACTIVE" | "INACTIVE",
        }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (formData.value <= 0) {
            newErrors.value = "Vui lòng chọn kích cỡ";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await createSize.mutateAsync(formData, {
                onSuccess: () => {
                    toast.success("Thêm kích cỡ thành công");
                    queryClient.invalidateQueries({ queryKey: ["sizes"] });
                    setFormData({
                        value: 0,
                        status: "ACTIVE",
                    });
                    onClose();
                },
                onError: (error: any) => {
                    if (error.message === "Duplicate entry. This record already exists.") {
                        toast.error("Thêm kích cỡ thất bại: Kích cỡ này đã tồn tại.");
                    } else {
                        toast.error("Thêm kích cỡ thất bại");
                    }
                },
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DialogContent size="md">
            <DialogHeader title="Thêm kích cỡ mới" icon={mdiPlus} />
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 pb-4 px-4">
                <div className="space-y-2">
                    <FormLabel htmlFor="create-size">Kích cỡ</FormLabel>
                    <Select
                        value={formData.value ? String(formData.value) : ""}
                        onValueChange={handleSizeChange}
                    >
                        <SelectTrigger
                            id="create-size"
                            className={errors.value ? "border-red-500" : ""}
                        >
                            <SelectValue placeholder="Chọn kích cỡ" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingExisting ? (
                                <div className="flex items-center justify-center p-4">
                                    <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                                    <span className="ml-2 text-sm">Đang tải dữ liệu...</span>
                                </div>
                            ) : availableSizes.length > 0 ? (
                                availableSizes.map((val) => (
                                    <SelectItem key={val} value={String(val)}>
                                        Size {val}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-center text-sm text-gray-500">
                                    Tất cả kích cỡ đã được thêm
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.value && <p className="text-red-500 text-sm">{errors.value}</p>}
                </div>

                <div className="space-y-2">
                    <FormLabel htmlFor="create-status">Trạng thái</FormLabel>
                    <Select value={formData.status} onValueChange={handleStatusChange}>
                        <SelectTrigger id="create-status">
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                            <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Hủy
                    </Button>
                    <Button type="submit" disabled={createSize.isPending}>
                        <Icon path={mdiPlus} size={0.8} />
                        {createSize.isPending ? "Đang xử lý..." : "Thêm kích cỡ"}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
