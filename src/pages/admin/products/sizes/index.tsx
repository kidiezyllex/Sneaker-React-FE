"use client";

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSizes, useDeleteSize, useCreateSize } from "@/hooks/attributes";
import type { ISizeFilter, ISizeCreate } from "@/interface/request/attributes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
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
import { mdiPlus, mdiDeleteCircle, mdiLoading } from "@mdi/js";
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
              <Link to="/admin/statistics" className="!text-white/80 hover:!text-white">
                Dashboard
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link to="/admin/products" className="!text-white/80 hover:!text-white">
                Quản lý sản phẩm
              </Link>
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
                placeholder="Tìm kiếm theo giá trị kích cỡ (ví dụ: 38, 40.5)..."
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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Kích cỡ</TableHead>
                      <TableHead>Giá trị số</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
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
                          <div className="h-8 w-8 bg-gray-200 rounded-xl animate-pulse ml-auto"></div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : isError ? (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] text-center">STT</TableHead>
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
                          <TableCell className="text-center text-sm font-medium text-maintext">
                            {(data.pagination.currentPage - 1) *
                              data.pagination.perPage +
                              index +
                              1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-6 w-fit px-3 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                <span className="text-sm font-semibold">
                                  {size.value}
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
            <CommonPagination
              pagination={data.pagination}
              onPageChange={handlePageChange}
              itemLabel="kích cỡ"
              className="mt-6"
            />
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
              <strong>{sizeToDelete.value}</strong> không?
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
  const { data: existingSizesData, isLoading: isLoadingExisting } = useSizes({
    limit: 1000,
  });

  const [formData, setFormData] = useState({
    value: 0,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const [errors, setErrors] = useState({
    value: "",
  });

  const availableSizes = useMemo(() => {
    if (isLoadingExisting) return [];

    const shoeSizes = [];
    for (let i = 34; i <= 46; i += 0.5) {
      shoeSizes.push(i);
    }

    const allPotentialValues = shoeSizes;

    const existingValues = existingSizesData?.data?.map((s) => s.value) || [];

    return allPotentialValues.filter(
      (val) => !existingValues.some((ex) => Math.abs(ex - val) < 0.001)
    );
  }, [existingSizesData, isLoadingExisting]);

  const handleSizeChange = (value: string) => {
    const sizeValue = parseFloat(value);
    if (!isNaN(sizeValue)) {
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

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Thêm kích cỡ mới</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="space-y-2">
          <FormLabel htmlFor="create-size">Kích cỡ</FormLabel>
          <Select
            value={formData.value ? String(formData.value) : ""}
            onValueChange={handleSizeChange}
          >
            <SelectTrigger
              id="create-size"
              className={errors.value ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Chọn kích cỡ" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingExisting ? (
                <div className="flex items-center justify-center p-4">
                  <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                  <span className="ml-2 text-sm">Đang tải dữ liệu...</span>
                </div>
              ) : availableSizes.length > 0 ? (
                availableSizes.map((val) => (
                  <SelectItem key={val} value={String(val)}>
                    Size {val}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-gray-500">
                  Tất cả kích cỡ đã được thêm
                </div>
              )}
            </SelectContent>
          </Select>
          {errors.value && (
            <p className="text-red-500 text-sm">{errors.value}</p>
          )}
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="create-status">Trạng thái</FormLabel>
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
        <DialogFooter className="p-0">
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
