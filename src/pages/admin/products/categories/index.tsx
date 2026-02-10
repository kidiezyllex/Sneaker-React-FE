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
} from "@mdi/js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useCategories,
  useDeleteCategory,
} from "@/hooks/attributes";
import { EditCategoryDialog } from "./components/EditCategoryDialog";
import { CreateCategoryDialog } from "./components/CreateCategoryDialog";
import {
  ICategoryFilter
} from "@/interface/request/attributes";
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

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ICategoryFilter>({
    page: 1,
    limit: 5,
  });
  const { data, isLoading, isError } = useCategories(filters);
  const deleteCategory = useDeleteCategory();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
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

  const handleFilterChange = (key: keyof ICategoryFilter, value: any) => {
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

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Đã xóa danh mục thành công");
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        },
      });
    } catch (error) {
      toast.error("Xóa danh mục thất bại");
    }
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
            <Link to="/admin/products">
              Quản lý sản phẩm
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Danh mục</BreadcrumbPage>
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
                placeholder="Tìm kiếm theo tên danh mục..."
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
                  Thêm danh mục mới
                </Button>
              </DialogTrigger>
              <CreateCategoryDialog
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
                      <TableHead>Tên danh mục</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[160px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[100px] rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Skeleton className="h-8 w-8 rounded-xl" />
                            <Skeleton className="h-8 w-8 rounded-xl" />
                          </div>
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
                  queryClient.invalidateQueries({ queryKey: ["categories"] })
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
                      <TableHead>Tên danh mục</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.length ? (
                      data.data.map((category, index) => (
                        <TableRow
                          key={(category as any)?.id || `category-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="text-center text-sm font-medium text-maintext">
                            {(data.pagination.currentPage - 1) *
                              data.pagination.perPage +
                              index +
                              1}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-maintext">
                              {category.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                category.status === "ACTIVE"
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {category.status === "ACTIVE"
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-maintext">
                            {formatDate(category.updatedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Dialog
                                open={
                                  isEditDialogOpen &&
                                  categoryToEdit === (category as any)?.id
                                }
                                onOpenChange={(open) => {
                                  setIsEditDialogOpen(open);
                                  if (!open) setCategoryToEdit(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    title="Sửa"
                                    onClick={() => {
                                      setCategoryToEdit((category as any)?.id);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Icon path={mdiPencilCircle} size={0.8} />
                                  </Button>
                                </DialogTrigger>
                                {categoryToEdit === (category as any)?.id && (
                                  <EditCategoryDialog
                                    categoryId={(category as any)?.id}
                                    isOpen={isEditDialogOpen}
                                    onClose={() => {
                                      setIsEditDialogOpen(false);
                                      setCategoryToEdit(null);
                                    }}
                                  />
                                )}
                              </Dialog>
                              <Dialog
                                open={
                                  isDeleteDialogOpen &&
                                  categoryToDelete === (category as any)?.id
                                }
                                onOpenChange={setIsDeleteDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setCategoryToDelete(category);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    title="Xóa"
                                  >
                                    <Icon path={mdiDeleteCircle} size={0.8} />
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="px-4 py-8 text-center text-maintext"
                        >
                          Không tìm thấy danh mục nào
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
              itemLabel="danh mục"
              className="mt-6"
            />
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={() => {
          if (categoryToDelete) {
            handleDeleteCategory((categoryToDelete as any).id);
          }
        }}
        isLoading={deleteCategory.isPending}
        title="Xác nhận xóa danh mục"
        description={
          categoryToDelete ? (
            <>
              Bạn có chắc chắn muốn xóa danh mục{" "}
              <strong>{categoryToDelete.name}</strong> không?
            </>
          ) : null
        }
      />
    </div>
  );
}
