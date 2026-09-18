import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function AdminHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-black/10 bg-white px-4 sm:px-6">
      <h1 className="text-lg font-bold text-ink">{title}</h1>
      <div className="flex items-center gap-4">
        <Link href="/" target="_blank" className="text-sm font-semibold text-accent hover:underline">
          View Site &rarr;
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-semibold text-ink hover:bg-cream"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
