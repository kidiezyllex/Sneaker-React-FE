import React from "react";
import { Outlet } from "react-router-dom";
import NavigationBar from "@/components/customer/NavigationBar";
import Footer from "@/components/customer/Footer";
import { ChatWindow } from "@/components/customer/Chatbot";

const RootLayout: React.FC = () => {
  return (
    <div className="bg-[#F6F8F7] min-h-screen">
      <NavigationBar />
      <Outlet />
      <Footer />

      {/* AI Chatbot */}
      <ChatWindow />
    </div>
  );
};

export default RootLayout;
