
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-cinema-black text-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout;
