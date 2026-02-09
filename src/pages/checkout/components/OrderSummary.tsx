import { Icon } from "@mdi/react";
import { mdiShoppingOutline } from "@mdi/js";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { checkImageUrl } from "@/lib/utils";
import { getSizeLabel } from "@/utils/sizeMapping";
import { formatPrice } from "@/utils/formatters";
import { useCartStore } from "@/stores/useCartStore";

export const OrderSummary = () => {
    const {
        items,
        subtotal,
        tax,
        shipping,
        total,
        appliedVoucher,
        voucherDiscount,
    } = useCartStore();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                        <Icon
                            path={mdiShoppingOutline}
                            size={0.8}
                            className="text-primary"
                        />
                    </div>
                    <span>Đơn hàng của bạn</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                            <div className="w-20 h-20 bg-muted rounded relative overflow-hidden">
                                <img
                                    src={checkImageUrl(item.image)}
                                    alt={item.name}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-maintext">{item.name}</h4>
                                <p className="text-sm text-gray-600">
                                    {item.brand}
                                    {item.size &&
                                        ` • Size ${getSizeLabel(Number(item.size))}`}
                                </p>
                                <div className="flex justify-between mt-2 text-maintext">
                                    <span>x{item.quantity}</span>
                                    <span className="text-maintext">
                                        {formatPrice(item.price)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <div className="flex justify-between w-full">
                    <span className="text-gray-600 font-semibold text-sm">
                        Tạm tính
                    </span>
                    <span className="text-maintext">
                        {formatPrice(subtotal + voucherDiscount)}
                    </span>
                </div>

                {appliedVoucher && voucherDiscount > 0 && (
                    <div className="flex justify-between w-full text-green-600">
                        <span className="text-sm font-semibold">
                            Giảm giá voucher ({appliedVoucher.code})
                        </span>
                        <span>-{formatPrice(voucherDiscount)}</span>
                    </div>
                )}

                <div className="flex justify-between w-full">
                    <span className="text-gray-600 font-semibold text-sm">
                        Thuế
                    </span>
                    <span className="text-maintext">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between w-full">
                    <span className="text-gray-600 font-semibold text-sm">
                        Phí vận chuyển
                    </span>
                    <span className="text-maintext">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between w-full text-base font-semibold text-maintext pt-2 border-t">
                    <span>Tổng cộng</span>
                    <span className="text-lg text-primary font-semibold">
                        {formatPrice(total)}
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
};
