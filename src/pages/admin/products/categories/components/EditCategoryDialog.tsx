import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiPencil, mdiClose } from "@mdi/js";
import { useCategoryDetail, useUpdateCategory } from "@/hooks/attributes";
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

interface EditCategoryDialogProps {
    categoryId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function EditCategoryDialog({
    categoryId,
    isOpen,
    onClose,
}: EditCategoryDialogProps) {
    const queryClient = useQueryClient();
    const {
        data: categoryData,
        isLoading,
        isError,
    } = useCategoryDetail(categoryId);
    const updateCategory = useUpdateCategory();

    const [formData, setFormData] = useState({
        name: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    });

    const [errors, setErrors] = useState({
        name: "",
    });

    useEffect(() => {
        if (categoryData?.data) {
            setFormData({
                name: categoryData.data.name,
                status: categoryData.data.status,
            });
        }
    }, [categoryData]);

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
            newErrors.name = "Tên danh mục không được để trống";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await updateCategory.mutateAsync(
                {
                    categoryId: categoryId,
                    payload: formData,
                },
                {
                    onSuccess: () => {
                        toast.success("Cập nhật danh mục thành công");
                        queryClient.invalidateQueries({
                            queryKey: ["category", categoryId],
                        });
                        queryClient.invalidateQueries({ queryKey: ["categories"] });
                        onClose();
                    },
                    onError: (error: any) => {
                        toast.error("Cập nhật danh mục thất bại: " + error.message);
                    },
                }
            );
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi cập nhật danh mục");
        }
    };

    if (isLoading) {
        return (
            <DialogContent size="xl">
                <DialogHeader title="Đang tải..." icon={mdiPencil} />
                <div className="space-y-4 p-6">
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

    if (isError || !categoryData) {
        return (
            <DialogContent size="xl">
                <DialogHeader title="Lỗi" icon={mdiPencil} />
                <div className="py-8 text-center">
                    <p className="text-red-500 mb-6">
                        Đã xảy ra lỗi khi tải dữ liệu danh mục.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button variant="outline" onClick={onClose}>
                            <Icon path={mdiClose} size={0.8} className="mr-2" />
                            Đóng
                        </Button>
                        <Button
                            onClick={() =>
                                queryClient.invalidateQueries({
                                    queryKey: ["category", categoryId],
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
        <DialogContent size="xl">
            <DialogHeader
                title={`Chỉnh sửa danh mục: ${categoryData.data.name}`}
                icon={mdiPencil}
            />
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-4 px-4">
                <div className="space-y-2">
                    <FormLabel htmlFor="name">Tên danh mục</FormLabel>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Nhập tên danh mục"
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
                    <Button type="submit" disabled={updateCategory.isPending}>
                        <Icon path={mdiPencil} size={0.8} />
                        {updateCategory.isPending ? "Đang xử lý..." : "Cập nhật danh mục"}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
