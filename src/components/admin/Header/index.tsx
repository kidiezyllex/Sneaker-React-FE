"use client";

import Icon from '@mdi/react';
import { mdiMenuOpen } from '@mdi/js';
import { useMenuSidebar } from "@/stores/useMenuSidebar";
import UserMenu from "./UserMenu";

export default function AdminHeader() {
  const { toggle } = useMenuSidebar();

  return (
    <header className="h-[70px] border-b bg-white flex items-center justify-between pr-6 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={toggle}
          className="w-10 h-10  flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <Icon
            path={mdiMenuOpen}
            size={0.8}
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
