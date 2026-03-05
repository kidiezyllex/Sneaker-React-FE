import { Icon } from "@mdi/react";
import {
  mdiAccount,
  mdiDelete,
  mdiCashMultiple,
  mdiBankTransfer,
  mdiTag,
  mdiContentCopy,
  mdiMinus,
  mdiPlus,
  mdiCartOutline,
} from "@mdi/js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { POSCartItem } from "@/stores/usePOSCartStore";
import { PendingCart } from "@/stores/usePendingCartsStore";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useAccounts } from "@/hooks/account";

interface POSRightSectionProps {
  cartItems: POSCartItem[];
  subtotal: number;
  total: number;
  discount: number;
  appliedVoucher: any;
  couponCode: string;
  setCouponCode: (code: string) => void;
  onApplyCoupon: () => void;
  onRemoveCartItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  selectedUserId: string;
  onUserSelect: (id: string, user?: any) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  cashReceived: number | string;
  setCashReceived: (value: number | string) => void;
  changeDue: number;
  onCheckout: () => void;
  checkoutIsLoading: boolean;
  activeCartId: string | null;
  pendingCarts: PendingCart[];
}

export default function POSRightSection({
  cartItems,
  subtotal,
  total,
  discount,
  appliedVoucher,
  couponCode,
  setCouponCode,
  onApplyCoupon,
  onRemoveCartItem,
  onUpdateQuantity,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  selectedUserId,
  onUserSelect,
  paymentMethod,
  setPaymentMethod,
  cashReceived,
  setCashReceived,
  changeDue,
  onCheckout,
  checkoutIsLoading,
  activeCartId,
  pendingCarts,
}: POSRightSectionProps) {
  const { data: usersData } = useAccounts({ limit: 100, role: 'CUSTOMER' });

  const activeCartName =
    pendingCarts.find((c) => c.id === activeCartId)?.name ||
    "Giỏ hàng hiện tại";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-border/50 overflow-hidden">
      {/* Header Giỏ hàng */}
      <div className="p-4 bg-gray-50 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
          <Icon path={mdiCartOutline} size={0.8} />
          {activeCartName}
          <Badge variant="default" showIcon={false}>
            {cartItems.length}
          </Badge>
        </h3>
      </div>

      {/* Danh sách sản phẩm trong giỏ */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
        <ScrollArea className="flex-1 p-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-10">
              <Icon path={mdiCartOutline} size={3} className="opacity-20" />
              <p>Chưa có sản phẩm nào trong giỏ hàng</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-white p-3 rounded-md border border-border hover:shadow-md transition-all duration-200 group relative"
                >
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-primary text-wrap line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemoveCartItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 absolute top-2 right-2"
                        >
                          <Icon path={mdiDelete} size={0.8} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Badge variant="outline">Size: {item.sizeName}</Badge>
                        <Badge variant="outline">
                          <span
                            className="w-2 h-2 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.colorCode }}
                          />
                          {item.colorName}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex gap-1 items-center justify-between">
                        <span className="font-semibold text-sm">Số lượng: </span>
                        <div className="flex items-center gap-2 border rounded-md bg-gray-50 h-8">
                          <button
                            className="h-full w-8 flex items-center justify-center hover:bg-gray-200 rounded-l-md transition-colors text-gray-600"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                          >
                            <Icon path={mdiMinus} size={0.8} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            className="h-full w-8 flex items-center justify-center hover:bg-gray-200 rounded-r-md transition-colors text-gray-600"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Icon path={mdiPlus} size={0.8} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center justify-between">
                        <span className="font-semibold text-sm">Giá tiền: </span>
                        <div className="font-semibold text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        {item.price !== item.originalPrice && item.originalPrice && (
                          <div className="text-sm text-gray-400 line-through">
                            {formatCurrency(item.originalPrice * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="p-4 bg-white border-t border-border space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-1 font-semibold text-primary">
            <Icon path={mdiAccount} size={0.8} />
            Thông tin khách hàng
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Select
              value={selectedUserId}
              onValueChange={(val) => {
                const user = usersData?.data?.content?.find((u: any) => u.id === val);
                onUserSelect(val, user);
              }}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Chọn khách hàng (Không bắt buộc)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest" className="font-semibold text-primary">
                  Khách vãng lai (Nhập tay)
                </SelectItem>
                <Separator className="my-1" />
                {usersData?.data?.content && usersData.data.content.length > 0 ? (
                  usersData.data.content.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} - {user.phoneNumber}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-customers" disabled>
                    Không có dữ liệu khách hàng
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Label>Họ tên: </Label>
              <Input
                placeholder="Họ tên khách hàng"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={selectedUserId !== "guest"}
              />
            </div>
            <div className="flex items-center gap-1">
              <Label>Số điện thoại: </Label>
              <Input
                placeholder="Số điện thoại"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={selectedUserId !== "guest"}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Mã giảm giá */}
        <div className="space-y-3">
          <div className="flex items-center gap-1 font-semibold text-primary">
            <Icon path={mdiTag} size={0.8} />
            Mã giảm giá
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Icon
                path={mdiContentCopy}
                size={0.8}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Nhập mã giảm giá"
                className="pl-9 h-10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
            </div>
            <Button
              onClick={onApplyCoupon}
              disabled={!couponCode}
              variant="secondary"
              className="text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20"
            >
              Áp dụng
            </Button>
          </div>
        </div>

        <Separator />

        {/* Thanh toán */}
        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span className="font-semibold text-sm">Tạm tính</span>
              <span className="font-semibold text-maintext text-sm">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {(discount > 0 || appliedVoucher) && (
              <div className="flex justify-between text-green-600">
                <div className="flex items-center gap-1">
                  <span>Giảm giá</span>
                  {appliedVoucher && (
                    <Badge variant="success" showIcon={false}>
                      {appliedVoucher.code}
                    </Badge>
                  )}
                </div>
                <span className="font-medium">-{formatCurrency(discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-maintext">Tổng tiền</span>
              <span className="text-primary text-xl">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <Tabs
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-10">
              <TabsTrigger
                value="cash"
                className="flex gap-2 items-center text-sm"
              >
                <Icon path={mdiCashMultiple} size={0.8} /> Tiền mặt
              </TabsTrigger>
              <TabsTrigger
                value="banking"
                className="flex gap-2 items-center text-sm"
              >
                <Icon path={mdiBankTransfer} size={0.8} /> Chuyển khoản
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {paymentMethod === "cash" && (
            <div className="space-y-3 bg-gray-50 p-3 rounded-md border border-border/50">
              <div className="space-y-2">
                <Label>
                  Tiền khách đưa:
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="pr-12 text-right font-medium text-lg h-11"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium text-sm">
                    VND
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <Label>
                  Tiền thừa
                </Label>
                <span className="font-semibold text-lg text-primary">
                  {formatCurrency(changeDue)}
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={onCheckout}
            disabled={
              checkoutIsLoading ||
              cartItems.length === 0 ||
              (paymentMethod === "cash" && (Number(cashReceived) < total || !cashReceived))
            }
          >
            {checkoutIsLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `Thanh toán ${formatCurrency(total)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
