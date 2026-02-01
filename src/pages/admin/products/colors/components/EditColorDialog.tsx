import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiPencil, mdiClose, mdiRefresh } from "@mdi/js";
import { useColorDetail, useUpdateColor } from "@/hooks/attributes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import namer from "color-namer";
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

interface EditColorDialogProps {
    colorId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function EditColorDialog({ colorId, isOpen, onClose }: EditColorDialogProps) {
    const queryClient = useQueryClient();
    const { data: colorData, isLoading, isError } = useColorDetail(colorId);
    const updateColor = useUpdateColor();

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    });

    const [errors, setErrors] = useState({
        name: "",
        code: "",
    });

    useEffect(() => {
        if (colorData?.data) {
            setFormData({
                name: colorData.data.name,
                code: colorData.data.code,
                status: colorData.data.status,
            });
        }
    }, [colorData]);

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
            newErrors.name = "Tên màu sắc không được để trống";
            isValid = false;
        }

        if (!formData.code.trim()) {
            newErrors.code = "Mã màu không được để trống";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const generateRandomColor = () => {
        const randomColor =
            "#" +
            Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, "0");
        const colorName = namer(randomColor).pantone[0].name;

        setFormData((prev) => ({
            ...prev,
            name: colorName,
            code: randomColor,
        }));

        setErrors({
            name: "",
            code: "",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await updateColor.mutateAsync(
                {
                    colorId: colorId,
                    payload: formData,
                },
                {
                    onSuccess: () => {
                        toast.success("Cập nhật màu sắc thành công");
                        queryClient.invalidateQueries({ queryKey: ["color", colorId] });
                        queryClient.invalidateQueries({ queryKey: ["colors"] });
                        onClose();
                    },
                    onError: (error: any) => {
                        toast.error("Cập nhật màu sắc thất bại: " + error.message);
                    },
                }
            );
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi cập nhật màu sắc");
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

    if (isError || !colorData) {
        return (
            <DialogContent size="xl">
                <DialogHeader title="Lỗi" icon={mdiPencil} />
                <div className="py-8 text-center">
                    <p className="text-red-500 mb-6">
                        Đã xảy ra lỗi khi tải dữ liệu màu sắc.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button variant="outline" onClick={onClose}>
                            <Icon path={mdiClose} size={0.8} className="mr-2" />
                            Đóng
                        </Button>
                        <Button
                            onClick={() =>
                                queryClient.invalidateQueries({ queryKey: ["color", colorId] })
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
                title={`Chỉnh sửa màu sắc: ${colorData.data.name}`}
                icon={mdiPencil}
            />
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-4 px-4">
                <div className="space-y-2">
                    <FormLabel htmlFor="name">Tên màu sắc</FormLabel>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Nhập tên màu sắc"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <FormLabel htmlFor="code">Mã màu</FormLabel>
                    <div className="flex gap-2 items-center">
                        <Input
                            id="code"
                            name="code"
                            type="text"
                            placeholder="#000000"
                            value={formData.code}
                            onChange={handleInputChange}
                            className={errors.code ? "border-red-500" : ""}
                        />
                        <div
                            className="w-10 h-10 rounded-xl border border-gray-200 shadow-sm"
                            style={{ backgroundColor: formData.code }}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={generateRandomColor}
                    >
                        <Icon path={mdiRefresh} size={0.8} className="mr-2" />
                        Random Color
                    </Button>
                    {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
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
                    <Button type="submit" disabled={updateColor.isPending}>
                        <Icon path={mdiPencil} size={0.8} />
                        {updateColor.isPending ? "Đang xử lý..." : "Cập nhật màu sắc"}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
