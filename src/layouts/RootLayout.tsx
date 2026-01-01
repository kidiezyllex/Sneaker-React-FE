import React from "react";
import { Outlet } from "react-router-dom";

const RootLayout: React.FC = () => {
  return (
    <div className="bg-[#F6F8F7] min-h-screen">
      <Outlet />
    </div>
  );
};

export default RootLayout;
