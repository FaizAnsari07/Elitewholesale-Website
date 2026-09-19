import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import TermForm from "@/components/admin/TermForm";
import { getBrand } from "@/lib/admin-api";
import { updateBrandAction } from "@/app/admin/actions";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brandId = Number(id);
  const brand = await getBrand(brandId).catch(() => null);
  if (!brand) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${brand.name}`} />
      <div className="p-4 sm:p-7">
        <TermForm action={updateBrandAction.bind(null, brandId)} term={brand} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
