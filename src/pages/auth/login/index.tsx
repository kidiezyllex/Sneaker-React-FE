import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { CustomToast } from "@/components/ui/custom-toast";
import { useUser } from "@/context/useUserContext";
import { motion } from "framer-motion";
import { useLogin } from "@/hooks/authentication";
import Icon from "@mdi/react";
import { mdiLogin } from "@mdi/js";
interface LoginFormValues {
  email: string;
  password: string;
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const signInMutation = useLogin();
  const { loginUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await signInMutation.mutateAsync(formData);
      if (
        response &&
        (response.success || response.statusCode === 200) &&
        response.data?.token &&
        response.data?.account
      ) {
        loginUser(response.data.account, response.data.token);
        toast.success(<CustomToast title="Đăng nhập thành công" />, {
          icon: false,
        });
        if (response.data.account.role === "ADMIN") {
          navigate("/admin/statistics");
        } else if (response.data.account.role === "STAFF") {
          navigate("/staff/pos");
        } else {
          onSuccess();
        }
      } else {
        toast.error(
          <CustomToast
            title={response.message || "Đăng nhập thất bại"}
            type="error"
          />,
          { icon: false }
        );
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);
      toast.error(<CustomToast title="Đăng nhập thất bại" type="error" />, {
        icon: false,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 h-full">
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
        <Link
          to="/auth/register"
          className="text-base text-primary hover:text-secondary transition-colors duration-300"
        >
          Đăng ký?
        </Link>
        <Link
          to="/auth/forget-password"
          className="text-base text-primary hover:text-secondary transition-colors duration-300"
        >
          Quên mật khẩu?
        </Link>
      </div>
      <div className="flex justify-center flex-1 h-full items-end">
        <Button
          type="submit"
          className="w-full"
          disabled={signInMutation.isPending}
        >
          {signInMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </div>
    </form>
  );
}

const LoginPage: React.FC = () => {
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
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full w-[450px]"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Icon path={mdiLogin} size={0.8} className="text-primary" />
                </div>
                <span className="text-primary">Đăng nhập tài khoản</span>
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
            <CardContent className="pt-0">
              <LoginForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
