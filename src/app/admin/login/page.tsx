import Image from "next/image";
import { loginAction } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from = "/admin", error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
        <div className="flex justify-center">
          <Image
            src="/images/elite-wholesale-logo.png"
            alt="Elite Wholesale"
            width={180}
            height={83}
            className="h-12 w-auto"
          />
        </div>
        <h1 className="mt-6 text-center text-lg font-bold text-ink">Admin Login</h1>

        {error && (
          <p className="mt-4 rounded-md bg-accent/10 px-3 py-2 text-center text-sm font-medium text-accent">
            Invalid username or password.
          </p>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="from" value={from} />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Username
            </label>
            <input
              required
              type="text"
              name="username"
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Password
            </label>
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
