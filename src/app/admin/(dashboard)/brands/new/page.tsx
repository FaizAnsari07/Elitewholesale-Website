import AdminHeader from "@/components/admin/AdminHeader";
import TermForm from "@/components/admin/TermForm";
import { createBrandAction } from "@/app/admin/actions";

export default function NewBrandPage() {
  return (
    <div>
      <AdminHeader title="Add Brand" />
      <div className="p-4 sm:p-7">
        <TermForm action={createBrandAction} submitLabel="Create Brand" />
      </div>
    </div>
  );
}
