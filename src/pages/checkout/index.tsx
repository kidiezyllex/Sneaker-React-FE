"use client";

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomToast } from "@/components/ui/custom-toast";
import { useCartStore } from "@/stores/useCartStore";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formatPrice } from "@/utils/formatters";
import { useCreateOrder } from "@/hooks/order";
import { useUser } from "@/context/useUserContext";
import { useCreateNotification } from "@/hooks/notification";
import { useUserProfile } from "@/hooks/account";
import VNPayModal from "./components/VNPayModal";
import { ShippingInfo } from "./components/ShippingInfo";
import { OrderSummary } from "./components/OrderSummary";
import { useAddressSelection } from "@/hooks/useAddressSelection";

const shippingFormSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành"),
  district: z.string().min(1, "Vui lòng chọn quận/huyện"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

export default function ShippingPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    items,
    clearCart,
    appliedVoucher,
    voucherDiscount,
    removeVoucher,
    subtotal,
    tax,
    shipping,
    total,
  } = useCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [vnpayOrderData, setVnpayOrderData] = useState<any>(null);

  const createOrderMutation = useCreateOrder();
  const createNotificationMutation = useCreateNotification();
  const { data: userProfile } = useUserProfile();

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      province: "",
      district: "",
      ward: "",
      paymentMethod: "COD",
    },
  });

  const addressData = useAddressSelection(form);

  useEffect(() => {
    if (userProfile?.data) {
      const profile = userProfile.data;
      form.reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        address: profile.addresses?.[0]?.specificAddress || "",
        province: profile.addresses?.[0]?.provinceId || "",
        district: profile.addresses?.[0]?.districtId || "",
        ward: profile.addresses?.[0]?.wardId || "",
        paymentMethod: "COD",
      });
    }
  }, [userProfile, form]);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/");
    } else {
      setIsLoading(false);
    }
  }, [items, navigate]);

  const selectedPaymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    if (selectedPaymentMethod === "BANK_TRANSFER" && !showVNPayModal) {
      setVnpayOrderData({
        orderId: `DEMO_${Date.now()}`,
        amount: total,
        orderInfo: `Thanh toán đơn hàng`,
        orderCode: `ORD${Date.now()}`,
      });
      setShowVNPayModal(true);
    }
  }, [selectedPaymentMethod, total, showVNPayModal]);

  const sendOrderConfirmationEmail = async (
    orderId: string,
    orderData: any,
    userEmail: string
  ) => {
    try {
      const itemsList = items
        .map(
          (item) =>
            `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.size || "N/A"})</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
        </tr>`
        )
        .join("");

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Xác nhận đơn hàng</h2>
          <p>Xin chào <strong>${orderData.shippingAddress.name}</strong>,</p>
          <p>Cảm ơn bạn đã đặt hàng tại Sneaker Store. Dưới đây là chi tiết đơn hàng của bạn:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
            <p><strong>Mã đơn hàng:</strong> ${orderData.code || orderId}</p>
            <p><strong>Ngày đặt hàng:</strong> ${new Date().toLocaleDateString("vi-VN")}</p>
            <p><strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : "Thanh toán qua VNPay"}</p>
          </div>
          
          <h3 style="color: #333;">Chi tiết sản phẩm</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                <th style="padding: 10px;">Số lượng</th>
                <th style="padding: 10px; text-align: right;">Giá</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Tạm tính:</td>
                <td style="padding: 10px; text-align: right;">${formatPrice(subtotal + voucherDiscount)}</td>
              </tr>
              ${appliedVoucher && voucherDiscount > 0 ? `
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; color: #16a34a;">Giảm giá voucher (${appliedVoucher.code}):</td>
                <td style="padding: 10px; text-align: right; color: #16a34a;">-${formatPrice(voucherDiscount)}</td>
              </tr>` : ""}
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Thuế:</td>
                <td style="padding: 10px; text-align: right;">${formatPrice(tax)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Phí vận chuyển:</td>
                <td style="padding: 10px; text-align: right;">${formatPrice(shipping)}</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">${formatPrice(total)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #333;">Thông tin giao hàng</h3>
            <p><strong>Người nhận:</strong> ${orderData.shippingAddress.name}</p>
            <p><strong>Số điện thoại:</strong> ${orderData.shippingAddress.phoneNumber}</p>
            <p><strong>Địa chỉ:</strong> ${orderData.shippingAddress.specificAddress}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #777;">
            <p>© 2023 Sneaker Store. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      `;

      await createNotificationMutation.mutateAsync({
        type: "EMAIL",
        title: `Xác nhận đơn hàng ${orderData.code || orderId}`,
        content: emailContent,
        recipients: [userEmail, "buitranthienan1111@gmail.com"],
        relatedTo: "ORDER",
        relatedId: orderId,
      });
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }
  };

  const onSubmit = async (values: ShippingFormValues) => {
    try {
      setIsProcessing(true);
      if (values.paymentMethod === "BANK_TRANSFER") {
        setVnpayOrderData({
          orderId: `DEMO_${Date.now()}`,
          amount: total,
          orderInfo: `Thanh toán đơn hàng`,
          orderCode: `ORD${Date.now()}`,
        });
        setShowVNPayModal(true);
        setIsProcessing(false);
        return;
      }

      const orderData = {
        orderId: `DH${new Date().getFullYear()}${Date.now().toString().slice(-6)}`,
        customerId: user?.id || "000000000000000000000000",
        items: items.map((item) => ({
          product: item.productId || item.id,
          variant: { colorId: item.colorId, sizeId: item.sizeId },
          quantity: item.quantity,
          price: item.price,
        })),
        voucher: appliedVoucher?.voucherId,
        subTotal: Number(subtotal.toFixed(2)),
        discount: Number(voucherDiscount.toFixed(2)),
        total: Number(total.toFixed(2)),
        shippingAddress: {
          name: values.fullName,
          phoneNumber: values.phoneNumber,
          provinceId: values.province,
          districtId: values.district,
          wardId: values.ward,
          specificAddress: `${values.address}, ${addressData.selectedWardName}, ${addressData.selectedDistrictName}, ${addressData.selectedProvinceName}, Việt Nam`,
        },
        paymentMethod: values.paymentMethod,
      };

      const response = await createOrderMutation.mutateAsync(orderData as any);
      if (response?.statusCode === 200 && response.data) {
        clearCart();
        if (appliedVoucher) removeVoucher();
        toast.success(
          <CustomToast
            title={response.message || "Đặt hàng thành công!"}
            description={response.data?.code ? `Mã đơn hàng: #${response.data.code}` : undefined}
            subText="Cảm ơn bạn đã tin tưởng Sneaker Store!"
          />,
          { icon: false }
        );
        await sendOrderConfirmationEmail(String(response.data.id), response.data, values.email);
        navigate("/account#account-tabs?tab=orders");
      } else {
        throw new Error((response as any)?.message || "Đã xảy ra lỗi khi tạo đơn hàng");
      }
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra khi tạo đơn hàng");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVNPaySuccess = async (paymentData: any) => {
    try {
      setShowVNPayModal(false);
      setIsProcessing(true);
      const formValues = form.getValues();

      const orderData = {
        orderId: `DH${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        customerId: user?.id || "000000000000000000000000",
        items: items.map((item) => ({
          product: item.productId || item.id,
          variant: { colorId: item.colorId, sizeId: item.sizeId },
          quantity: item.quantity,
          price: item.price,
        })),
        voucher: appliedVoucher?.voucherId,
        subTotal: Number(subtotal.toFixed(2)),
        discount: Number(voucherDiscount.toFixed(2)),
        total: Number(total.toFixed(2)),
        shippingAddress: {
          name: formValues.fullName,
          phoneNumber: formValues.phoneNumber,
          provinceId: formValues.province,
          districtId: formValues.district,
          wardId: formValues.ward,
          specificAddress: `${formValues.address}, ${addressData.selectedWardName}, ${addressData.selectedDistrictName}, ${addressData.selectedProvinceName}, Việt Nam`,
        },
        paymentMethod: "BANK_TRANSFER",
        paymentInfo: paymentData,
      };

      const response = await createOrderMutation.mutateAsync(orderData as any);
      if (response?.statusCode === 200 && response.data) {
        clearCart();
        if (appliedVoucher) removeVoucher();
        toast.success(
          <CustomToast
            title={response.message || "Thanh toán và đặt hàng thành công!"}
            description={response.data?.code ? `Mã đơn hàng: #${response.data.code}` : undefined}
            subText="Thanh toán qua VNPay đã được ghi nhận."
          />,
          { icon: false }
        );
        await sendOrderConfirmationEmail(String(response.data.id), response.data, formValues.email);
        navigate("/account#account-tabs?tab=orders");
      } else {
        throw new Error((response as any)?.message || "Đã xảy ra lỗi khi tạo đơn hàng");
      }
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra sau khi thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVNPayError = (error: string) => {
    setShowVNPayModal(false);
    toast.error(error);
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8 flex items-center justify-center">
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-8 relative py-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/" className="text-maintext hover:text-maintext">Trang chủ</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-maintext hover:text-maintext" />
          <BreadcrumbItem>
            <Link to="/products" className="text-maintext hover:text-maintext">Sản phẩm</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-maintext hover:text-maintext" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-maintext hover:text-maintext">Thanh toán đơn hàng</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-maintext">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ShippingInfo
              isProcessing={isProcessing}
              handleContinueShopping={() => navigate("/products")}
              {...addressData}
              selectedProvince={form.watch("province")}
              selectedDistrict={form.watch("district")}
            />
          </form>
        </Form>
        <OrderSummary />
      </div>

      <VNPayModal
        isOpen={showVNPayModal}
        onClose={() => setShowVNPayModal(false)}
        orderData={vnpayOrderData || {
          orderId: `TEMP_${Date.now()}`,
          amount: total,
          orderInfo: `Thanh toán đơn hàng`,
          orderCode: `ORD${Date.now()}`,
        }}
        onPaymentSuccess={handleVNPaySuccess}
        onPaymentError={handleVNPayError}
      />
    </div>
  );
}
