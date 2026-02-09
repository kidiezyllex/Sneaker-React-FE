"use client";

import React, { useEffect, useState, createContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "@mdi/react";
import {
  mdiAccountEdit,
  mdiChevronRight,
  mdiOrderBoolAscending,
  mdiKeyboardReturn,
  mdiTicketPercentOutline,
  mdiAccountBadgeOutline,
  mdiLock,
} from "@mdi/js";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useUser } from "@/context/useUserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import ProfileTab from "./components/ProfileTab";
import PasswordTab from "./components/PasswordTab";
import OrdersTab from "./components/OrdersTab";
import ReturnsTab from "./components/ReturnsTab";
import VouchersTab from "./components/VouchersTab";

export const AccountTabContext = createContext({
  activeTab: "profile",
  setActiveTab: (tab: string) => { },
});

export default function GeneralManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const { isAuthenticated, isLoadingProfile } = useUser();

  useEffect(() => {
    const updateActiveTabFromHash = () => {
      if (
        typeof window !== "undefined" &&
        window.location.hash.startsWith("#account-tabs")
      ) {
        const hash = window.location.hash;
        const queryString = hash.includes("?")
          ? hash.split("?")[1]
          : window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const tabParam = urlParams.get("tab");

        if (
          tabParam &&
          [
            "profile",
            "password",
            "settings",
            "orders",
            "vouchers",
            "returns",
          ].includes(tabParam)
        ) {
          setActiveTab(tabParam);
        } else {
          setActiveTab("profile");
        }
      }
    };
    updateActiveTabFromHash();
    window.addEventListener("hashchange", updateActiveTabFromHash);

    return () => {
      window.removeEventListener("hashchange", updateActiveTabFromHash);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !isLoadingProfile) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, isLoadingProfile, navigate]);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AccountTabContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="p-8 relative py-4">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link
                to="/"
                className="!text-maintext hover:!text-maintext"
              >
                Trang chủ
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="!text-maintext hover:!text-maintext" />
            <BreadcrumbItem>
              <BreadcrumbPage className="!text-maintext hover:!text-maintext">
                Quản lý tài khoản
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="sticky">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon
                      path={mdiAccountBadgeOutline}
                      size={0.8}
                      className="text-primary"
                    />
                  </div>
                  <span>Quản lý tài khoản</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col" id="account-sidebar-tabs">
                  {[
                    {
                      title: "Thông tin cá nhân",
                      icon: mdiAccountEdit,
                      value: "profile",
                    },
                    { title: "Đổi mật khẩu", icon: mdiLock, value: "password" },
                    {
                      title: "Đơn hàng đã đặt",
                      icon: mdiOrderBoolAscending,
                      value: "orders",
                    },
                    {
                      title: "Trả hàng",
                      icon: mdiKeyboardReturn,
                      value: "returns",
                    },
                    {
                      title: "Mã giảm giá",
                      icon: mdiTicketPercentOutline,
                      value: "vouchers",
                    },
                  ].map((tab) => (
                    <motion.div
                      key={tab.value}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to={`#account-tabs?tab=${tab.value}`}
                        data-value={tab.value}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-green-50 ${activeTab === tab.value
                          ? "bg-green-50 text-primary font-semibold"
                          : ""
                          }`}
                        onClick={() => {
                          setActiveTab(tab.value);
                        }}
                      >
                        <div className="flex items-center">
                          <Icon
                            path={tab.icon}
                            size={0.8}
                            className={`mr-2 text-maintext -mt-1 ${activeTab === tab.value ? "text-primary" : ""
                              }`}
                          />
                          <span className={`${activeTab === tab.value ? "text-primary font-semibold" : "text-maintext"}`}>
                            {tab.title}
                          </span>
                        </div>
                        {activeTab === tab.value && (
                          <Icon
                            path={mdiChevronRight}
                            size={0.8}
                            className="text-primary"
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            className="md:col-span-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>
              <TabsContent value="password">
                <PasswordTab />
              </TabsContent>
              <TabsContent value="orders">
                <OrdersTab />
              </TabsContent>
              <TabsContent value="returns">
                <ReturnsTab />
              </TabsContent>
              <TabsContent value="vouchers">
                <VouchersTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </AccountTabContext.Provider>
  );
}
