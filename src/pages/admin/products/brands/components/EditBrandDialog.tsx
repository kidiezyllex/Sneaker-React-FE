import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiPencil, mdiClose } from "@mdi/js";
import { useBrandDetail, useUpdateBrand } from "@/hooks/attributes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DialogContent,
    DialogHeader
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditBrandDialogProps {
    brandId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function EditBrandDialog({ brandId, isOpen, onClose }: EditBrandDialogProps) {
    const queryClient = useQueryClient();
    const { data: brandData, isLoading, isError } = useBrandDetail(brandId);
    const updateBrand = useUpdateBrand();

    const [formData, setFormData] = useState({
        name: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    });

    const [errors, setErrors] = useState({
        name: "",
    });

    useEffect(() => {
        if (brandData?.data) {
            setFormData({
                name: brandData.data.name,
                status: brandData.data.status,
            });
        }
    }, [brandData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user types
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
            newErrors.name = "Tên thương hiệu không được để trống";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await updateBrand.mutateAsync(
                {
                    brandId: brandId,
                    payload: formData,
                },
                {
                    onSuccess: () => {
                        toast.success("Cập nhật thương hiệu thành công");
                        queryClient.invalidateQueries({ queryKey: ["brand", brandId] });
                        queryClient.invalidateQueries({ queryKey: ["brands"] });
                        onClose();
                    },
                    onError: (error) => {
                        toast.error("Cập nhật thương hiệu thất bại: " + error.message);
                    },
                }
            );
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi cập nhật thương hiệu");
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

    if (isError || !brandData) {
        return (
            <DialogContent size="md">
                <DialogHeader title="Lỗi" icon={mdiPencil} />
                <div className="py-8 text-center">
                    <p className="text-red-500 mb-6">
                        Đã xảy ra lỗi khi tải dữ liệu thương hiệu.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button variant="outline" onClick={onClose}>
                            <Icon path={mdiClose} size={0.8} />
                            Đóng
                        </Button>
                        <Button
                            onClick={() =>
                                queryClient.invalidateQueries({ queryKey: ["brand", brandId] })
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
                title={`Chỉnh sửa thương hiệu: ${brandData.data.name}`}
                icon={mdiPencil}
            />
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 pb-4 px-4">
                <div className="space-y-2">
                    <FormLabel htmlFor="name">Tên thương hiệu</FormLabel>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Nhập tên thương hiệu"
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
                    <Button type="submit" disabled={updateBrand.isPending}>
                        <Icon path={mdiPencil} size={0.8} />
                        {updateBrand.isPending ? "Đang xử lý..." : "Cập nhật thương hiệu"}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
