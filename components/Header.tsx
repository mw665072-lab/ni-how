"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/context/AppContext";
import { Menu, User, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { resetOnboarding, logout, state, sidebarOpen, setSidebarOpen } = useAppContext();
  const router = useRouter();

  const handleLogout = () => {
    try {
      // central logout will clear cookies, localStorage and broadcast to other tabs
      logout();
    } catch (err) {
      console.warn('Logout failed (context logout):', err);
    }

    // Clear session storage and other session-only keys
    try {
      sessionStorage.removeItem("currentSession");
      sessionStorage.removeItem("sessionFeedback");
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach((key) => {
        if (
          key.startsWith("session") ||
          key.includes("scenario") ||
          key.includes("attempt")
        ) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (err) {
      // ignore sessionStorage errors
    }

    // Keep resetOnboarding in case onboarding userName needs clearing
    try {
      resetOnboarding();
    } catch (err) {
      // ignore
    }

    // Navigate to login
    // router.push("/login");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "صباح الخير";
    } else if (hour < 18) {
      return "مساء الخير";
    } else {
      return "مساء الخير";
    }
  };

  return (
    <div className="px-4 py-4 md:px-6" dir="rtl">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer">
                <User className="h-6 w-6 text-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* App Title */}
          <div className="text-center">
            <div className="flex gap-2 text-3xl font-bold mb-2 justify-center items-center">
              <span className="text-red-500">你</span>
              <span className="text-yellow-500">好</span>
            </div>
            <div className="flex gap-2 text-1xl font-bold justify-center items-center">
              <span className="text-yellow-500">ني هاو</span>
              <span className="text-brand ml-2">الآن</span>
            </div>
          </div>

          {/* Hamburger Menu */}
          <div className="flex items-center gap-2">
            <Button onClick={handleLogout} variant="outline" size="sm" className="p-2">
              تسجيل الخروج
            </Button>
            {/* Mobile hamburger toggles sidebar as slide-over */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
            </Button>
          </div>
        </div>

        {/* Greeting Section */}
        <div className="py-4">
          <div className="text-right">
            <div className="text-lg text-gray-700">
              مرحباً{" "}
              <span className="font-bold text-brand">
                {state.user || "محمد"}
              </span>
            </div>
            <div className="text-base text-gray-600">{getGreeting()}</div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        {/* Left Section - User Greeting and Profile */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer">
                <User className="h-6 w-6 text-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleLogout}>
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="text-left">
            <div className="font-bold text-lg">
              مرحبًا{" "}
              <span className="text-green-500">{state.user || "محمد"}</span>
            </div>
            <div className="text-gray-700 font-medium">صباح الخير</div>
          </div>
          {/* <Button onClick={handleLogout} variant="outline" size="sm">
            تسجيل الخروج
          </Button> */}
        </div>

        {/* Right Section - App Title */}
        <div className="text-right">
          <div className="flex gap-2 text-3xl font-bold mb-2 items-center justify-end">
            <span className="text-red-500">好</span>
            <span className="text-yellow-500 ml-2">你</span>
          </div>
          <div className="flex gap-2 text-xl font-bold items-center justify-end">
            <span className="text-yellow-500">ني هاو</span>
            <span className="text-green-500 ml-2">الآن</span>
          </div>
        </div>
      </div>
    </div>
  );
}
