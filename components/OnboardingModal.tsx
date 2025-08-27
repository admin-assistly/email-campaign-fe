"use client";
import { useEffect, useRef, useState } from "react";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = localStorage.getItem("onboarding-seen");
    if (!seen) setOpen(true);
  }, []);

  // Focus modal on open
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  // Escape key to close and focus trap
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleClose() {
    setOpen(false);
    localStorage.setItem("onboarding-seen", "true");
  }

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Email Campaign UI"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="rounded-lg shadow-lg p-8 max-w-md w-full text-center border outline-none"
        style={{
          backgroundColor: "var(--bg-surface)",
          color: "var(--text-primary)",
          borderColor: "var(--border-default)",
        }}
      >
        <h2 className="text-2xl font-bold mb-4">
          Welcome to Email Campaign UI!
        </h2>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>
          Get started by exploring campaigns, managing subscribers, and sending
          your first email blast. Use the theme switcher for your preferred
          look!
        </p>
        <button
          className="mt-2 px-4 py-2 rounded transition border"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "#fff",
            borderColor: "var(--focus-outline)",
          }}
          onClick={handleClose}
        >
          Let’s Go
        </button>
      </div>
    </div>
  );
}
