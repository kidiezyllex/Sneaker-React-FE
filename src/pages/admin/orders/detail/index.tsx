"use client";

import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";

export default function AdminOrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/admin/orders")}
                    className="gap-2"
                >
                    <Icon path={mdiArrowLeft} size={0.8} />
                    Quay lại
                </Button>
                <h1 className="text-2xl font-semibold text-white">
                    Chi tiết đơn hàng #{orderId}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thông tin đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Trang chi tiết đơn hàng đang được phát triển</p>
                        <p className="text-sm mt-2">Order ID: {orderId}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
