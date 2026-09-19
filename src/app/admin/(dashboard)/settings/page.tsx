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
      <div className="p-4 sm:p-7">
        {saved && (
          <p className="mb-4 max-w-lg rounded-md bg-success/10 px-3 py-2 text-sm font-medium text-success">
            Settings saved.
          </p>
        )}
        <form
          action={saveSettingsAction}
          className="glass max-w-lg space-y-5 rounded-xl p-6"
        >
          <div>
            <label className="label">
              Enquiry Notification Email
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Wholesale enquiries submitted from the site&apos;s product/
              enquiry pages are addressed to this email.
            </p>
            <input
              required
              type="email"
              name="enquiryRecipientEmail"
              defaultValue={settings.enquiryRecipientEmail}
              className="field mt-2"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
