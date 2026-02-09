import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiPlus, mdiClose, mdiRefresh } from "@mdi/js";
import { useCreateColor } from "@/hooks/attributes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
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

interface CreateColorDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateColorDialog({ isOpen, onClose }: CreateColorDialogProps) {
    const queryClient = useQueryClient();
    const createColor = useCreateColor();

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    });

    const [errors, setErrors] = useState({
        name: "",
        code: "",
    });

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
            await createColor.mutateAsync(formData, {
                onSuccess: () => {
                    toast.success("Thêm màu sắc thành công");
                    queryClient.invalidateQueries({ queryKey: ["colors"] });
                    setFormData({
                        name: "",
                        code: "",
                        status: "ACTIVE",
                    });
                    onClose();
                },
                onError: (error: any) => {
                    if (error.message === "Duplicate entry. This record already exists.") {
                        toast.error("Thêm màu sắc thất bại: Màu sắc đã tồn tại");
                    } else {
                        toast.error("Thêm màu sắc thất bại: " + error.message);
                    }
                },
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DialogContent size="md">
            <DialogHeader title="Thêm màu sắc mới" icon={mdiPlus} />
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-4 px-4">
                <div className="space-y-2">
                    <FormLabel htmlFor="create-name">Tên màu sắc</FormLabel>
                    <Input
                        id="create-name"
                        name="name"
                        placeholder="Nhập tên màu sắc"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <FormLabel htmlFor="create-code">Mã màu</FormLabel>
                    <div className="flex gap-2 items-center">
                        <Input
                            id="create-code"
                            name="code"
                            type="text"
                            placeholder="#000000"
                            value={formData.code}
                            onChange={handleInputChange}
                            className={errors.code ? "border-red-500" : ""}
                        />
                        <div
                            className="w-10 h-10 rounded-xl border border-gray-200 shadow-sm transition-all"
                            style={{ backgroundColor: formData.code || "#ffffff" }}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={generateRandomColor}
                    >
                        <Icon path={mdiRefresh} size={0.8} />
                        Random Color
                    </Button>
                    {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
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
                    <Button type="submit" disabled={createColor.isPending}>
                        <Icon path={mdiPlus} size={0.8} />
                        {createColor.isPending ? "Đang xử lý..." : "Thêm màu sắc"}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
