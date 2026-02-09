import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "@/components/Common/Footer";
import { ChatWindow } from "@/components/Common/ChatWindow";
import NavigationBar from "@/components/Common/NavigationBar";

const RootLayout: React.FC = () => {
  return (
    <div className="bg-[#F6F8F7] min-h-screen">
      <NavigationBar />
      <Outlet />
      <Footer />
      <ChatWindow />
    </div>
  );
};

export default RootLayout;
