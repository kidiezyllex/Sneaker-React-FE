import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Icon } from "@mdi/react";
import {
  mdiAccountEdit,
  mdiCamera,
  mdiInformationOutline,
  mdiCalendar,
  mdiGenderMaleFemale,
  mdiCardAccountDetailsOutline,
  mdiClose,
  mdiContentSaveOutline,
} from "@mdi/js";
import { format } from "date-fns";
import { useUser } from "@/context/useUserContext";
import { useToast } from "@/hooks/useToast";
import { useUpdateUserProfile } from "@/hooks/account";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ProfileTab = () => {
  const { profile } = useUser();
  const userData = profile?.data;
  const { showToast } = useToast();
  const updateProfileMutation = useUpdateUserProfile();

  const getAvatarUrl = () => {
    const userId = userData?.id || "default";
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  };

  const formSchema = z.object({
    fullName: z
      .string()
      .min(2, { message: "Họ và tên phải có ít nhất 2 ký tự" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{10,11}$/, { message: "Số điện thoại không hợp lệ" })
      .optional()
      .or(z.literal("")),
    birthday: z.string().optional().or(z.literal("")),
    gender: z.string().optional().or(z.literal("")),
    citizenId: z.string().optional().or(z.literal("")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: userData?.fullName || "",
      email: userData?.email || "",
      phoneNumber: userData?.phoneNumber || "",
      birthday: userData?.birthday
        ? typeof userData.birthday === "string"
          ? userData.birthday
          : format(new Date(userData.birthday), "yyyy-MM-dd")
        : "",
      gender:
        userData?.gender === true
          ? "Nam"
          : userData?.gender === false
            ? "Nữ"
            : "Khác",
      citizenId: userData?.citizenId || "",
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        birthday: userData.birthday
          ? typeof userData.birthday === "string"
            ? userData.birthday
            : format(new Date(userData.birthday), "yyyy-MM-dd")
          : "",
        gender:
          userData.gender === true
            ? "Nam"
            : userData.gender === false
              ? "Nữ"
              : "Khác",
        citizenId: userData.citizenId || "",
      });
    }
  }, [userData, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateProfileMutation.mutate(
      {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        gender:
          values.gender === "Nam"
            ? true
            : values.gender === "Nữ"
              ? false
              : undefined,
        birthday: values.birthday || undefined,
      },
      {
        onSuccess: () => {
          showToast({
            title: "Cập nhật thành công",
            message: "Thông tin cá nhân đã được cập nhật",
            type: "success",
          });
        },
        onError: (error) => {
          showToast({
            title: "Lỗi",
            message: error.message || "Đã xảy ra lỗi khi cập nhật thông tin",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Icon path={mdiAccountEdit} size={0.8} className="text-primary" />
          </div>
          <span>Thông tin cá nhân</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 bg-white">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Cột trái: Avatar và Thông tin trạng thái */}
              <div className="md:col-span-4 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative group">
                        <img
                          src={getAvatarUrl()}
                          alt={userData?.fullName || "User Avatar"}
                          className="h-32 w-32 rounded-full border-4 border-background shadow-xl object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <Icon
                            path={mdiCamera}
                            size={1.2}
                            className="text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {userData?.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {userData?.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="outline">
                          {userData?.role || "CUSTOMER"}
                        </Badge>
                        <Badge variant="outline">
                          {userData?.status || "ACTIVE"}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        type="button"
                      >
                        <Icon path={mdiCamera} size={0.8} />
                        Thay đổi ảnh
                      </Button>
                    </div>

                    <div className="mt-8 pt-6 border-t space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold flex items-center gap-2">
                          <Icon path={mdiInformationOutline} size={0.8} />
                          Mã tài khoản
                        </span>
                        <span className="font-medium">
                          {userData?.code || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold flex items-center gap-2">
                          <Icon path={mdiCalendar} size={0.8} />
                          Ngày tham gia
                        </span>
                        <span className="font-medium">
                          {userData?.createdAt
                            ? format(new Date(userData.createdAt), "dd/MM/yyyy")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cột phải: Form cập nhật */}
              <div className="md:col-span-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">
                      Thông tin cơ bản
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ và tên</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập họ và tên" {...field} />
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

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Địa chỉ Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập email"
                              {...field}
                              disabled
                              className="bg-muted/50"
                            />
                          </FormControl>
                          <FormDescription>
                            Email dùng để đăng nhập và không thể thay đổi
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">
                      Chi tiết cá nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Icon path={mdiGenderMaleFemale} size={0.8} />
                              Giới tính
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Nam">Nam</SelectItem>
                                <SelectItem value="Nữ">Nữ</SelectItem>
                                <SelectItem value="Khác">Khác</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="birthday"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Icon path={mdiCalendar} size={0.8} />
                              Ngày sinh
                            </FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="citizenId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Icon
                              path={mdiCardAccountDetailsOutline}
                              size={0.8}
                            />
                            Số CCCD/CMND
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập số định danh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => form.reset()}
                    className="gap-2"
                  >
                    <Icon path={mdiClose} size={0.8} />
                    Đặt lại
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="gap-2 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {updateProfileMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                    ) : (
                      <Icon path={mdiContentSaveOutline} size={0.8} />
                    )}
                    Lưu thông tin
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileTab;
