import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import TermForm from "@/components/admin/TermForm";
import { getCategory } from "@/lib/admin-api";
import { updateCategoryAction } from "@/app/admin/actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);
  const category = await getCategory(categoryId).catch(() => null);
  if (!category) notFound();

  return (
    <div>
      <AdminHeader title={`Edit: ${category.name}`} />
      <div className="p-4 sm:p-7">
        <TermForm
          withImage
          action={updateCategoryAction.bind(null, categoryId)}
          term={category}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
