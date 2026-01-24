"use client";

import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";

export default function AdminPromotionEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/admin/discounts/promotions")}
                    className="gap-2"
                >
                    <Icon path={mdiArrowLeft} size={0.8} />
                    Quay lại
                </Button>
                <h1 className="text-2xl font-semibold text-white">
                    Chỉnh sửa đợt khuyến mãi #{id}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thông tin khuyến mãi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-gray-600">
                        <p>Trang chỉnh sửa khuyến mãi đang được phát triển</p>
                        <p className="text-sm mt-2">ID: {id}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
