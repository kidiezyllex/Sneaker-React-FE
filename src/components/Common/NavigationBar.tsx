import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "@mdi/react";
import { mdiCart, mdiRobotHappyOutline } from "@mdi/js";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/pages/products/components/CartSheet";
import { useUser } from "@/context/useUserContext";
import { useCartStore } from "@/stores/useCartStore";
import { useChatStore } from "@/stores/useChatStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AccountDropdown from "@/components/Common/AccountDropdown";

const tabs = [
  { text: "Trang chủ", href: "/" },
  { text: "Sản phẩm", href: "/products" },
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
      className={`${selected
        ? "text-white"
        : "text-gray-700 hover:text-gray-700 dark:hover:text-gray-100"
        } relative rounded-xl px-3 py-1.5 text-sm font-medium transition-colors`}
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
  const { isOpen: isChatOpen, setOpen: setChatOpen } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            draggable="false"
            src="/images/logo.png"
            alt="logo"
            width={500}
            height={500}
            className="w-auto mx-auto h-14 select-none cursor-pointer"
          />
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {tabs.map((tab) => (
            <Link key={tab.text} to={tab.href}>
              <Tab
                text={tab.text}
                selected={selected === tab.text}
                setSelected={setSelected}
              />
            </Link>
          ))}
        </div>
        {/* User Actions */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/auth/login">
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <div className="text-sm font-medium text-gray-700 flex flex-col">
                <span>Xin chào 👋, khách hàng</span>
                <span className="text-primary font-semibold">
                  {user?.fullName || "Khách hàng"}
                </span>
              </div>
            </div>
          )}
          <TooltipProvider>
            <div className="flex items-center gap-3">
              {/* AI Chat Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setChatOpen(!isChatOpen)}
                    className="relative w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center transition-all"
                  >
                    <Icon path={mdiRobotHappyOutline} size={0.65} />
                    {isChatOpen && (
                      <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-25"></span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Trợ lý AI hỗ trợ mua sắm</p>
                </TooltipContent>
              </Tooltip>

              {/* Cart Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsOpen(true)}
                    className="relative w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center transition-all"
                  >
                    <Icon path={mdiCart} size={0.65} />
                    <span className="absolute -top-1 -right-1 bg-extra text-white text-sm rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Giỏ hàng của bạn</p>
                </TooltipContent>
              </Tooltip>
              {isAuthenticated && <AccountDropdown />}
            </div>
          </TooltipProvider>
        </div>
      </div>
      <CartSheet open={isOpen} onOpenChange={setIsOpen} />
    </header>
  );
};

export default NavigationBar;
