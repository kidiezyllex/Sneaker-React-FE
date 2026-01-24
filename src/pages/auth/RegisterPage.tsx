import React, { useState } from "react";
import { useUser } from "@/context/useUserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { CustomToast } from "@/components/ui/custom-toast";
import { motion } from "framer-motion";
import Icon from "@mdi/react";
import { mdiAccountPlus } from "@mdi/js";
import { useRegister } from "@/hooks/authentication";

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { loginUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: registerUser, isPending: isLoading } = useRegister();
  const [formData, setFormData] = useState<RegisterFormValues>({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    registerUser(formData, {
      onSuccess: (data) => {
        if ((data as any)?.success || (data as any).statusCode === 200) {
          const token = (data as any)?.data?.token;
          const account = (data as any)?.data?.account;

          if (token && account) {
            loginUser(account, token);
            toast.success(<CustomToast title="Đăng ký thành công!" />, {
              icon: false,
            });
            navigate("/");
          } else {
            toast.success(
              <CustomToast
                title="Đăng ký thành công!"
                description="Vui lòng đăng nhập để tiếp tục."
              />,
              { icon: false }
            );
            setTimeout(() => {
              navigate("/auth/login");
            }, 1500);
          }
        } else {
          toast.error(
            <CustomToast
              title={data.message || "Đăng ký thất bại"}
              type="error"
            />,
            { icon: false }
          );
        }
      },
      onError: (error: any) => {
        toast.error(
          <CustomToast
            title={error?.response?.data?.message || "Đăng ký thất bại"}
            type="error"
          />,
          { icon: false }
        );
      },
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 h-full">
      <div>
        <label className="text-maintext dark:text-gray-300 block mb-2 font-semibold text-sm">
          Họ và tên
        </label>
        <Input
          type="text"
          name="fullName"
          placeholder="Nhập họ và tên"
          value={formData.fullName}
          onChange={handleInputChange}
          className="border-gray-300 dark:border-gray-700 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="text-maintext dark:text-gray-300 block mb-2 font-semibold text-sm">
          Email
        </label>
        <Input
          type="email"
          name="email"
          placeholder="Nhập email của bạn"
          value={formData.email}
          onChange={handleInputChange}
          className="border-gray-300 dark:border-gray-700 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="text-maintext dark:text-gray-300 block mb-2 font-semibold text-sm">
          Số điện thoại
        </label>
        <Input
          type="tel"
          name="phoneNumber"
          placeholder="Nhập số điện thoại"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="border-gray-300 dark:border-gray-700 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="text-maintext dark:text-gray-300 block mb-2 font-semibold text-sm">
          Mật khẩu
        </label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            className="border-gray-300 dark:border-gray-700 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 pr-10"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-maintext hover:text-maintext focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <a
          href="/auth/login"
          className="text-base text-primary hover:text-secondary transition-colors duration-300"
        >
          Đã có tài khoản? Đăng nhập
        </a>
      </div>
      <div className="flex justify-center flex-1 h-full items-end mt-4">
        <Button
          type="submit"
          className="bg-primary hover:bg-secondary transition-all duration-300 text-base font-medium w-full py-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang đăng ký...
            </>
          ) : (
            "Đăng ký"
          )}
        </Button>
      </div>
    </form>
  );
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate("/");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-green-50 via-green-100 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hiệu ứng bong bóng trang trí */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute h-20 w-20 rounded-full bg-primary/70 top-12 left-[10%]"></div>
        <div className="absolute h-24 w-24 rounded-full bg-secondary/80 top-36 right-[15%]"></div>
        <div className="absolute h-16 w-16 rounded-full bg-primary/40 bottom-10 left-[20%]"></div>
        <div className="absolute h-32 w-32 rounded-full bg-secondary/70 -bottom-10 right-[25%]"></div>
        <div className="absolute h-28 w-28 rounded-full bg-primary/70 -top-10 left-[40%]"></div>
        <div className="absolute h-12 w-12 rounded-full bg-secondary/40 top-1/2 left-[5%]"></div>
        <div className="absolute h-14 w-14 rounded-full bg-primary/80 bottom-1/3 right-[10%]"></div>
        <div className="absolute w-10 h-10 rounded-full bg-secondary/70 top-1/4 right-[30%]"></div>
        <div className="absolute h-36 w-36 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 -bottom-16 left-[30%] blur-sm"></div>
        <div className="absolute h-40 w-40 rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 -top-20 right-[20%] blur-sm"></div>
      </div>

      <div className="w-full flex justify-center items-center relative z-10">
        {/* Form đăng ký */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full w-[500px]"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Icon
                    path={mdiAccountPlus}
                    size={0.8}
                    className="text-primary"
                  />
                </div>
                <span className="text-primary">Đăng ký tài khoản</span>
              </CardTitle>
              <img
                draggable="false"
                src="/images/logo.png"
                alt="logo"
                width={100}
                height={100}
                className="w-auto mx-auto h-20 select-none cursor-pointer"
              />
            </CardHeader>
            <CardContent>
              <RegisterForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
