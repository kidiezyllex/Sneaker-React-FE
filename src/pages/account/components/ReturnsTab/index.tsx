import { useState } from "react";
import { Icon } from "@mdi/react";
import {
  mdiKeyboardReturn,
  mdiEye,
  mdiFilterOutline,
} from "@mdi/js";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useMyReturns } from "@/hooks/return";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/utils/formatters";
import { IReturn } from "@/interface/response/return";
import { ReturnStatusBadge } from "../components/Badges";
import ReturnDetailDialog from "./ReturnDetailDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ReturnStatus = "ALL" | "CHO_XU_LY" | "DA_HOAN_TIEN" | "DA_HUY";

const STATUS_OPTIONS: { value: ReturnStatus; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "CHO_XU_LY", label: "Chờ xử lý" },
  { value: "DA_HOAN_TIEN", label: "Đã hoàn tiền" },
  { value: "DA_HUY", label: "Đã hủy" },
];

const ITEMS_PER_PAGE = 10;

// Parse items JSON string và trả về mảng
const parseReturnItems = (items: any): any[] => {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Lấy variant data từ originalOrder.items theo variantId
const findVariantFromOrder = (
  orderItems: any[],
  variantId: number | string
): any | null => {
  if (!orderItems || !variantId) return null;
  const found = orderItems.find(
    (oi: any) => String(oi.variant?.id) === String(variantId)
  );
  return found?.variant || null;
};

const ReturnsTab = () => {
  const [statusFilter, setStatusFilter] = useState<ReturnStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [returnDetailOpen, setReturnDetailOpen] = useState(false);

  const {
    data: returnsData,
    isLoading,
    isError,
    refetch,
  } = useMyReturns({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const handleViewReturnDetails = (returnId: string) => {
    setSelectedReturnId(returnId);
    setReturnDetailOpen(true);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as ReturnStatus);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = returnsData?.data?.totalPages || 1;
  const currentPageNum = (returnsData?.data?.number ?? 0) + 1;

  const returns: IReturn[] = returnsData?.data?.content || [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon
                  path={mdiKeyboardReturn}
                  size={0.8}
                  className="text-primary"
                />
              </div>
              <span>Đơn trả hàng của bạn</span>
            </CardTitle>

            {/* Filter theo trạng thái */}
            <div className="flex items-center gap-2">
              <Icon
                path={mdiFilterOutline}
                size={0.7}
                className="text-gray-400 shrink-0"
              />
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Lọc trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Mã trả hàng", "Ngày tạo", "Đơn gốc", "Sản phẩm", "Hoàn tiền", "Trạng thái", ""].map(
                      (h, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                      )
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-red-500">
                Đã xảy ra lỗi khi tải đơn trả hàng.
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : returns.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  path={mdiKeyboardReturn}
                  size={1.2}
                  className="text-gray-400"
                />
              </div>
              <p className="text-gray-600 font-medium mb-1">
                {statusFilter === "ALL"
                  ? "Bạn chưa có đơn trả hàng nào."
                  : `Không có đơn trả hàng ở trạng thái "${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}".`}
              </p>
              {statusFilter !== "ALL" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setStatusFilter("ALL")}
                >
                  Xem tất cả
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-3 py-2">Mã trả hàng</TableHead>
                    <TableHead className="px-3 py-2">Ngày tạo</TableHead>
                    <TableHead className="px-3 py-2">Đơn hàng gốc</TableHead>
                    <TableHead className="px-3 py-2">Sản phẩm trả</TableHead>
                    <TableHead className="px-3 py-2">Lý do</TableHead>
                    <TableHead className="text-right px-3 py-2">
                      Tiền hoàn
                    </TableHead>
                    <TableHead className="px-3 py-2">Trạng thái</TableHead>
                    <TableHead className="text-center px-3 py-2">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((returnItem: IReturn) => {
                    // Parse items JSON string
                    const returnItems = parseReturnItems(returnItem.items);
                    const orderItems = returnItem.originalOrder?.items || [];

                    return (
                      <TableRow key={returnItem.id}>
                        {/* Mã trả hàng */}
                        <TableCell className="font-medium px-3 py-2 text-maintext whitespace-nowrap">
                          {returnItem.code}
                        </TableCell>

                        {/* Ngày tạo */}
                        <TableCell className="px-3 py-2 text-maintext whitespace-nowrap">
                          {returnItem.createdAt
                            ? format(
                              new Date(returnItem.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )
                            : "—"}
                        </TableCell>

                        {/* Đơn hàng gốc */}
                        <TableCell className="px-3 py-2 font-medium text-maintext whitespace-nowrap">
                          {typeof returnItem.originalOrder === "object"
                            ? returnItem.originalOrder.code
                            : returnItem.originalOrder}
                        </TableCell>

                        {/* Ảnh sản phẩm trả — match variantId từ items JSON với originalOrder.items */}
                        <TableCell className="px-3 py-2">
                          <div className="flex gap-1 flex-wrap">
                            {returnItems.slice(0, 3).map(
                              (ri: any, idx: number) => {
                                // Lấy variantId từ item: ưu tiên variantId, rồi productVariantId
                                const variantId =
                                  ri.variantId ?? ri.productVariantId;
                                const variant = findVariantFromOrder(
                                  orderItems,
                                  variantId
                                );
                                const imageUrl =
                                  variant?.images?.[0]?.imageUrl;
                                const colorName = variant?.color?.name || "";
                                const sizeValue = variant?.size?.value;
                                const tooltip = [
                                  colorName,
                                  sizeValue ? `Size ${sizeValue}` : "",
                                ]
                                  .filter(Boolean)
                                  .join(" / ");

                                return (
                                  <div key={idx} className="relative">
                                    <img
                                      src={
                                        imageUrl || "/images/white-image.png"
                                      }
                                      alt={`Sản phẩm ${idx + 1}`}
                                      className="w-12 h-12 object-contain rounded-lg border bg-white"
                                      title={
                                        tooltip ||
                                        `Variant #${variantId || "N/A"}`
                                      }
                                    />
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                      {ri.quantity || 1}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                            {returnItems.length > 3 && (
                              <div className="w-12 h-12 bg-muted rounded-lg border flex items-center justify-center text-xs text-gray-600 font-medium">
                                +{returnItems.length - 3}
                              </div>
                            )}
                            {returnItems.length === 0 && (
                              <span className="text-xs text-gray-400 italic">
                                Không có
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Lý do */}
                        <TableCell className="px-3 py-2 max-w-[160px]">
                          <p
                            className="text-sm text-maintext line-clamp-2"
                            title={returnItem.reason}
                          >
                            {returnItem.reason || "—"}
                          </p>
                        </TableCell>

                        {/* Tiền hoàn */}
                        <TableCell className="text-right font-semibold px-3 py-2 text-primary whitespace-nowrap">
                          {formatPrice(returnItem.totalRefund)}
                        </TableCell>

                        {/* Trạng thái */}
                        <TableCell className="px-3 py-2">
                          <ReturnStatusBadge status={returnItem.status} />
                        </TableCell>

                        {/* Thao tác */}
                        <TableCell className="text-center px-3 py-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleViewReturnDetails(
                                returnItem.id.toString()
                              )
                            }
                            title="Xem chi tiết"
                          >
                            <Icon path={mdiEye} size={0.8} />
                          </Button>
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
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPageNum === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết trả hàng */}
      <ReturnDetailDialog
        returnId={selectedReturnId}
        open={returnDetailOpen}
        onOpenChange={setReturnDetailOpen}
        onCancel={() => refetch()}
      />
    </>
  );
};

export default ReturnsTab;
