"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Mail,
  MessageSquare,
  Users,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Campaigns",
    href: "/campaigns",
    icon: Mail,
  },
  {
    name: "Responses",
    href: "/responses",
    icon: MessageSquare,
  },
  {
    name: "Subscribers",
    href: "/subscribers",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out md:translate-x-0 overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 pt-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 rounded-2xl px-4 py-3 text-left",
                      isActive
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>v1.0.0</span>
              <Link
                href="/help"
                className="flex items-center gap-1 hover:text-gray-700 transition-colors"
              >
                <HelpCircle className="h-3 w-3" />
                Help
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 md:hidden"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </aside>
    </>
  );
}
