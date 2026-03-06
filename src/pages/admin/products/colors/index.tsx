"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@mdi/react";
import {
  mdiMagnify,
  mdiPlus,
  mdiPencilCircle,
  mdiDeleteCircle
} from "@mdi/js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useColors,
  useDeleteColor,
} from "@/hooks/attributes";
import { CreateColorDialog } from "./components/CreateColorDialog";
import { EditColorDialog } from "./components/EditColorDialog";
import { IColorFilter } from "@/interface/request/attributes";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem, BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CommonPagination } from "@/components/ui/common-pagination";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { formatDate } from "@/utils/formatters";

export default function ColorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<IColorFilter>({
    page: 1,
    limit: 5,
  });
  const { data, isLoading, isError } = useColors(filters);
  const deleteColor = useDeleteColor();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [colorToEdit, setColorToEdit] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        setFilters((prev) => ({ ...prev, name: searchQuery, page: 1 }));
      } else {
        const { name, ...rest } = filters;
        setFilters({ ...rest, page: 1 });
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleFilterChange = (key: keyof IColorFilter, value: any) => {
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

  const handleDeleteColor = async (id: string) => {
    if (!id) {
      toast.error("Lỗi: ID màu sắc không hợp lệ");
      return;
    }

    try {
      await deleteColor.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Đã xóa màu sắc thành công");
          queryClient.invalidateQueries({ queryKey: ["colors"] });
          setIsDeleteDialogOpen(false);
          setColorToDelete(null);
        },
      });
    } catch (error) {
      toast.error("Xóa màu sắc thất bại");
    }
  };
  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/admin/statistics">Dashboard</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/admin/products">Quản lý sản phẩm</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Màu sắc</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="mb-4 space-y-4">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative flex-1">
            <Icon
              path={mdiMagnify}
              size={0.8}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-maintext"
            />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã màu..."
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
                Thêm màu sắc mới
              </Button>
            </DialogTrigger>
            <CreateColorDialog
              isOpen={isCreateDialogOpen}
              onClose={() => setIsCreateDialogOpen(false)}
            />
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">STT</TableHead>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead>Mã màu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 rounded-full bg-red-50 mb-4">
              <Icon path={mdiDeleteCircle} size={1.5} className="text-red-500" />
            </div>
            <p className="text-red-600 font-medium">Đã xảy ra lỗi khi tải dữ liệu</p>
            <Button
              variant="outline"
              className="mt-4 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["colors"] })}
            >
              Thử lại
            </Button>
          </div>
        ) : (
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">STT</TableHead>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead>Mã màu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length ? (
                  data.data.map((color: any, index: number) => (
                    <TableRow
                      key={color.id}
                      className="group transition-colors duration-200"
                    >
                      <TableCell className="text-center text-sm font-medium text-maintext/60">
                        {(data.pagination.currentPage - 1) * data.pagination.perPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full border border-gray-100 shadow-sm"
                            style={{ backgroundColor: color.code }}
                          />
                          <span className="text-sm font-semibold text-maintext">{color.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-maintext/70 bg-gray-50/50 px-2 py-1 rounded inline-block my-3">
                        {color.code}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={color.status === "ACTIVE" ? "success" : "destructive"}
                          className="px-3 py-1 font-medium"
                        >
                          {color.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-maintext/60">
                        {formatDate(color.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Dialog
                            open={isEditDialogOpen && colorToEdit === color.id}
                            onOpenChange={(open) => {
                              setIsEditDialogOpen(open);
                              if (!open) setColorToEdit(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setColorToEdit(color.id);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Icon path={mdiPencilCircle} size={0.8} />
                              </Button>
                            </DialogTrigger>
                            {colorToEdit === color.id && (
                              <EditColorDialog
                                colorId={color.id}
                                isOpen={isEditDialogOpen}
                                onClose={() => {
                                  setIsEditDialogOpen(false);
                                  setColorToEdit(null);
                                }}
                              />
                            )}
                          </Dialog>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setColorToDelete(color);
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
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-maintext/40">
                        <Icon path={mdiMagnify} size={1.5} className="mb-2" />
                        <p>Không tìm thấy màu sắc nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {data?.pagination && data.pagination.totalPages > 1 && (
          <CommonPagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
            itemLabel="màu sắc"
            className="mt-6"
          />
        )}
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setColorToDelete(null);
        }}
        onConfirm={() => colorToDelete && handleDeleteColor(colorToDelete.id)}
        isLoading={deleteColor.isPending}
        title="Xác nhận xóa màu sắc"
        description={
          colorToDelete && (
            <>
              Bạn có chắc chắn muốn xóa màu sắc <strong>{colorToDelete.name}</strong>?
              Thao tác này không thể hoàn tác.
            </>
          )
        }
      />
    </div>
  );
}
