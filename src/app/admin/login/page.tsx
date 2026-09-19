import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { loginAction } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from = "/admin", error } = await searchParams;

  return (
    <div className="relative grid min-h-screen place-items-center p-4">
      <Image
        src="/images/admin-login-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover opacity-10"
      />
      <div className="glass-strong w-full max-w-sm rounded-2xl p-7">
        <LockKeyhole className="size-9 text-primary" />
        <h1 className="mt-5 text-2xl font-black">Admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage products, categories, brands, and site settings.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
            Invalid username or password.
          </p>
        )}

        <form action={loginAction} className="mt-6 grid gap-4">
          <input type="hidden" name="from" value={from} />
          <label>
            <span className="label">Username</span>
            <input required type="text" name="username" autoComplete="username" className="field" />
          </label>
          <label>
            <span className="label">Password</span>
            <input required type="password" name="password" autoComplete="current-password" className="field" />
          </label>
          <button type="submit" className="btn btn-primary">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
