import { readSettings } from "@/lib/admin-settings";
import EnquiryPageClient from "./EnquiryPageClient";

// Reads from a local file, not fetch(), so it needs an explicit opt-out of
// static generation -- otherwise the recipient email set in /admin/settings
// would only take effect after a rebuild.
export const dynamic = "force-dynamic";

export default async function EnquiryPage() {
  const settings = await readSettings();
  return <EnquiryPageClient recipientEmail={settings.enquiryRecipientEmail} />;
}
