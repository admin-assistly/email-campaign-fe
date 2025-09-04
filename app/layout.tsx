import type { Metadata } from "next";

import "./globals.css";
import { OnboardingModal } from "../components/OnboardingModal";
import { ToastProvider } from "../components/Toast";
import { ClientErrorBoundary } from "../components/ClientErrorBoundary";
import { ProgressiveOnboarding } from "../components/ProgressiveOnboarding";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";

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
            <ServiceWorkerRegistration />
            <ProgressiveOnboarding />
            <OnboardingModal />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </ToastProvider>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
