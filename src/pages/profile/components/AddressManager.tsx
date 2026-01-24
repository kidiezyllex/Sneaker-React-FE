"use client";

import { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomToast } from "@/components/ui/custom-toast";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useUserProfile,
} from "@/hooks/account";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@mdi/react";
import { mdiMapMarker, mdiHome, mdiStar, mdiStarOutline } from "@mdi/js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const addressSchema = z.object({
  name: z.string().min(3, "Tên người nhận phải có ít nhất 3 ký tự"),
  phoneNumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  provinceId: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
  districtId: z.string().min(1, "Quận/Huyện không được để trống"),
  wardId: z.string().min(1, "Phường/Xã không được để trống"),
  specificAddress: z
    .string()
    .min(5, "Địa chỉ chi tiết phải có ít nhất 5 ký tự"),
  type: z.boolean().default(false),
  isDefault: z.boolean().optional().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressManager() {
  const { data: profileData, isLoading, refetch } = useUserProfile();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      provinceId: "",
      districtId: "",
      wardId: "",
      specificAddress: "",
      type: false,
      isDefault: false,
    },
  });

  useEffect(() => {
    if (profileData && profileData.data && profileData.data.addresses) {
      setAddresses(profileData.data.addresses);
    }
  }, [profileData]);

  const resetForm = () => {
    form.reset({
      name: "",
      phoneNumber: "",
      provinceId: "",
      districtId: "",
      wardId: "",
      specificAddress: "",
      type: false,
      isDefault: false,
    });
    setIsEditMode(false);
    setCurrentAddressId(null);
  };

  const handleEdit = (address: any) => {
    setIsEditMode(true);
    setCurrentAddressId(address.id);
    form.reset({
      name: address.name,
      phoneNumber: address.phoneNumber,
      provinceId: address.provinceId,
      districtId: address.districtId,
      wardId: address.wardId,
      specificAddress: address.specificAddress,
      type: address.type,
      isDefault: address.isDefault,
    });
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteAddressMutation.mutateAsync(deleteId);
      toast.success(<CustomToast title="Xóa thành công" />, { icon: false });
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error(<CustomToast title="Xóa thất bại" type="error" />, {
        icon: false,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (data: AddressFormValues) => {
    try {
      if (isEditMode && currentAddressId) {
        await updateAddressMutation.mutateAsync({
          addressId: currentAddressId,
          data: data,
        });
        toast.success(<CustomToast title="Cập nhật thành công" />, {
          icon: false,
        });
      } else {
        await addAddressMutation.mutateAsync(data as any);
        toast.success(<CustomToast title="Thêm mới thành công" />, {
          icon: false,
        });
      }
      setOpenDialog(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(
        <CustomToast
          title={isEditMode ? "Cập nhật thất bại" : "Thêm mới thất bại"}
          type="error"
        />,
        { icon: false }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Địa chỉ của tôi</h2>
          <DialogTrigger asChild>
            <Button
              className="bg-primary hover:bg-secondary transition-all duration-300 flex items-center gap-2"
              onClick={resetForm}
            >
              <Plus size={16} />
              Thêm địa chỉ mới
            </Button>
          </DialogTrigger>
        </div>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
            <Icon path={mdiMapMarker} size={3} className="text-maintext mb-4" />
            <p className="text-maintext dark:text-maintext mb-4">
              Bạn chưa có địa chỉ nào
            </p>
            <DialogTrigger asChild>
              <Button
                className="bg-primary hover:bg-secondary transition-all duration-300"
                onClick={resetForm}
              >
                Thêm địa chỉ mới
              </Button>
            </DialogTrigger>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`overflow-hidden ${
                      address.isDefault
                        ? "border-primary"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
                      <div className="flex items-center gap-2">
                        <Icon
                          path={mdiHome}
                          size={0.8}
                          className="text-primary"
                        />
                        <CardTitle className="text-base font-medium">
                          {address.addressName}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {address.isDefault ? (
                          <div className="flex items-center text-sm text-primary bg-primary/10 px-2 py-1 rounded">
                            <Icon path={mdiStar} size={0.8} className="mr-1" />
                            Mặc định
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-sm text-maintext hover:text-primary"
                          >
                            <Icon
                              path={mdiStarOutline}
                              size={0.8}
                              className="mr-1"
                            />
                            Đặt mặc định
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="text-sm space-y-1">
                        <p className="font-medium">
                          {address.name} | {address.phoneNumber}
                        </p>
                        <p className="text-maintext dark:text-maintext">
                          {address.specificAddress}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Mã KV: {address.wardId}, {address.districtId},{" "}
                          {address.provinceId}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 border-gray-300 hover:border-red-500 hover:text-red-500"
                        onClick={() => setDeleteId(address.id)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Xóa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 border-gray-300 hover:border-primary hover:text-primary"
                        onClick={() => handleEdit(address)}
                      >
                        <Pencil size={14} className="mr-1" />
                        Sửa
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Cập nhật thông tin địa chỉ của bạn"
                : "Điền đầy đủ thông tin để thêm địa chỉ mới"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="p-1">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại địa chỉ</FormLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "true")
                          }
                          value={field.value ? "true" : "false"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại địa chỉ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="false">Nhà riêng</SelectItem>
                            <SelectItem value="true">Văn phòng</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ tên người nhận</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập họ tên người nhận"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập số điện thoại"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="provinceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã Tỉnh/Thành phố</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập mã tỉnh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="districtId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã Quận/Huyện</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập mã quận" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wardId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã Phường/Xã</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập mã phường" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specificAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ chi tiết</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Số nhà, tên đường..."
                            {...field}
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-2xl border p-4">
                        <FormControl>
                          <Input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Đặt làm địa chỉ mặc định
                          </FormLabel>
                          <p className="text-sm text-maintext dark:text-maintext">
                            Địa chỉ này sẽ được sử dụng mặc định khi mua hàng
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-secondary"
                      disabled={
                        addAddressMutation.isPending ||
                        updateAddressMutation.isPending
                      }
                    >
                      {addAddressMutation.isPending ||
                      updateAddressMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : isEditMode ? (
                        "Cập nhật"
                      ) : (
                        "Thêm mới"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Xác nhận xóa địa chỉ"
        description="Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
