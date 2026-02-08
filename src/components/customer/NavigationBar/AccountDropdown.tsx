"use client";

import { motion } from "framer-motion";
import { Icon } from "@mdi/react";
import { mdiAccount, mdiLogout, mdiViewDashboard } from "@mdi/js";
import { Link } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/context/useUserContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const AccountDropdown = () => {
  const { logoutUser, profile } = useUser();
  const handleLogout = () => {
    logoutUser();
  };
  const getAvatarUrl = () => {
    const userId = profile?.data?.id || "default";
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ml-2">
          <Avatar className="w-10 h-10  border border-primary/20">
            <AvatarImage
              src={getAvatarUrl()}
              alt={profile?.data?.fullName || "User"}
            />
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount asChild>
        <motion.div initial="hidden" animate="visible" exit="exit">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">
                {profile?.data?.fullName || "Người dùng"}
              </p>
              <p className="text-sm leading-none text-gray-600">
                {profile?.data?.email || ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <motion.div transition={{ delay: 0.05 }}>
            <DropdownMenuItem asChild>
              <Link to="/account" className="flex items-center cursor-pointer">
                <Icon
                  path={mdiAccount}
                  size={0.8}
                  className="mr-2 text-maintext"
                />
                <span className="!text-maintext font-semibold">Quản lý tài khoản</span>
              </Link>
            </DropdownMenuItem>
          </motion.div>

          {profile?.data?.role === "ADMIN" && (
            <motion.div transition={{ delay: 0.07 }}>
              <DropdownMenuItem asChild>
                <Link
                  to="/admin/statistics"
                  className="flex items-center cursor-pointer"
                >
                  <Icon
                    path={mdiViewDashboard}
                    size={0.8}
                    className="mr-2 text-maintext"
                  />
                  <span className="!text-maintext">Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </motion.div>
          )}
          <DropdownMenuSeparator />
          <motion.div transition={{ delay: 0.1 }}>
            <DropdownMenuItem
              className="text-rose-500 focus:text-rose-500 cursor-pointer"
              onClick={handleLogout}
            >
              <Icon path={mdiLogout} size={0.8} className="mr-2" />
              <span className="font-semibold">Đăng xuất</span>
            </DropdownMenuItem>
          </motion.div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
