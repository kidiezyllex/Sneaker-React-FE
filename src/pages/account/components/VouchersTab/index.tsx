import React, { useState } from "react";
import { Icon } from "@mdi/react";
import {
  mdiTicketPercentOutline,
  mdiAlertCircleOutline,
  mdiContentCopy,
  mdiEye,
  mdiInformationOutline,
  mdiCalendar,
  mdiCurrencyUsd,
  mdiClockOutline,
} from "@mdi/js";
import { toast } from "react-toastify";
import { useUser } from "@/context/useUserContext";
import { useAvailableVouchersForUser } from "@/hooks/voucher";
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
          <CardDescription>
            Danh sách các mã giảm giá bạn có thể sử dụng để tiết kiệm khi mua sắm.
          </CardDescription>
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

      {/* Voucher Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent size="4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon
                path={mdiInformationOutline}
                size={0.8}
                className="text-primary"
              />
              Chi tiết mã giảm giá
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về mã giảm giá {selectedVoucher?.code}
            </DialogDescription>
          </DialogHeader>

          {selectedVoucher && (
            <div className="space-y-4 p-4">
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Icon path={mdiTicketPercentOutline} size={4} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-primary mb-1">
                    {selectedVoucher.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Mã:</span>
                    <Badge
                      variant="secondary"
                      className="font-mono text-lg px-3 py-1"
                    >
                      {selectedVoucher.code}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleCopyCode(e, selectedVoucher.code)}
                    >
                      <Icon path={mdiContentCopy} size={0.8} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Icon path={mdiCurrencyUsd} size={0.8} />
                    Giá trị giảm
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatDiscountValue(
                      selectedVoucher.type,
                      selectedVoucher.value
                    )}
                  </div>
                </div>
                {selectedVoucher.type === "PERCENTAGE" &&
                  selectedVoucher.maxDiscount && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Icon path={mdiInformationOutline} size={0.8} />
                        Giảm tối đa
                      </div>
                      <div className="text-lg font-bold">
                        {formatPrice(selectedVoucher.maxDiscount)}
                      </div>
                    </div>
                  )}
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Icon path={mdiClockOutline} size={0.8} />
                    Đơn tối thiểu
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {formatPrice(selectedVoucher.minOrderValue || 0)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Icon path={mdiCalendar} size={0.8} />
                    Lượt còn lại
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {selectedVoucher.quantity - selectedVoucher.usedCount}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Ngày bắt đầu:</span>
                  <span className="font-medium">
                    {formatDate(selectedVoucher.startDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Ngày kết thúc:</span>
                  <span className="font-medium">
                    {formatDate(selectedVoucher.endDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span>
                    {new Date(selectedVoucher.endDate) < new Date() ? (
                      <Badge variant="destructive">Hết hạn</Badge>
                    ) : selectedVoucher.status === "ACTIVE" ? (
                      <Badge>Hoạt động</Badge>
                    ) : (
                      <Badge variant="secondary">Ngừng hoạt động</Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VouchersTab;
