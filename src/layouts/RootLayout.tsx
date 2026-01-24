import React from "react";
import { Outlet } from "react-router-dom";
import NavigationBar from "@/components/HomePage/NavigationBar";
import Footer from "@/components/Common/Footer";

const RootLayout: React.FC = () => {
  return (
    <div className="bg-[#F6F8F7] min-h-screen">
      <NavigationBar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default RootLayout;
