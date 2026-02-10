import React, { useState } from "react";
import { Icon } from "@mdi/react";
import {
  mdiTicketPercentOutline,
  mdiAlertCircleOutline,
  mdiContentCopy,
  mdiEye,
  mdiInformationOutline,
  mdiCalendar,
  mdiClockOutline,
  mdiTrophyOutline,
  mdiCartOutline,
} from "@mdi/js";
import { toast } from "react-toastify";
import { useUser } from "@/context/useUserContext";
import { useAvailableVouchersForUser } from "@/hooks/voucher";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { IVoucher } from "@/interface/response/voucher";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/utils/formatters";

const VouchersTab = () => {
  const { profile } = useUser();
  const userId = profile?.data?.id;
  const {
    data: vouchersData,
    isLoading,
    isError,
  } = useAvailableVouchersForUser(`${userId || ""}`, {});

  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDiscountValue = (
    type: "PERCENTAGE" | "FIXED_AMOUNT",
    value: number
  ) => {
    if (type === "PERCENTAGE") {
      return `${value}%`;
    }
    return formatPrice(value);
  };

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(code)
      .then(() => {
        toast.success(`Đã sao chép mã: ${code}`);
      })
      .catch(() => {
        toast.error("Không thể sao chép mã giảm giá.");
      });
  };

  const handleViewDetail = (voucher: IVoucher) => {
    setSelectedVoucher(voucher);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(8)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon
                path={mdiAlertCircleOutline}
                size={0.8}
                className="text-primary"
              />
            </div>
            <span>Lỗi tải mã giảm giá</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            Đã xảy ra lỗi khi tải danh sách mã giảm giá của bạn. Vui lòng thử
            lại sau.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle both paginated and direct array response structures
  const vouchers = Array.isArray(vouchersData?.data)
    ? vouchersData.data
    : vouchersData?.data && "vouchers" in vouchersData.data
      ? (vouchersData.data as any).vouchers
      : [];

  // Pagination calculations
  const totalPages = Math.ceil((vouchers?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVouchers = vouchers?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!vouchers || vouchers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon
                path={mdiTicketPercentOutline}
                size={0.8}
                className="text-primary"
              />
            </div>
            <span>Mã giảm giá</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Bạn không có mã giảm giá nào hiện có.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon
                path={mdiTicketPercentOutline}
                size={0.8}
                className="text-primary"
              />
            </div>
            <span>Mã giảm giá của bạn</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Giá trị giảm</TableHead>
                <TableHead>Đơn tối thiểu</TableHead>
                <TableHead>Hạn dùng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentVouchers.map((voucher: IVoucher, index: number) => {
                const isExpired = new Date(voucher.endDate) < new Date();
                const isActive = voucher.status === "ACTIVE" && !isExpired;
                const globalIndex = startIndex + index;

                return (
                  <TableRow
                    key={voucher.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewDetail(voucher)}
                  >
                    <TableCell className="font-medium">
                      {globalIndex + 1}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {voucher.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {voucher.name}
                    </TableCell>
                    <TableCell className="text-primary font-semibold">
                      {formatDiscountValue(voucher.type, voucher.value)}
                    </TableCell>
                    <TableCell>
                      {formatPrice(voucher.minOrderValue || 0)}
                    </TableCell>
                    <TableCell>{formatDate(voucher.endDate)}</TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="destructive">Hết hạn</Badge>
                      ) : voucher.status === "ACTIVE" ? (
                        <Badge>Đang hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary">Ngừng hoạt động</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetail(voucher)}
                          title="Xem chi tiết"
                        >
                          <Icon path={mdiEye} size={0.8} />
                        </Button>
                        {isActive && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => handleCopyCode(e, voucher.code)}
                            title="Sao chép mã"
                          >
                            <Icon path={mdiContentCopy} size={0.8} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent size="4xl" className="p-0 overflow-hidden border-none">
          {selectedVoucher && (
            <div className="flex flex-col md:flex-row h-full">
              <div className="bg-primary p-8 flex flex-col items-center justify-center text-white relative min-w-[240px] md:rounded-l-lg overflow-hidden">
                {/* Decorative circles for coupon effect */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full hidden md:block"></div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full hidden md:block"></div>

                <div className="p-4 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                  <Icon path={mdiTicketPercentOutline} size={3} />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Mã giảm giá</span>
                  <div className="text-3xl font-black">
                    {formatDiscountValue(selectedVoucher.type, selectedVoucher.value)}
                  </div>
                  <p className="text-xs opacity-70 italic">Chi tiêu tối thiểu {formatPrice(selectedVoucher.minOrderValue || 0)}</p>
                </div>

                {/* Vertical Dashed Line Divider for MD+ */}
                <div className="absolute right-0 top-0 bottom-0 w-px border-r border-dashed border-white/30 hidden md:block"></div>
              </div>

              {/* Right side - Details */}
              <div className="flex-1 bg-white p-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                          {selectedVoucher.name}
                        </h2>
                        {new Date(selectedVoucher.endDate) < new Date() ? (
                          <Badge variant="destructive" className="animate-pulse">Hết hạn</Badge>
                        ) : selectedVoucher.status === "ACTIVE" ? (
                          <Badge variant="default">Đang hoạt động</Badge>
                        ) : (
                          <Badge variant="secondary">Ngừng hoạt động</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="bg-gray-100 flex items-center px-4 h-10 rounded-md border border-dashed border-gray-300">
                          <span className="font-mono text-lg font-bold text-gray-700 tracking-wider">
                            {selectedVoucher.code}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleCopyCode(e, selectedVoucher.code)}
                        >
                          <Icon path={mdiContentCopy} size={0.8} />
                          Sao chép
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-8 pt-2">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon path={mdiTrophyOutline} size={0.8} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Giảm tối đa</p>
                        <p className="font-bold text-gray-900">
                          {selectedVoucher.type === "PERCENTAGE" && selectedVoucher.maxDiscount
                            ? formatPrice(selectedVoucher.maxDiscount)
                            : "Không giới hạn"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Icon path={mdiCartOutline} size={0.8} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Lượt sử dụng còn</p>
                        <p className="font-bold text-gray-900">
                          {selectedVoucher.quantity - (selectedVoucher.usedCount || 0)} / {selectedVoucher.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Icon path={mdiCalendar} size={0.8} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Hạn sử dụng</p>
                        <p className="font-bold text-gray-900">
                          {formatDate(selectedVoucher.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Icon path={mdiClockOutline} size={0.8} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Ngày bắt đầu</p>
                        <p className="font-bold text-gray-900">
                          {formatDate(selectedVoucher.startDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                      <Icon path={mdiInformationOutline} size={0.8} />
                      Điều kiện áp dụng
                    </div>
                    <ul className="text-xs text-amber-700/80 space-y-1 list-disc list-inside ml-1">
                      <li>Áp dụng cho đơn hàng có giá trị từ {formatPrice(selectedVoucher.minOrderValue || 0)}</li>
                      <li>Mỗi khách hàng chỉ được sử dụng tối đa 1 lần</li>
                      {selectedVoucher.type === "PERCENTAGE" && <li>Giảm tối đa {formatPrice(selectedVoucher.maxDiscount || 0)} cho mỗi đơn hàng</li>}
                      <li>Voucher không có giá trị quy đổi thành tiền mặt</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VouchersTab;
