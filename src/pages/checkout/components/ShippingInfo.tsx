import { Icon } from "@mdi/react";
import {
    mdiTruckDeliveryOutline,
    mdiCartOutline,
    mdiLoading,
    mdiCheck,
} from "@mdi/js";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { useUserProfile } from "@/hooks/account";

interface ShippingInfoProps {
    isProcessing: boolean;
    provinces: any[];
    districts: any[];
    wards: any[];
    loadingProvinces: boolean;
    loadingDistricts: boolean;
    loadingWards: boolean;
    selectedProvince: string;
    selectedDistrict: string;
    handleContinueShopping: () => void;
}

export const ShippingInfo = ({
    isProcessing,
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    selectedProvince,
    selectedDistrict,
    handleContinueShopping,
}: ShippingInfoProps) => {
    const { control } = useFormContext();
    const { data: userProfile } = useUserProfile();

    const isFieldDisabled = (fieldName: string) => {
        if (!userProfile?.data) return false;
        const profile = userProfile.data;

        switch (fieldName) {
            case "fullName":
                return !!profile.fullName;
            case "email":
                return !!profile.email;
            case "phoneNumber":
                return !!profile.phoneNumber;
            case "address":
                return !!profile.addresses?.[0]?.specificAddress;
            case "province":
            case "district":
            case "ward":
                return false;
            default:
                return false;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                        <Icon
                            path={mdiTruckDeliveryOutline}
                            size={0.8}
                            className="text-primary"
                        />
                    </div>
                    <span>Thông tin giao hàng</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-maintext font-semibold">
                                    Họ tên
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nguyễn Văn A"
                                        {...field}
                                        disabled={isFieldDisabled("fullName")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-maintext font-semibold">
                                    Số điện thoại
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isFieldDisabled("phoneNumber")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-maintext font-semibold">
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ví dụ: example@gmail.com"
                                        {...field}
                                        disabled={isFieldDisabled("email")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="province"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-maintext font-semibold">
                                    Tỉnh/Thành phố
                                </FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={
                                            isFieldDisabled("province") || loadingProvinces
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={
                                                    loadingProvinces
                                                        ? "Đang tải..."
                                                        : "Chọn tỉnh/thành phố"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {provinces.map((province) => (
                                                <SelectItem
                                                    key={province.code}
                                                    value={province.code.toString()}
                                                >
                                                    {province.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="district"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-maintext font-semibold">
                                    Quận/Huyện
                                </FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={
                                            isFieldDisabled("district") ||
                                            !selectedProvince ||
                                            loadingDistricts
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={
                                                    !selectedProvince
                                                        ? "Vui lòng chọn tỉnh/thành phố trước"
                                                        : loadingDistricts
                                                            ? "Đang tải..."
                                                            : "Chọn quận/huyện"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map((district) => (
                                                <SelectItem
                                                    key={district.code}
                                                    value={district.code.toString()}
                                                >
                                                    {district.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="ward"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-maintext font-semibold">
                                    Phường/Xã
                                </FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={
                                            isFieldDisabled("ward") ||
                                            !selectedDistrict ||
                                            loadingWards
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={
                                                    !selectedDistrict
                                                        ? "Vui lòng chọn quận/huyện trước"
                                                        : loadingWards
                                                            ? "Đang tải..."
                                                            : "Chọn phường/xã"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wards.map((ward) => (
                                                <SelectItem
                                                    key={ward.code}
                                                    value={ward.code.toString()}
                                                >
                                                    {ward.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-maintext font-semibold">
                                    Địa chỉ cụ thể
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Số nhà, tên đường..."
                                        {...field}
                                        disabled={isFieldDisabled("address")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-maintext font-semibold">
                                    Phương thức thanh toán
                                </FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={field.disabled}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn phương thức thanh toán" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="COD">
                                                Thanh toán khi nhận hàng (COD)
                                            </SelectItem>
                                            <SelectItem value="BANK_TRANSFER">
                                                Thanh toán qua VNPay
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleContinueShopping}
                            disabled={isProcessing}
                        >
                            <Icon path={mdiCartOutline} size={0.8} />
                            Tiếp tục mua hàng
                        </Button>
                        <Button
                            type="submit"
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? (
                                <>
                                    <Icon path={mdiLoading} size={0.8} spin className="animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Icon path={mdiCheck} size={0.8} />
                                    Hoàn tất đặt hàng
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
