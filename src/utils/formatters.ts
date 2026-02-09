export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
};

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateString));
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  return phone;
};

export const formatStockStatus = (stock: number): { text: string; className: string } => {
  if (stock <= 0) {
    return { text: 'Hết hàng', className: 'text-red-500' };
  } else if (stock <= 5) {
    return { text: `Còn ${stock} sản phẩm`, className: 'text-orange-500' };
  } else if (stock <= 10) {
    return { text: `Sắp hết hàng (${stock})`, className: 'text-yellow-600' };
  } else {
    return { text: 'Còn hàng', className: 'text-green-500' };
  }
};

export const formatDiscountValue = (
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT',
  discountValue: number
): string => {
  if (discountType === 'PERCENTAGE') {
    return `${discountValue}%`;
  }
  return formatCurrency(discountValue);
};

export const getPaymentMethodName = (method: string): string => {
  const methods: Record<string, string> = {
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    COD: 'Thanh toán khi nhận hàng',
    VNPAY: 'Thanh toán qua VNPay',
    MIXED: 'Thanh toán nhiều phương thức',
  };
  return methods[method] || method;
};

export const getPaymentStatusName = (status: string): string => {
  const statuses: Record<string, string> = {
    PENDING: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    FAILED: 'Thanh toán thất bại',
    REFUNDED: 'Đã hoàn tiền',
    PARTIAL_PAID: 'Thanh toán một phần',
  };
  return statuses[status] || status;
};

export const getOrderStatusName = (status: string): string => {
  const statuses: Record<string, string> = {
    CHO_XAC_NHAN: 'Chờ xác nhận',
    CHO_GIAO_HANG: 'Chờ giao hàng',
    DANG_VAN_CHUYEN: 'Đang vận chuyển',
    DA_GIAO_HANG: 'Đã giao hàng',
    HOAN_THANH: 'Hoàn thành',
    DA_HUY: 'Đã hủy',
  };
  return statuses[status] || status;
};

export const getReturnStatusName = (status: string): string => {
  const statuses: Record<string, string> = {
    CHO_XU_LY: 'Chờ xử lý',
    DA_HOAN_TIEN: 'Đã hoàn tiền',
    DA_HUY: 'Đã hủy',
  };
  return statuses[status] || status;
};