"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { Bell, Menu, User } from "lucide-react";
import { authService } from "@/services/auth";
import Image from "next/image";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  useEffect(() => {
    // Get user info from auth service
    const getUserInfo = async () => {
      try {
        const response = await authService.checkSession();
        if (response.success && response.data?.isLoggedIn) {
          setUser({
            email: response.data.user_email || "user@example.com",
            name: response.data.user_name
          });
        }
      } catch (error) {
        console.error("Failed to get user info:", error);
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.name) {
      return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return user.email.split("@")[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: Logo and Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/campaign-logo.png"
              alt="CampaignMaster"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-xl font-semibold text-gray-900">
              CampaignMaster
            </span>
          </Link>
        </div>

        {/* Right: Theme, Notifications, User */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-brand text-white text-sm font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-text-muted">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
