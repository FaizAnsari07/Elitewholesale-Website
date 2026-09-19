import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";

// Page content (About, Contact, Shop, etc.) is built directly into the
// Next.js codebase (src/app/**) rather than managed through a CMS, so this
// is a static reference list of the real site routes -- not backed by any
// external data source.
type SitePage = { title: string; route: string };

const SITE_PAGES: SitePage[] = [
  { title: "Home", route: "/" },
  { title: "Shop", route: "/shop" },
  { title: "Categories", route: "/categories" },
  { title: "Brands", route: "/brands" },
  { title: "About Us", route: "/about-us" },
  { title: "Contact Us", route: "/contact-us" },
  { title: "Cart", route: "/cart" },
  { title: "My Account", route: "/my-account" },
  { title: "Refund & Returns Policy", route: "/refund_returns" },
  { title: "Privacy Policy", route: "/privacy-policy" },
  { title: "Terms & Services", route: "/terms-services" },
  { title: "Enquiry / Cart", route: "/enquiry" },
];

export default function AdminPagesPage() {
  const columns: DataTableColumn<SitePage>[] = [
    { key: "title", header: "Title", render: (p) => <span className="font-semibold">{p.title}</span> },
    { key: "route", header: "Route", render: (p) => <span className="text-muted-foreground">{p.route}</span> },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <Link href={p.route} target="_blank" className="text-sm font-semibold text-primary hover:underline">
          View Live Page
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader title="Pages" />
      <div className="p-4 sm:p-7">
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Page content is built directly into the site&apos;s codebase rather
          than managed here. This is a reference list of every page.
        </p>
        <DataTable columns={columns} rows={SITE_PAGES} getRowId={(p) => p.route} />
      </div>
    </div>
  );
}
