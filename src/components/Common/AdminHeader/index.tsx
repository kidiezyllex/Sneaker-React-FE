"use client";

import { IconLayoutSidebarRightExpandFilled } from "@tabler/icons-react";
import { useMenuSidebar } from "@/stores/useMenuSidebar";
import UserMenu from "./UserMenu";

export default function AdminHeader() {
  const { toggle } = useMenuSidebar();

  return (
    <header className="h-[70px] border-b bg-white flex items-center justify-between pr-6 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <IconLayoutSidebarRightExpandFilled
            size={24}
            stroke={1.5}
            className="text-maintext"
          />
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <UserMenu />
      </div>
    </header>
  );
}
