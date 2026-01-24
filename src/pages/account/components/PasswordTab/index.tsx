import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Icon } from "@mdi/react";
import { mdiLock } from "@mdi/js";
import { useToast } from "@/hooks/useToast";
import { useChangePassword } from "@/hooks/account";
import {
  Card,
  CardContent,
  CardDescription,
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PasswordTab = () => {
  const changePasswordMutation = useChangePassword();
  const { showToast } = useToast();
  const formSchema = z
    .object({
      currentPassword: z
        .string()
        .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
      newPassword: z
        .string()
        .min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" }),
      confirmPassword: z
        .string()
        .min(6, { message: "Mật khẩu xác nhận phải có ít nhất 6 ký tự" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    changePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          showToast({
            title: "Thành công",
            message: "Đổi mật khẩu thành công",
            type: "success",
          });
          form.reset();
        },
        onError: (error) => {
          showToast({
            title: "Lỗi",
            message: error.message || "Đã xảy ra lỗi khi đổi mật khẩu",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Icon path={mdiLock} size={0.8} className="text-primary" />
          </div>
          <span>Đổi mật khẩu</span>
        </CardTitle>
        <CardDescription>
          Cập nhật mật khẩu để bảo vệ tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu hiện tại"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu mới"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mật khẩu phải có ít nhất 6 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => form.reset()}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="gap-2"
              >
                {changePasswordMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                ) : (
                  <Icon path={mdiLock} size={0.8} />
                )}
                Cập nhật mật khẩu
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PasswordTab;
