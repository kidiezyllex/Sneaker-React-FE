import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Icon } from "@mdi/react";
import { mdiPlus, mdiClose } from "@mdi/js";
import { useCreateMaterial } from "@/hooks/attributes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface CreateMaterialDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateMaterialDialog({ isOpen, onClose }: CreateMaterialDialogProps) {
    const queryClient = useQueryClient();
    const createMaterial = useCreateMaterial();

    const [formData, setFormData] = useState({
        name: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    });

    const [errors, setErrors] = useState({
        name: "",
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
            await createMaterial.mutateAsync(formData, {
                onSuccess: () => {
                    toast.success("Thêm chất liệu thành công");
                    queryClient.invalidateQueries({ queryKey: ["materials"] });
                    setFormData({
                        name: "",
                        status: "ACTIVE",
                    });
                    onClose();
                },
                onError: (error: any) => {
                    toast.error("Thêm chất liệu thất bại: " + error.message);
                },
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DialogContent size="xl">
            <DialogHeader title="Thêm chất liệu mới" icon={mdiPlus} />
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 pb-4 px-4">
                <div className="space-y-2">
                    <FormLabel htmlFor="create-name">Tên chất liệu</FormLabel>
                    <Input
                        id="create-name"
                        name="name"
                        placeholder="Nhập tên chất liệu"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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
                    <Button type="submit" disabled={createMaterial.isPending}>
                        <Icon path={mdiPlus} size={0.8} />
                        {createMaterial.isPending ? "Đang xử lý..." : "Thêm chất liệu"}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
