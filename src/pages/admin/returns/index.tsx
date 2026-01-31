"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@mdi/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useReturns,
  useDeleteReturn,
  useUpdateReturnStatus,
  useReturnStats,
  useSearchReturn,
} from "@/hooks/return";
import { IReturnFilter } from "@/interface/request/return";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import StatusUpdateModal from "@/components/admin/Returns/StatusUpdateModal";
import SearchReturnModal from "@/components/admin/Returns/SearchReturnModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  mdiMagnify,
  mdiDownload,
  mdiPlus,
  mdiFilterOutline,
  mdiCalendar,
  mdiDotsVertical,
  mdiEye,
  mdiPencilCircle,
  mdiCheckCircle,
  mdiDeleteCircle,
  mdiCancel,
  mdiCheck,
} from "@mdi/js";
import { CommonPagination } from "@/components/ui/common-pagination";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
};

const getReturnStatusBadge = (status: string) => {
  switch (status) {
    case "CHO_XU_LY":
      return <Badge variant="warning">Chờ xử lý</Badge>;
    case "DA_HOAN_TIEN":
      return <Badge variant="success">Đã hoàn tiền</Badge>;
    case "DA_HUY":
      return <Badge variant="destructive">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">Không xác định</Badge>;
  }
};

export default function ReturnsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<IReturnFilter>({
    page: 1,
    limit: 5,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const { data, isLoading, isError } = useReturns(filters);
  const deleteReturn = useDeleteReturn();
  const updateStatus = useUpdateReturnStatus();
  const { data: statsData } = useReturnStats();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [returnToDelete, setReturnToDelete] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    isOpen: boolean;
    returnId: string;
    currentStatus: string;
  }>({ isOpen: false, returnId: "", currentStatus: "" });
  const [searchModal, setSearchModal] = useState(false);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        setFilters((prev) => ({ ...prev, page: 1 }));
      } else {
        setFilters({ ...filters, page: 1 });
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    const newStatus = mapTabToStatus(selectedTab);
    if (newStatus) {
      setFilters({ ...filters, status: newStatus, page: 1 });
    } else {
      const { status, ...rest } = filters;
      setFilters({ ...rest, page: 1 });
    }
  }, [selectedTab]);

  const mapTabToStatus = (tab: string) => {
    switch (tab) {
      case "pending":
        return "CHO_XU_LY";
      case "refunded":
        return "DA_HOAN_TIEN";
      case "cancelled":
        return "DA_HUY";
      default:
        return undefined;
    }
  };

  const handleFilterChange = (
    key: keyof IReturnFilter,
    value: string | number | undefined
  ) => {
    if (value === "") {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters({ ...newFilters, page: 1 });
    } else {
      setFilters({ ...filters, [key]: value, page: 1 });
    }
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    const newFilters = { ...filters };

    if (range.from) {
      newFilters.startDate = format(range.from, "yyyy-MM-dd");
    } else {
      delete newFilters.startDate;
    }

    if (range.to) {
      newFilters.endDate = format(range.to, "yyyy-MM-dd");
    } else {
      delete newFilters.endDate;
    }

    setFilters({ ...newFilters, page: 1 });
  };

  const handleDeleteReturn = async (id: string) => {
    try {
      await deleteReturn.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Đã xóa yêu cầu trả hàng thành công");
          queryClient.invalidateQueries({ queryKey: ["returns"] });
          queryClient.invalidateQueries({ queryKey: ["returnStats"] });
          setIsDeleteDialogOpen(false);
          setReturnToDelete(null);
        },
      });
    } catch (error) {
      toast.error("Xóa yêu cầu trả hàng thất bại");
    }
  };

  const handleUpdateStatus = async (
    returnId: string,
    status: "CHO_XU_LY" | "DA_HOAN_TIEN" | "DA_HUY"
  ) => {
    try {
      await updateStatus.mutateAsync(
        {
          returnId,
          payload: { status },
        },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật trạng thái thành công");
            queryClient.invalidateQueries({ queryKey: ["returns"] });
            queryClient.invalidateQueries({ queryKey: ["returnStats"] });
            queryClient.invalidateQueries({ queryKey: ["return", returnId] });
            setStatusUpdateModal({
              isOpen: false,
              returnId: "",
              currentStatus: "",
            });
          },
        }
      );
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleChangePage = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };



  const exportToCSV = () => {
    if (!data?.data.content.length) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    const headers = [
      "Mã yêu cầu",
      "Khách hàng",
      "Đơn hàng gốc",
      "Ngày tạo",
      "Số tiền hoàn trả",
      "Trạng thái",
    ];
    const csvContent = [
      headers.join(","),
      ...data.data.content.map((returnItem) =>
        [
          returnItem.code,
          returnItem.customer.fullName,
          returnItem.originalOrder.code,
          formatDate(returnItem.createdAt),
          returnItem.totalRefund,
          returnItem.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `returns_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link to="/admin/statistics" className="!text-white/80 hover:!text-white">
                Dashboard
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Quản lý trả hàng</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Card className="mb-4">
        <CardContent className="p-4">
          <Tabs defaultValue="all" onValueChange={setSelectedTab}>
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center gap-4 mb-4">
              <TabsList className="h-9">
                <TabsTrigger value="all" className="px-4 text-maintext">
                  Tất cả
                </TabsTrigger>
                <TabsTrigger value="pending" className="px-4 text-maintext">
                  Chờ xử lý
                </TabsTrigger>
                <TabsTrigger value="refunded" className="px-4 text-maintext">
                  Đã hoàn tiền
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="px-4 text-maintext">
                  Đã hủy
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 items-center">
                <div className="relative w-full sm:w-80">
                  <Icon
                    path={mdiMagnify}
                    size={0.8}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-maintext"
                  />
                  <Input
                    placeholder="Tìm theo mã, tên KH, SĐT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center"
                  >
                    <Icon path={mdiFilterOutline} size={0.8} className="mr-2" />
                    Bộ lọc
                    {(filters.customer ||
                      filters.startDate ||
                      filters.endDate) && (
                        <Badge className="ml-1">
                          {
                            [
                              filters.customer,
                              filters.startDate,
                              filters.endDate,
                            ].filter(Boolean).length
                          }
                        </Badge>
                      )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={exportToCSV} title="Xuất CSV">
                    <Icon path={mdiDownload} size={0.8} />
                  </Button>
                  <Link to="/admin/returns/create">
                    <Button className="flex items-center gap-2">
                      <Icon path={mdiPlus} size={0.8} />
                      Tạo yêu cầu
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-50 p-4 rounded-xl mb-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Khách hàng
                      </label>
                      <Input
                        placeholder="Tìm theo tên khách hàng"
                        value={filters.customer || ""}
                        onChange={(e) =>
                          handleFilterChange("customer", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Từ ngày
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Icon
                              path={mdiCalendar}
                              size={0.8}
                              className="mr-2"
                            />
                            {dateRange.from
                              ? format(dateRange.from, "dd/MM/yyyy")
                              : "Chọn ngày"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) =>
                              handleDateRangeChange({
                                ...dateRange,
                                from: date,
                              })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Đến ngày
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Icon
                              path={mdiCalendar}
                              size={0.8}
                              className="mr-2"
                            />
                            {dateRange.to
                              ? format(dateRange.to, "dd/MM/yyyy")
                              : "Chọn ngày"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) =>
                              handleDateRangeChange({ ...dateRange, to: date })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateRange({});
                        setFilters({ page: 1, limit: 5 });
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-10">
                <p className="text-red-500">
                  Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
                </p>
              </div>
            ) : data?.data.content.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-maintext">Không có yêu cầu trả hàng nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="bg-slate-50 font-semibold text-maintext w-[80px] text-center">STT</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Mã yêu cầu</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Khách hàng</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Đơn hàng gốc</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Ngày tạo</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Số tiền hoàn trả</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Trạng thái</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.content.map((returnItem, index) => (
                      <TableRow key={returnItem.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-center font-medium">
                          {data.data.number * data.data.size + index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-primary">
                          {returnItem.code}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">{returnItem.customer.fullName}</span>
                            <span className="text-xs text-slate-500">{returnItem.customer.phoneNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {returnItem.originalOrder.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDate(returnItem.createdAt)}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900">
                          {formatCurrency(returnItem.totalRefund)}
                        </TableCell>
                        <TableCell>
                          {getReturnStatusBadge(returnItem.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                setSelectedReturn(returnItem.id.toString());
                                setIsDetailDialogOpen(true);
                              }}
                              title="Xem chi tiết"
                            >
                              <Icon path={mdiEye} size={0.8} />
                            </Button>

                            {returnItem.status === "CHO_XU_LY" && (
                              <>
                                <Link to={`/admin/returns/edit/${returnItem.id}`}>
                                  <Button size="icon" variant="outline" title="Chỉnh sửa">
                                    <Icon path={mdiPencilCircle} size={0.8} />
                                  </Button>
                                </Link>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    setStatusUpdateModal({
                                      isOpen: true,
                                      returnId: returnItem.id.toString(),
                                      currentStatus: returnItem.status,
                                    })
                                  }
                                  title="Cập nhật trạng thái"
                                >
                                  <Icon path={mdiCheckCircle} size={0.8} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => {
                                    setReturnToDelete(returnItem);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  title="Xóa yêu cầu"
                                >
                                  <Icon path={mdiDeleteCircle} size={0.8} />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {data?.data && data.data.totalPages > 1 && (
              <CommonPagination
                pagination={{
                  total: data.data.totalElements,
                  count: data.data.content.length,
                  perPage: data.data.size,
                  currentPage: data.data.number + 1,
                  totalPages: data.data.totalPages,
                }}
                onPageChange={handleChangePage}
                itemLabel="đơn trả hàng"
                className="mt-6"
              />
            )}
          </Tabs>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setReturnToDelete(null);
        }}
        onConfirm={() => {
          if (returnToDelete) {
            handleDeleteReturn(returnToDelete.id);
          }
        }}
        isLoading={deleteReturn.isPending}
        title="Xác nhận xóa yêu cầu trả hàng"
        description={
          returnToDelete ? (
            <>
              Bạn có chắc chắn muốn xóa yêu cầu trả hàng{" "}
              <span className="font-semibold">{returnToDelete.code}</span>? Hành
              động này không thể hoàn tác.
            </>
          ) : null
        }
      />

      {/* Return Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu trả hàng</DialogTitle>
          </DialogHeader>
          <ReturnDetailContent
            returnId={selectedReturn || ""}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onUpdateStatus={handleUpdateStatus}
          />
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusUpdateModal.isOpen}
        onClose={() =>
          setStatusUpdateModal({
            isOpen: false,
            returnId: "",
            currentStatus: "",
          })
        }
        onConfirm={handleUpdateStatus}
        returnId={statusUpdateModal.returnId}
        currentStatus={statusUpdateModal.currentStatus}
        isLoading={updateStatus.isPending}
      />

      {/* Search Modal */}
      <SearchReturnModal
        isOpen={searchModal}
        onClose={() => setSearchModal(false)}
      />
    </div>
  );
}

import { useReturnDetail } from "@/hooks/return";

function ReturnDetailContent({
  returnId,
  formatCurrency,
  formatDate,
  onUpdateStatus,
}: {
  returnId: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onUpdateStatus: (
    id: string,
    status: "CHO_XU_LY" | "DA_HOAN_TIEN" | "DA_HUY"
  ) => Promise<void>;
}) {
  const { data, isLoading, isError } = useReturnDetail(returnId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-red-500 p-4">
        Đã xảy ra lỗi khi tải thông tin chi tiết.
      </p>
    );
  }

  const returnData = data.data;
  const customer = returnData.customer;
  const order = returnData.originalOrder;

  // Parse items from JSON string
  let returnItems: any[] = [];
  try {
    returnItems = JSON.parse(returnData.items);
  } catch (e) {
    console.error("Error parsing return items:", e);
  }

  // Resolve full details for returned items using original order items
  const resolvedReturnItems = returnItems.map(retItem => {
    const originalItem = order.items?.find((item: any) => item.variant.id === retItem.variantId);
    return {
      ...retItem,
      fullDetails: originalItem
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Thông tin yêu cầu</h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-xs text-slate-500">Mã yêu cầu</p>
              <p className="font-mono font-bold text-primary">{returnData.code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Ngày tạo</p>
              <p className="font-medium text-slate-700">{formatDate(returnData.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Đơn hàng gốc</p>
              <Badge variant="outline" className="font-mono mt-0.5">{order.code}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Trạng thái</p>
              <div className="mt-1">
                {getReturnStatusBadge(returnData.status)}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500">Lý do trả hàng</p>
              <p className="font-medium text-slate-700 mt-1 italic">"{returnData.reason}"</p>
              {returnData.note && (
                <p className="text-xs text-slate-500 mt-1">Ghi chú: {returnData.note}</p>
              )}
            </div>
            <div className="col-span-2 pt-2 border-t">
              <p className="text-xs text-slate-500">Tổng tiền hoàn trả</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(returnData.totalRefund)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Thông tin khách hàng & Nhân viên</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Khách hàng</p>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{customer.fullName}</span>
                  <span className="text-xs text-slate-500">{customer.email}</span>
                  <span className="text-xs text-slate-500">{customer.phoneNumber}</span>
                </div>
              </div>
            </div>
            {returnData.staff && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Nhân viên xử lý</p>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{returnData.staff.fullName}</span>
                    <span className="text-xs text-slate-500">{returnData.staff.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Sản phẩm trả lại</h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[100px]">Ảnh</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Biến thể</TableHead>
                <TableHead className="text-center font-semibold">Số lượng</TableHead>
                <TableHead className="text-right font-semibold">Giá</TableHead>
                <TableHead className="text-right font-semibold">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resolvedReturnItems.map((item: any, index: number) => {
                const variant = item.fullDetails?.variant;
                const imageUrl = variant?.images?.[0]?.imageUrl;

                return (
                  <TableRow key={index} className="hover:bg-slate-50/50">
                    <TableCell>
                      {imageUrl ? (
                        <div className="w-16 h-16 relative rounded-lg border overflow-hidden shadow-sm">
                          <img
                            src={imageUrl}
                            alt="Product"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border">
                          <Icon path={mdiMagnify} size={0.8} className="text-slate-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px]">
                      {item.fullDetails?.variant?.product?.name || "Chi tiết sản phẩm"}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        REF: ORD_ITEM_{item.variantId}
                      </div>
                    </TableCell>
                    <TableCell>
                      {variant ? (
                        <div className="flex flex-col text-xs gap-1">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full border border-slate-200"
                              style={{ backgroundColor: variant.color.code }}
                            />
                            <span>Màu: {variant.color.name}</span>
                          </div>
                          <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0">
                            Size: {variant.size.value}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-700">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-600">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {returnData.status === "CHO_XU_LY" && (
        <div className="pt-4 flex justify-end gap-3 border-t">
          <Button
            variant="outline"
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-6 transition-all"
            onClick={() => onUpdateStatus(returnId, "DA_HUY")}
          >
            <Icon path={mdiCancel} size={0.8} />
            <span className="font-semibold">Từ chối trả hàng</span>
          </Button>
          <Button
            className="gap-2 bg-green-600 hover:bg-green-700 text-white h-10 px-8 transition-all shadow-md active:scale-95"
            onClick={() => onUpdateStatus(returnId, "DA_HOAN_TIEN")}
          >
            <Icon path={mdiCheck} size={0.8} />
            <span className="font-semibold">Hoàn tiền & Hoàn tất</span>
          </Button>
        </div>
      )}
    </div>
  );
}
