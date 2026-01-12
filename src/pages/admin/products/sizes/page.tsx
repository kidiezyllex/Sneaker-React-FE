"use client";

import React, { useState, useMemo } from "react";
import { useSizes, useDeleteSize, useCreateSize } from "@/hooks/attributes";
import type { ISizeFilter, ISizeCreate } from "@/interface/request/attributes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@mdi/react";
import { mdiPlus, mdiDeleteCircle } from "@mdi/js";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getSizeLabel, getSizeValue, SIZE_MAPPINGS } from "@/utils/sizeMapping";
import { Badge } from "@/components/ui/badge";
import { CommonPagination } from "@/components/ui/common-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { mdiMagnify } from "@mdi/js";
import { useEffect } from "react";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

export default function SizesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ISizeFilter>({
    page: 1,
    limit: 5,
  });
  const { data, isLoading, isError } = useSizes(filters);
  const deleteSizeMutation = useDeleteSize();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState<any>(null);

  useEffect(() => {
    const debounce = setTimeout(() => {
      const query = searchQuery.trim();
      if (query) {
        const numericValue = Number(query);
        const mappedValue = getSizeValue(query.toUpperCase());

        if (!isNaN(numericValue)) {
          setFilters((prev) => ({ ...prev, value: numericValue, page: 1 }));
        } else if (mappedValue !== null) {
          setFilters((prev) => ({ ...prev, value: mappedValue, page: 1 }));
        } else {
          // If neither, we might want to clear or keep previous.
          // For now, let's just clear the value filter if no match found
          const { value, ...rest } = filters;
          setFilters({ ...rest, page: 1 });
        }
      } else {
        const { value, ...rest } = filters;
        setFilters({ ...rest, page: 1 });
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleFilterChange = (key: keyof ISizeFilter, value: any) => {
    if (value === "all" || value === "") {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters({ ...newFilters, page: 1 });
    } else {
      setFilters({ ...filters, [key]: value, page: 1 });
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleDeleteSize = async (sizeId: string) => {
    if (!sizeId) {
      console.error("sizeId is undefined, null or empty:", sizeId);
      toast.error("Lỗi: Không tìm thấy ID kích cỡ");
      return;
    }

    try {
      await deleteSizeMutation.mutateAsync(sizeId, {
        onSuccess: () => {
          toast.success("Đã xóa kích cỡ thành công");
          queryClient.invalidateQueries({ queryKey: ["sizes"] });
          setIsDeleteDialogOpen(false);
          setSizeToDelete(null);
        },
        onError: (error) => {
          console.error("Delete error:", error);
          toast.error("Xóa kích cỡ thất bại");
        },
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Xóa kích cỡ thất bại");
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/statistics">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/products">
                Quản lý sản phẩm
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Kích cỡ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

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
                placeholder="Tìm kiếm theo kích cỡ (XS, S, M...) hoặc giá trị số..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Icon path={mdiPlus} size={0.8} />
                  Thêm kích cỡ mới
                </Button>
              </DialogTrigger>
              <CreateSizeDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
              />
            </Dialog>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Kích cỡ</TableHead>
                      <TableHead>Giá trị số</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="h-8 w-8 bg-gray-200 rounded-2xl animate-pulse ml-auto"></div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : isError ? (
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <p className="text-red-500">
                Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["sizes"] })
                }
              >
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Kích cỡ</TableHead>
                      <TableHead>Giá trị số</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.length ? (
                      data.data.map((size, index) => (
                        <TableRow
                          key={(size as any)?.id || `size-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="text-sm text-maintext">
                            {(size as any)?.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-6 w-fit px-2 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                <span className="text-sm font-semibold">
                                  {getSizeLabel(size.value)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-maintext">
                            {size.value}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                size.status === "ACTIVE"
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {size.status === "ACTIVE"
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-maintext">
                            {formatDate(size.updatedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSizeToDelete(size);
                                  setIsDeleteDialogOpen(true);
                                }}
                                title="Xóa"
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
                          className="text-center py-8 text-maintext"
                        >
                          Không có kích cỡ nào được tìm thấy.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="hidden sm:block">
                <p className="text-sm text-maintext">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {(data.pagination.currentPage - 1) *
                      data.pagination.perPage +
                      1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(
                      data.pagination.currentPage * data.pagination.perPage,
                      data.pagination.total
                    )}
                  </span>{" "}
                  của{" "}
                  <span className="font-medium">{data.pagination.total}</span>{" "}
                  kích cỡ
                </p>
              </div>
              <CommonPagination
                pagination={data.pagination}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSizeToDelete(null);
        }}
        onConfirm={() => {
          if (sizeToDelete) {
            handleDeleteSize((sizeToDelete as any).id);
          }
        }}
        isLoading={deleteSizeMutation.isPending}
        title="Xác nhận xóa kích cỡ"
        description={
          sizeToDelete ? (
            <>
              Bạn có chắc chắn muốn xóa kích cỡ{" "}
              <strong>{getSizeLabel(sizeToDelete.value)}</strong> không?
            </>
          ) : null
        }
      />
    </div>
  );
}

interface CreateSizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateSizeDialog({ isOpen, onClose }: CreateSizeDialogProps) {
  const queryClient = useQueryClient();
  const createSize = useCreateSize();

  const [formData, setFormData] = useState({
    value: 0,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const [errors, setErrors] = useState({
    value: "",
  });

  const handleSizeChange = (sizeLabel: string) => {
    const sizeValue = getSizeValue(sizeLabel);
    if (sizeValue !== null) {
      setFormData((prev) => ({ ...prev, value: sizeValue }));
      if (errors.value) {
        setErrors((prev) => ({ ...prev, value: "" }));
      }
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "ACTIVE" | "INACTIVE",
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (formData.value <= 0) {
      newErrors.value = "Vui lòng chọn kích cỡ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createSize.mutateAsync(formData, {
        onSuccess: () => {
          toast.success("Thêm kích cỡ thành công");
          queryClient.invalidateQueries({ queryKey: ["sizes"] });
          setFormData({
            value: 0,
            status: "ACTIVE",
          });
          onClose();
        },
        onError: (error) => {
          if (
            error.message === "Duplicate entry. This record already exists."
          ) {
            toast.error("Thêm kích cỡ thất bại: Kích cỡ này đã tồn tại.");
          } else {
            toast.error("Thêm kích cỡ thất bại");
          }
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getCurrentSizeLabel = () => {
    if (formData.value > 0) {
      return getSizeLabel(formData.value);
    }
    return "";
  };

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Thêm kích cỡ mới</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="create-size">Kích cỡ</Label>
          <Select
            value={getCurrentSizeLabel()}
            onValueChange={handleSizeChange}
          >
            <SelectTrigger
              id="create-size"
              className={errors.value ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Chọn kích cỡ" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_MAPPINGS.map((size) => (
                <SelectItem key={size.value} value={size.label}>
                  {size.label} (Giá trị: {size.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.value && (
            <p className="text-red-500 text-sm">{errors.value}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-status">Trạng thái</Label>
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger id="create-status">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={createSize.isPending}>
            {createSize.isPending ? "Đang xử lý..." : "Thêm kích cỡ"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
