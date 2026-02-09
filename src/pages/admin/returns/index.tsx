"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  mdiPencil,
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
  const location = useLocation();
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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to={location.pathname.startsWith('/staff') ? '/staff/pos' : '/admin/statistics'} className="!text-white/80 hover:!text-white">
              Dashboard
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Quản lý trả hàng</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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
                    <Icon path={mdiFilterOutline} size={0.8} />
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
                  <Link to={location.pathname.startsWith('/staff') ? '/staff/returns/create' : '/admin/returns/create'}>
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
                            <span className="text-xs text-maintext">{returnItem.customer.phoneNumber}</span>
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
                            <Link to={location.pathname.startsWith('/staff') ? `/staff/returns/${returnItem.id}` : `/admin/returns/${returnItem.id}`}>
                              <Button
                                size="icon"
                                variant="outline"
                                title="Xem chi tiết"
                              >
                                <Icon path={mdiEye} size={0.8} />
                              </Button>
                            </Link>

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
    </div>
  );
}

