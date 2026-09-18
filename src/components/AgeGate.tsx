"use client";

import { useState, useSyncExternalStore } from "react";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <h2 className="text-xl font-bold text-brand">Age Verification</h2>
        <p className="mt-3 text-sm text-muted">
          This website sells vape, tobacco-related, and smoke shop products.
          You must be 21 years of age or older to enter this site.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={confirmAge}
            className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            I am 21 or older
          </button>
          <a
            href="https://www.google.com"
            className="rounded-md border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Leave site
          </a>
        </div>
      </div>
    </div>
  );
}
