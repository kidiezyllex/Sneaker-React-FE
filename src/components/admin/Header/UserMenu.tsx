"use client";

import { IconLogout } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/context/useUserContext";
import { toast } from "react-toastify";
import { CustomToast } from "@/components/ui/custom-toast";
import { useUserProfile } from "@/hooks/account";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const { logoutUser } = useUser();
  const { data: profileData } = useUserProfile();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    toast.success(<CustomToast title="Đăng xuất thành công" />, {
      icon: false,
    });
    navigate("/auth/login");
  };

  const getAvatarUrl = () => {
    const userId = profileData?.data.id || "default";
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="destructive" onClick={handleLogout}>
        <span>Đăng xuất</span>
        <IconLogout size={20} />
      </Button>
    </div>
  );
}
