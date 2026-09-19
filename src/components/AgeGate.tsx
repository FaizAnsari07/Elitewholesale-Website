"use client";

import { useState, useSyncExternalStore } from "react";
import { ShieldCheck } from "lucide-react";

const STORAGE_KEY = "elite-wholesale-age-verified";

function subscribe() {
  // Verification state only changes via confirmAge() in this component,
  // which triggers its own re-render, so no external subscription is needed.
  return () => {};
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return true; // treat as verified during SSR so no flash of the gate occurs
}

export default function AgeGate() {
  const verified = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  if (verified || dismissed) return null;

  function confirmAge() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
    setDismissed(true);
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/90 p-4 backdrop-blur-xl">
      <div className="glass-strong w-full max-w-md rounded-2xl p-8 text-center">
        <ShieldCheck className="mx-auto size-10 text-primary" />
        <p className="section-label mt-5">Restricted catalogue</p>
        <h2 className="mt-2 text-2xl font-black">Age verification</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This website sells vape, tobacco-related, and smoke shop products.
          You must be 21 years of age or older to enter.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={confirmAge} className="btn btn-primary">
            I am 21 or older
          </button>
          <a className="btn btn-secondary" href="https://www.google.com">
            Leave site
          </a>
        </div>
      </div>
    </div>
  );
}
