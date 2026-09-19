import AdminHeader from "@/components/admin/AdminHeader";
import TermForm from "@/components/admin/TermForm";
import { createCategoryAction } from "@/app/admin/actions";

export default function NewCategoryPage() {
  return (
    <div>
      <AdminHeader title="Add Category" />
      <div className="p-4 sm:p-7">
        <TermForm withImage action={createCategoryAction} submitLabel="Create Category" />
      </div>
    </div>
  );
}
