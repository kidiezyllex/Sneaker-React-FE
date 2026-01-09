import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@mdi/react";
import { mdiCart } from "@mdi/js";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/useUserContext";
import AccountDropdown from "./AccountDropdown";
import { useCartStore } from "@/stores/useCartStore";
import CartSheet from "../ui/CartSheet";

const tabs = [
  { text: "Trang chủ", href: "/" },
  { text: "Sản phẩm", href: "/products" },
  { text: "Giới thiệu", href: "/about-us" },
];

interface TabProps {
  text: string;
  selected: boolean;
  setSelected: (text: string) => void;
}

const Tab = React.memo(({ text, selected, setSelected }: TabProps) => {
  return (
    <button
      onClick={() => setSelected(text)}
      className={`${
        selected
          ? "text-white"
          : "text-maintext hover:text-maintext dark:hover:text-gray-100"
      } relative rounded-2xl px-3 py-1.5 text-sm font-medium transition-colors`}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-md bg-primary/80"
        ></motion.span>
      )}
    </button>
  );
});
export const NavigationBar = () => {
  const currentPath = window.location.pathname;
  const initialTab = React.useMemo(() => {
    const activeTab = tabs.find((tab) => tab.href === currentPath);
    return activeTab ? activeTab.text : tabs[0].text;
  }, []);

  const [selected, setSelected] = useState<string>(initialTab);
  const { isAuthenticated, user } = useUser();
  const { totalItems } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img
            draggable="false"
            src="/images/logo.png"
            alt="logo"
            width={500}
            height={500}
            className="w-auto mx-auto h-14 select-none cursor-pointer"
          />
        </a>

        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {tabs.map((tab) => (
            <a key={tab.text} href={tab.href}>
              <Tab
                text={tab.text}
                selected={selected === tab.text}
                setSelected={setSelected}
              />
            </a>
          ))}
        </div>
        {/* User Actions */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <a
                href="/auth/login"
                className="border border-primary text-primary hover:text-primary/80 rounded-md"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border border-primary text-primary hover:text-primary/80 rounded-md"
                >
                  Đăng nhập
                </Button>
              </a>
              <a href="/auth/register" className="rounded-md bg-primary/80">
                <Button size="sm" className="rounded-md bg-primary/80">
                  Đăng ký
                </Button>
              </a>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-maintext">
                Xin chào,{" "}
                <span className="text-primary font-semibold">
                  {user?.fullName || "Khách hàng"}
                </span>
              </span>
            </div>
          )}
          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(true)}
              className="relative h-10 w-10 flex items-center justify-center text-maintext hover:text-primary transition-colors"
            >
              <Icon path={mdiCart} size={0.8} />
              <span className="absolute -top-1 -right-1 bg-extra text-white text-sm rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            </button>
            <AccountDropdown />
          </div>
        </div>
      </div>
      <CartSheet open={isOpen} onOpenChange={setIsOpen} />
    </header>
  );
};

export default NavigationBar;
