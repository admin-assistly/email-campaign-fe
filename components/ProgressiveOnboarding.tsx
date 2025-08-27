"use client";
import { useEffect, useState } from "react";

const steps = [
  "Welcome to the app! Use the theme switcher in the header.",
  "Check out the style guide for design tokens and components.",
  "Try creating your first campaign or managing subscribers.",
];

export function ProgressiveOnboarding() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("progressive-onboarding");
    if (!seen) setOpen(true);
  }, []);

  function next() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setOpen(false);
      localStorage.setItem("progressive-onboarding", "true");
    }
  }

  if (!open) return null;
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-lg shadow-lg px-6 py-4 max-w-md w-full flex flex-col items-center border"
      style={{
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderColor: "var(--border-default)",
      }}
    >
      <p className="mb-4">{steps[step]}</p>
      <button
        className="px-4 py-2 rounded border"
        style={{
          background: "var(--color-primary)",
          color: "#fff",
          borderColor: "var(--focus-outline)",
        }}
        onClick={next}
      >
        {step < steps.length - 1 ? "Next" : "Done"}
      </button>
    </div>
  );
}
