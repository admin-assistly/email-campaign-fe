import type { Metadata } from "next";

import "./globals.css";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";
import { OnboardingModal } from "../components/OnboardingModal";
import { ToastProvider } from "../components/Toast";
import { ClientErrorBoundary } from "../components/ClientErrorBoundary";

import { ProgressiveOnboarding } from "../components/ProgressiveOnboarding";

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientErrorBoundary>
          <ToastProvider>

            <ProgressiveOnboarding />
            <OnboardingModal />
            <header className="w-full flex justify-end p-4">
              <ThemeSwitcher />
            </header>
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </ToastProvider>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
