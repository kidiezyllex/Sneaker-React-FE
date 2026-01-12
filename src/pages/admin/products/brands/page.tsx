"use client";

import { useState, useEffect, useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@mdi/react";
import { mdiMagnify, mdiPlus, mdiPencilCircle, mdiDeleteCircle } from "@mdi/js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useBrands,
  useDeleteBrand,
  useBrandDetail,
  useUpdateBrand,
  useCreateBrand,
} from "@/hooks/attributes";
import { IBrandFilter } from "@/interface/request/attributes";
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
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CommonPagination } from "@/components/ui/common-pagination";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<IBrandFilter>({
    page: 1,
    limit: 5,
  });
  const { data, isLoading, isError } = useBrands(filters);
  const deleteBrand = useDeleteBrand();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<string | null>(null);
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

  const handleFilterChange = (key: keyof IBrandFilter, value: any) => {
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

  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteBrand.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Đã xóa thương hiệu thành công");
          queryClient.invalidateQueries({ queryKey: ["brands"] });
          setIsDeleteDialogOpen(false);
          setBrandToDelete(null);
        },
      });
    } catch (error) {
      toast.error("Xóa thương hiệu thất bại");
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
              <BreadcrumbPage>Thương hiệu</BreadcrumbPage>
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
                type="text"
                placeholder="Tìm kiếm theo tên thương hiệu..."
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
                  Thêm thương hiệu mới
                </Button>
              </DialogTrigger>
              <CreateBrandDialog
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
                      <TableHead>Tên thương hiệu</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
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
                            <Skeleton className="h-8 w-8 rounded-2xl" />
                            <Skeleton className="h-8 w-8 rounded-2xl" />
                          </div>
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
                  queryClient.invalidateQueries({ queryKey: ["brands"] })
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
                      <TableHead>Tên thương hiệu</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.length ? (
                      data.data.map((brand, index) => (
                        <TableRow
                          key={(brand as any)?.id || `brand-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="text-sm text-maintext">
                            {(brand as any)?.id}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-maintext">
                              {brand.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                brand.status === "ACTIVE"
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {brand.status === "ACTIVE"
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-maintext">
                            {formatDate(brand.updatedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Dialog
                                open={
                                  isEditDialogOpen &&
                                  brandToEdit === (brand as any)?.id
                                }
                                onOpenChange={(open) => {
                                  setIsEditDialogOpen(open);
                                  if (!open) setBrandToEdit(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    title="Sửa"
                                    onClick={() => {
                                      setBrandToEdit((brand as any)?.id);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Icon path={mdiPencilCircle} size={0.8} />
                                  </Button>
                                </DialogTrigger>
                                {brandToEdit === (brand as any)?.id && (
                                  <EditBrandDialog
                                    brandId={(brand as any)?.id}
                                    isOpen={isEditDialogOpen}
                                    onClose={() => {
                                      setIsEditDialogOpen(false);
                                      setBrandToEdit(null);
                                    }}
                                  />
                                )}
                              </Dialog>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setBrandToDelete(brand);
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
                          colSpan={5}
                          className="px-4 py-8 text-center text-maintext"
                        >
                          Không tìm thấy thương hiệu nào
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
                  thương hiệu
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
          setBrandToDelete(null);
        }}
        onConfirm={() => {
          if (brandToDelete) {
            handleDeleteBrand((brandToDelete as any).id);
          }
        }}
        isLoading={deleteBrand.isPending}
        title="Xác nhận xóa thương hiệu"
        description={
          brandToDelete ? (
            <>
              Bạn có chắc chắn muốn xóa thương hiệu{" "}
              <strong>{brandToDelete.name}</strong> không?
            </>
          ) : null
        }
      />
    </div>
  );
}

// Edit Brand Dialog Component
interface EditBrandDialogProps {
  brandId: string;
  isOpen: boolean;
  onClose: () => void;
}

function EditBrandDialog({ brandId, isOpen, onClose }: EditBrandDialogProps) {
  const queryClient = useQueryClient();
  const { data: brandData, isLoading, isError } = useBrandDetail(brandId);
  const updateBrand = useUpdateBrand();

  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  useEffect(() => {
    if (brandData?.data) {
      setFormData({
        name: brandData.data.name,
        status: brandData.data.status,
      });
    }
  }, [brandData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

    if (!formData.name.trim()) {
      newErrors.name = "Tên thương hiệu không được để trống";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateBrand.mutateAsync(
        {
          brandId: brandId,
          payload: formData,
        },
        {
          onSuccess: () => {
            toast.success("Cập nhật thương hiệu thành công");
            queryClient.invalidateQueries({ queryKey: ["brand", brandId] });
            queryClient.invalidateQueries({ queryKey: ["brands"] });
            onClose();
          },
          onError: (error) => {
            toast.error("Cập nhật thương hiệu thất bại: " + error.message);
          },
        }
      );
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật thương hiệu");
    }
  };

  if (isLoading) {
    return (
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            <Skeleton className="h-8 w-[200px]" />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end space-x-4">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>
      </DialogContent>
    );
  }

  if (isError || !brandData) {
    return (
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Lỗi</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-red-500 mb-4">
            Đã xảy ra lỗi khi tải dữ liệu thương hiệu.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["brand", brandId] })
              }
            >
              Thử lại
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Chỉnh sửa thương hiệu: {brandData.data.name}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="space-y-2">
          <FormLabel htmlFor="name">Tên thương hiệu</FormLabel>
          <Input
            id="name"
            name="name"
            placeholder="Nhập tên thương hiệu"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status">
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
          <Button type="submit" disabled={updateBrand.isPending}>
            {updateBrand.isPending ? "Đang xử lý..." : "Cập nhật thương hiệu"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// Create Brand Dialog Component
interface CreateBrandDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateBrandDialog({ isOpen, onClose }: CreateBrandDialogProps) {
  const queryClient = useQueryClient();
  const createBrand = useCreateBrand();

  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

    if (!formData.name.trim()) {
      newErrors.name = "Tên thương hiệu không được để trống";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createBrand.mutateAsync(formData, {
        onSuccess: () => {
          toast.success("Thêm thương hiệu thành công");
          queryClient.invalidateQueries({ queryKey: ["brands"] });
          // Reset form
          setFormData({
            name: "",
            status: "ACTIVE",
          });
          onClose();
        },
        onError: (error) => {
          if (
            error.message === "Duplicate entry. This record already exists."
          ) {
          } else {
            toast.error("Thêm thương hiệu thất bại: Thương hiệu đã tồn tại");
          }
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Thêm thương hiệu mới</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="space-y-2">
          <FormLabel htmlFor="create-name">Tên thương hiệu</FormLabel>
          <Input
            id="create-name"
            name="name"
            placeholder="Nhập tên thương hiệu"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={createBrand.isPending}>
            {createBrand.isPending ? "Đang xử lý..." : "Thêm thương hiệu"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
