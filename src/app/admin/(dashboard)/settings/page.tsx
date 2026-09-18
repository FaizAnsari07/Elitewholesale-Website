import AdminHeader from "@/components/admin/AdminHeader";
import { readSettings } from "@/lib/admin-settings";
import { saveSettingsAction } from "@/app/admin/actions";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const settings = await readSettings();

  return (
    <div>
      <AdminHeader title="Email Settings" />
      <div className="p-6">
        {saved && (
          <p className="mb-4 max-w-lg rounded-md bg-success/10 px-3 py-2 text-sm font-medium text-success">
            Settings saved.
          </p>
        )}
        <form
          action={saveSettingsAction}
          className="max-w-lg space-y-5 rounded-xl border border-black/10 bg-white p-6"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">
              Enquiry Notification Email
            </label>
            <p className="mt-1 text-xs text-muted">
              Wholesale enquiries submitted from the site&apos;s product/
              enquiry pages are addressed to this email.
            </p>
            <input
              required
              type="email"
              name="enquiryRecipientEmail"
              defaultValue={settings.enquiryRecipientEmail}
              className="mt-2 w-full rounded-md border border-black/15 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
