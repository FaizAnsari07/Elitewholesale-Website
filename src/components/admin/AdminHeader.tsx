import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function AdminHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
      <div>
        <p className="section-label">Workspace</p>
        <h1 className="font-display text-xl font-black">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" target="_blank" className="text-sm font-semibold text-primary hover:underline lg:hidden">
          View Site &rarr;
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="btn btn-secondary"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
