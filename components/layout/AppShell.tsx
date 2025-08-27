"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 overflow-x-hidden">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex h-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto md:ml-64 main-scrollbar pt-16">
          <div className="p-4 md:p-6 max-w-full min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
