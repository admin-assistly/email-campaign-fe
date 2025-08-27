"use client";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authService.checkSession();
      if (response.success && response.data?.isLoggedIn) {
        setIsAuthenticated(true);
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Redirect to login on error
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // This should not render as we redirect above
  return null;
}
