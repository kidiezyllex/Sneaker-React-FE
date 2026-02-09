"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@mdi/react";
import {
  mdiMagnify,
  mdiPlus,
  mdiPencilCircle,
  mdiDeleteCircle,
  mdiFilterOutline,
  mdiLoading,
  mdiEmailFast,
  mdiTagCheckOutline,
  mdiFilterRemoveOutline,
  mdiPercent,
} from "@mdi/js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePromotions, useDeletePromotion } from "@/hooks/promotion";
import { formatDateTime } from "@/utils/formatters";
import { CommonPagination } from "@/components/ui/common-pagination";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { IPromotionFilter } from "@/interface/request/promotion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function PromotionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<IPromotionFilter>({
    page: 1,
    limit: 5,
  });
  const [showFilters, setShowFilters] = useState(false);
  const { data, isLoading, isError } = usePromotions(filters);
  const deletePromotion = useDeletePromotion();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<any>(null);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        setFilters((prev) => ({ ...prev, search: searchQuery, page: 1 }));
      } else {
        const { search, ...rest } = filters;
        setFilters({ ...rest, page: 1 });
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleFilterChange = (
    key: keyof IPromotionFilter,
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

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({ page: 1, limit: 5 });
  };

  const handleDeletePromotion = async (id: number) => {
    try {
      await deletePromotion.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Đã xóa chiến dịch khuyến mãi thành công");
          queryClient.invalidateQueries({ queryKey: ["promotions"] });
          setIsDeleteDialogOpen(false);
          setPromotionToDelete(null);
        },
      });
    } catch (error) {
      toast.error("Xóa chiến dịch khuyến mãi thất bại");
    }
  };

  const handleChangePage = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const getPromotionStatusBadge = (promotion: any) => {
    const now = new Date();
    const nowUTC = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    const startUTC = new Date(promotion.startDate).getTime();
    const endUTC = new Date(promotion.endDate).getTime();

    if (promotion.status === "UNACTIVE") {
      return <Badge variant="destructive">Không hoạt động</Badge>;
    }

    if (promotion.status === "ACTIVE") {
      if (nowUTC < startUTC) {
        return <Badge variant="secondary">Chưa bắt đầu</Badge>;
      }

      if (nowUTC > endUTC) {
        return <Badge variant="outline">Đã kết thúc</Badge>;
      }

      return <Badge variant="default">Đang hoạt động</Badge>;
    }

    return <Badge variant="secondary">Không xác định</Badge>;
  };

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/admin/statistics">
              Dashboard
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/admin/discounts/vouchers">
              Quản lý khuyến mãi
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Chiến dịch khuyến mãi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mb-4">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative flex-1">
              <Icon
                path={mdiMagnify}
                size={0.8}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-maintext"
              />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên chiến dịch..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              {(showFilters ||
                searchQuery ||
                Object.keys(filters).filter(
                  (k) => k !== "page" && k !== "limit"
                ).length > 0) && (
                  <Button
                    variant="outline"
                    className="flex items-center"
                    onClick={handleClearFilters}
                  >
                    <Icon
                      path={mdiFilterRemoveOutline}
                      size={0.8}
                      className="mr-2"
                    />
                    Clear bộ lọc
                  </Button>
                )}
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Icon path={mdiFilterOutline} size={0.8} />
                {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
              </Button>
              <Link to="/admin/discounts/promotions/create">
                <Button className="flex items-center gap-2">
                  <Icon path={mdiPlus} size={0.8} />
                  Thêm chiến dịch mới
                </Button>
              </Link>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-maintext mb-2 font-semibold">
                      Trạng thái
                    </label>
                    <Select
                      value={filters.status || ""}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "status",
                          value === "all" ? undefined : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                        <SelectItem value="INACTIVE">
                          Không hoạt động
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-maintext mb-2 font-semibold">
                      Thời gian bắt đầu
                    </label>
                    <Input
                      type="date"
                      value={filters.startDate || ""}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                      className="w-full"
                      placeholder="Từ ngày"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-maintext mb-2 font-semibold">
                      Thời gian kết thúc
                    </label>
                    <Input
                      type="date"
                      value={filters.endDate || ""}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                      className="w-full"
                      placeholder="Đến ngày"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="bg-white rounded-xl overflow-hidden mt-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border-b">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-white rounded-xl p-4 text-center mt-4">
              <p className="text-red-500">
                Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["promotions"] })
                }
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="bg-slate-50 font-semibold text-maintext w-[80px] text-center">STT</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Tên chiến dịch</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Giảm giá</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Thời gian</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext">Trạng thái</TableHead>
                      <TableHead className="bg-slate-50 font-semibold text-maintext text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.promotions?.length ? (
                      data.data.promotions.map((promotion, index) => (
                        <TableRow key={promotion.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="text-center font-medium">
                            {(data.data.pagination.currentPage - 1) *
                              data.data.pagination.limit +
                              index +
                              1}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-slate-900">
                                {promotion.name}
                              </span>
                              {promotion.description && (
                                <span className="text-sm text-maintext mt-1 line-clamp-2 max-w-[400px]">
                                  {promotion.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                <Icon
                                  path={mdiPercent}
                                  size={0.8}
                                  className="text-primary"
                                />
                              </div>
                              <span className="font-bold text-primary">
                                {promotion.discountPercent}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm">
                            <div className="flex flex-col gap-1 text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span>{formatDateTime(promotion.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span>{formatDateTime(promotion.endDate)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            {getPromotionStatusBadge(promotion)}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                to={`/admin/discounts/promotions/edit/${promotion.id}`}
                              >
                                <Button variant="outline" size="icon">
                                  <Icon path={mdiPencilCircle} size={0.8} />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setPromotionToDelete(promotion);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Icon path={mdiDeleteCircle} size={0.8} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="px-4 py-8 text-center text-maintext"
                        >
                          Không tìm thấy chiến dịch khuyến mãi nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {data && data.data && data.data.pagination && (
                <CommonPagination
                  pagination={{
                    total: data.data.pagination.totalItems,
                    count: data.data.promotions.length,
                    perPage: data.data.pagination.limit,
                    currentPage: data.data.pagination.currentPage,
                    totalPages: data.data.pagination.totalPages,
                  }}
                  onPageChange={handleChangePage}
                  itemLabel="đợt giảm giá"
                  className="mt-6"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPromotionToDelete(null);
        }}
        onConfirm={() => {
          if (promotionToDelete) {
            handleDeletePromotion(promotionToDelete.id);
          }
        }}
        isLoading={deletePromotion.isPending}
        title="Xác nhận xóa chiến dịch khuyến mãi"
        description={
          promotionToDelete ? (
            <>
              Bạn có chắc chắn muốn xóa chiến dịch khuyến mãi{" "}
              <span className="font-semibold">{promotionToDelete.name}</span>?
              Hành động này không thể hoàn tác.
            </>
          ) : null
        }
      />
    </div>
  );
}
