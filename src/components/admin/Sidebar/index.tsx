import React, { useState, useMemo, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@mdi/react";
import { useLocation } from "react-router-dom";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { Link } from "react-router-dom";
import { MenuItem, SubMenuItem } from "@/interface/types";
import { menuItems } from "./menuItems";
import AdminHeader from "../Header";
import { useMenuSidebar } from "@/stores/useMenuSidebar";
import { useStableCallback } from "@/hooks/usePerformance";
import { useUserProfile } from "@/hooks/account";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = memo(function SidebarLayout({
  children,
}: SidebarLayoutProps) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const location = useLocation();
  const pathname = location.pathname;
  const { isOpen } = useMenuSidebar();
  const { data: profileData } = useUserProfile();

  const getAvatarUrl = () => {
    const userId = profileData?.data.id || "default";
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  };

  const toggleSubMenu = useStableCallback((menuId: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  });

  const isSubMenuActive = useMemo(() => {
    return (path: string, allSubItems?: SubMenuItem[]) => {
      if (pathname === path) return true;

      if (path !== "/admin" && pathname.startsWith(path + "/")) {
        if (allSubItems && allSubItems.length > 0) {
          const hasMoreSpecificMatch = allSubItems.some(sub =>
            sub.path !== path &&
            pathname.startsWith(sub.path)
          );
          if (hasMoreSpecificMatch) return false;
        }
        return true;
      }
      return false;
    };
  }, [pathname]);

  const isMenuActive = useMemo(() => {
    return (menu: MenuItem) => {
      if (menu.path && isSubMenuActive(menu.path, menu.subMenu)) return true;

      if (menu.subMenu) {
        return menu.subMenu.some((sub) => isSubMenuActive(sub.path, menu.subMenu));
      }
      return false;
    };
  }, [pathname, isSubMenuActive]);

  // Auto-expand active menus
  React.useEffect(() => {
    if (isOpen) {
      const activeMenu = menuItems.find(menu =>
        menu.subMenu && menu.subMenu.some(sub => isSubMenuActive(sub.path, menu.subMenu))
      );

      if (activeMenu && !openMenus[activeMenu.id]) {
        setOpenMenus(prev => ({ ...prev, [activeMenu.id]: true }));
      }
    }
  }, [pathname, isOpen, isSubMenuActive]);

  const handleMouseEnter = useStableCallback((menuId: string) => {
    if (!isOpen) {
      setHoverMenu(menuId);
    }
  });

  const handleMouseLeave = useStableCallback(() => {
    setHoverMenu(null);
  });

  const memoizedMenuItems = useMemo(() => menuItems, []);

  return (
    <div className="flex flex-row min-h-screen w-full">
      <div
        className={cn(
          "bg-white shadow-md min-h-screen transition-all duration-300",
          isOpen ? "w-60 min-w-60" : "w-0 md:w-16 overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          <div
            className={cn(
              "p-2 border-b !max-h-[70px] h-[70px] flex items-center",
              isOpen ? "justify-center" : "justify-center"
            )}
          >
            <div className="flex items-center justify-center flex-col-reverse gap-1">
              {isOpen && (
                <div className="flex flex-col justify-end items-end">
                  <p className="text-sm font-medium leading-none whitespace-nowrap">
                    Xin chào,{" "}
                    <span className="font-semibold text-primary">
                      {profileData?.data.fullName}
                    </span>
                  </p>
                </div>
              )}
              <Avatar className="w-10 h-10 border border-gray-200">
                <AvatarImage
                  src={getAvatarUrl()}
                  alt={profileData?.data.fullName}
                />
              </Avatar>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className={cn("space-y-1", isOpen ? "px-2" : "px-1")}>
              {memoizedMenuItems.map((menu) => (
                <li key={menu.id}>
                  {menu.subMenu && isOpen ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleSubMenu(menu.id)}
                        className={cn(
                          "flex items-center font-medium justify-between w-full rounded-md p-2 text-left text-base transition-colors",
                          isMenuActive(menu)
                            ? "bg-primary/10 text-primary !font-medium"
                            : "hover:bg-gray-100"
                        )}
                      >
                        <div className="flex items-center">
                          <Icon
                            path={menu.icon}
                            size={0.8}
                            className={cn(
                              "mr-2",
                              isMenuActive(menu)
                                ? "text-primary !font-medium"
                                : "text-maintext"
                            )}
                          />
                          <span
                            className={cn(
                              "font-medium",
                              isMenuActive(menu)
                                ? "text-primary !font-medium"
                                : ""
                            )}
                          >
                            {menu.name}
                          </span>
                        </div>
                        <Icon
                          path={
                            openMenus[menu.id] ? mdiChevronUp : mdiChevronDown
                          }
                          size={0.8}
                          className="text-maintext"
                        />
                      </button>
                      <AnimatePresence>
                        {openMenus[menu.id] && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 space-y-1 overflow-hidden"
                          >
                            {menu.subMenu.map((subItem: SubMenuItem) => (
                              <motion.li
                                key={subItem.id}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Link to={subItem.path}>
                                  <div
                                    className={cn(
                                      "flex items-center rounded-md p-2 text-base transition-colors font-medium",
                                      isSubMenuActive(subItem.path, menu.subMenu)
                                        ? "bg-primary/10 text-primary !font-medium"
                                        : "text-maintext hover:bg-gray-100"
                                    )}
                                  >
                                    {subItem.icon && (
                                      <Icon
                                        path={subItem.icon}
                                        size={0.8}
                                        className={cn(
                                          "mr-2",
                                          isSubMenuActive(subItem.path, menu.subMenu)
                                            ? "text-primary"
                                            : "text-maintext"
                                        )}
                                      />
                                    )}
                                    <span
                                      className={cn(
                                        "font-medium",
                                        isSubMenuActive(subItem.path, menu.subMenu)
                                          ? "text-primary !font-medium"
                                          : ""
                                      )}
                                    >
                                      {subItem.name}
                                    </span>
                                  </div>
                                </Link>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(menu.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link to={menu.path || "#"}>
                        <div
                          className={cn(
                            "flex items-center rounded-md p-2 text-base font-medium transition-colors ",
                            isMenuActive(menu)
                              ? "bg-primary/10 text-primary !font-medium"
                              : "text-maintext hover:bg-gray-100",
                            !isOpen && "justify-center"
                          )}
                        >
                          <Icon
                            path={menu.icon}
                            size={0.8}
                            className={cn(
                              isOpen ? "mr-2" : "mr-0",
                              isMenuActive(menu)
                                ? "text-primary !font-medium"
                                : "text-maintext"
                            )}
                          />
                          {isOpen && <span>{menu.name}</span>}
                        </div>
                      </Link>
                      {!isOpen && hoverMenu === menu.id && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.2 }}
                            className="fixed ml-16 mt-[-30px] bg-white border border-primary/20 text-main-text text-sm py-1.5 px-3 rounded-md shadow-light-grey z-50 whitespace-nowrap flex items-center"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                            <span className="font-medium">{menu.name}</span>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col bg-[#1C2B38] min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 p-4 min-h-[calc(100vh-66px)] pr-6 overflow-y-auto overflow-x-hidden">
          <div className="relative z-[2] w-full">{children}</div>
        </main>
      </div>
    </div>
  );
});

export default SidebarLayout;
