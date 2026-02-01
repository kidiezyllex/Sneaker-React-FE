import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiPencil, mdiClose } from "@mdi/js";
import { useMaterialDetail, useUpdateMaterial } from "@/hooks/attributes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
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

interface EditMaterialDialogProps {
    materialId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function EditMaterialDialog({
    materialId,
    isOpen,
    onClose,
}: EditMaterialDialogProps) {
    const queryClient = useQueryClient();
    const {
        data: materialData,
        isLoading,
        isError,
    } = useMaterialDetail(materialId);
    const updateMaterial = useUpdateMaterial();

    const [formData, setFormData] = useState({
        name: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    });

    const [errors, setErrors] = useState({
        name: "",
    });

    useEffect(() => {
        if (materialData?.data) {
            setFormData({
                name: materialData.data.name,
                status: materialData.data.status,
            });
        }
    }, [materialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
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

        if (!formData.name.trim()) {
            newErrors.name = "Tên chất liệu không được để trống";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await updateMaterial.mutateAsync(
                {
                    materialId: materialId,
                    payload: formData,
                },
                {
                    onSuccess: () => {
                        toast.success("Cập nhật chất liệu thành công");
                        queryClient.invalidateQueries({
                            queryKey: ["material", materialId],
                        });
                        queryClient.invalidateQueries({ queryKey: ["materials"] });
                        onClose();
                    },
                    onError: (error: any) => {
                        toast.error("Cập nhật chất liệu thất bại: " + error.message);
                    },
                }
            );
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi cập nhật chất liệu");
        }
    };

    if (isLoading) {
        return (
            <DialogContent size="md">
                <DialogHeader title="Đang tải..." icon={mdiPencil} />
                <div className="space-y-4 p-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Skeleton className="h-10 w-[100px]" />
                        <Skeleton className="h-10 w-[150px]" />
                    </div>
                </div>
            </DialogContent>
        );
    }

    if (isError || !materialData) {
        return (
            <DialogContent size="md">
                <DialogHeader title="Lỗi" icon={mdiPencil} />
                <div className="py-8 text-center">
                    <p className="text-red-500 mb-6">
                        Đã xảy ra lỗi khi tải dữ liệu chất liệu.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button variant="outline" onClick={onClose}>
                            <Icon path={mdiClose} size={0.8} className="mr-2" />
                            Đóng
                        </Button>
                        <Button
                            onClick={() =>
                                queryClient.invalidateQueries({
                                    queryKey: ["material", materialId],
                                })
                            }
                        >
                            Thử lại
                        </Button>
                    </div>
                </div>
            </DialogContent>
        );
    }

    return (
        <DialogContent size="md">
            <DialogHeader
                title={`Chỉnh sửa chất liệu: ${materialData.data.name}`}
                icon={mdiPencil}
            />
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-4 px-4">
                <div className="space-y-2">
                    <FormLabel htmlFor="name">Tên chất liệu</FormLabel>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Nhập tên chất liệu"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <FormLabel htmlFor="status">Trạng thái</FormLabel>
                    <Select value={formData.status} onValueChange={handleStatusChange}>
                        <SelectTrigger id="status">
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
                    <Button type="submit" disabled={updateMaterial.isPending}>
                        <Icon path={mdiPencil} size={0.8} />
                        {updateMaterial.isPending ? "Đang xử lý..." : "Cập nhật chất liệu"}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
