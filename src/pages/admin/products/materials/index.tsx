"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@mdi/react";
import {
  mdiMagnify,
  mdiPlus,
  mdiPencilCircle,
  mdiDeleteCircle,
  mdiFilterOutline,
} from "@mdi/js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useMaterials,
  useDeleteMaterial,
  useMaterialDetail,
  useUpdateMaterial,
  useCreateMaterial,
} from "@/hooks/attributes";
import {
  IMaterialFilter,
  IMaterialCreate,
  IMaterialUpdate,
} from "@/interface/request/attributes";
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

export default function MaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<IMaterialFilter>({
    page: 1,
    limit: 5,
  });
  const { data, isLoading, isError } = useMaterials(filters);
  const deleteMaterial = useDeleteMaterial();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<string | null>(null);
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

  const handleFilterChange = (key: keyof IMaterialFilter, value: any) => {
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

  const handleDeleteMaterial = async (id: string) => {
    try {
      await deleteMaterial.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Đã xóa chất liệu thành công");
          queryClient.invalidateQueries({ queryKey: ["materials"] });
          setIsDeleteDialogOpen(false);
          setMaterialToDelete(null);
        },
      });
    } catch (error) {
      toast.error("Xóa chất liệu thất bại");
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
              <BreadcrumbPage>Chất liệu</BreadcrumbPage>
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
                placeholder="Tìm kiếm theo tên chất liệu..."
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
                  Thêm chất liệu mới
                </Button>
              </DialogTrigger>
              <CreateMaterialDialog
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
                      <TableHead className="w-[50px] text-center">STT</TableHead>
                      <TableHead>Tên chất liệu</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
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
                  queryClient.invalidateQueries({ queryKey: ["materials"] })
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
                      <TableHead>Tên chất liệu</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày cập nhật</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.length ? (
                      data.data.map((material, index) => (
                        <TableRow
                          key={(material as any)?.id || `material-${index}`}
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
                              {material.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                material.status === "ACTIVE"
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {material.status === "ACTIVE"
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-maintext">
                            {formatDate(material.updatedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Dialog
                                open={
                                  isEditDialogOpen &&
                                  materialToEdit === (material as any)?.id
                                }
                                onOpenChange={(open) => {
                                  setIsEditDialogOpen(open);
                                  if (!open) setMaterialToEdit(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    title="Sửa"
                                    onClick={() => {
                                      setMaterialToEdit((material as any)?.id);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Icon path={mdiPencilCircle} size={0.8} />
                                  </Button>
                                </DialogTrigger>
                                {materialToEdit === (material as any)?.id && (
                                  <EditMaterialDialog
                                    materialId={(material as any)?.id}
                                    isOpen={isEditDialogOpen}
                                    onClose={() => {
                                      setIsEditDialogOpen(false);
                                      setMaterialToEdit(null);
                                    }}
                                  />
                                )}
                              </Dialog>
                              <Dialog
                                open={
                                  isDeleteDialogOpen &&
                                  materialToDelete === (material as any)?.id
                                }
                                onOpenChange={setIsDeleteDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setMaterialToDelete(material);
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
                          Không tìm thấy chất liệu nào
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
              itemLabel="chất liệu"
              className="mt-6"
            />
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setMaterialToDelete(null);
        }}
        onConfirm={() => {
          if (materialToDelete) {
            handleDeleteMaterial((materialToDelete as any).id);
          }
        }}
        isLoading={deleteMaterial.isPending}
        title="Xác nhận xóa chất liệu"
        description={
          materialToDelete ? (
            <>
              Bạn có chắc chắn muốn xóa chất liệu{" "}
              <strong>{materialToDelete.name}</strong> không?
            </>
          ) : null
        }
      />
    </div>
  );
}

interface EditMaterialDialogProps {
  materialId: string;
  isOpen: boolean;
  onClose: () => void;
}

function EditMaterialDialog({
  materialId,
  isOpen,
  onClose,
}: EditMaterialDialogProps) {
  const queryClient = useQueryClient();
  const {
    data: materialData,
    isLoading,
    isError,
  } = useMaterialDetail(materialId);
  const updateMaterial = useUpdateMaterial();

  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  useEffect(() => {
    if (materialData?.data) {
      setFormData({
        name: materialData.data.name,
        status: materialData.data.status,
      });
    }
  }, [materialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      newErrors.name = "Tên chất liệu không được để trống";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateMaterial.mutateAsync(
        {
          materialId: materialId,
          payload: formData,
        },
        {
          onSuccess: () => {
            toast.success("Cập nhật chất liệu thành công");
            queryClient.invalidateQueries({
              queryKey: ["material", materialId],
            });
            queryClient.invalidateQueries({ queryKey: ["materials"] });
            onClose();
          },
          onError: (error) => {
            toast.error("Cập nhật chất liệu thất bại: " + error.message);
          },
        }
      );
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật chất liệu");
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

  if (isError || !materialData) {
    return (
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Lỗi</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-red-500 mb-4">
            Đã xảy ra lỗi khi tải dữ liệu chất liệu.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["material", materialId],
                })
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
        <DialogTitle>Chỉnh sửa chất liệu: {materialData.data.name}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="space-y-2">
          <FormLabel htmlFor="name">Tên chất liệu</FormLabel>
          <Input
            id="name"
            name="name"
            placeholder="Nhập tên chất liệu"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="status">Trạng thái</FormLabel>
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
          <Button type="submit" disabled={updateMaterial.isPending}>
            {updateMaterial.isPending ? "Đang xử lý..." : "Cập nhật chất liệu"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

interface CreateMaterialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateMaterialDialog({ isOpen, onClose }: CreateMaterialDialogProps) {
  const queryClient = useQueryClient();
  const createMaterial = useCreateMaterial();

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
      newErrors.name = "Tên chất liệu không được để trống";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createMaterial.mutateAsync(formData, {
        onSuccess: () => {
          toast.success("Thêm chất liệu thành công");
          queryClient.invalidateQueries({ queryKey: ["materials"] });
          setFormData({
            name: "",
            status: "ACTIVE",
          });
          onClose();
        },
        onError: (error) => {
          toast.error("Thêm chất liệu thất bại: " + error.message);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Thêm chất liệu mới</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="space-y-2">
          <FormLabel htmlFor="create-name">Tên chất liệu</FormLabel>
          <Input
            id="create-name"
            name="name"
            placeholder="Nhập tên chất liệu"
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
          <Button type="submit" disabled={createMaterial.isPending}>
            {createMaterial.isPending ? "Đang xử lý..." : "Thêm chất liệu"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
