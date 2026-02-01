"use client";

import Icon from '@mdi/react';
import { mdiLogout } from '@mdi/js';
import { useNavigate } from "react-router-dom";
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
  return (
    <div className="flex items-center gap-4">
      <Button variant="destructive" onClick={handleLogout}>
        <span>Đăng xuất</span>
        <Icon path={mdiLogout} size={0.8} />
      </Button>
    </div>
  );
}
