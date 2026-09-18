import "server-only";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { siteConfig } from "@/lib/site";

// A single small setting (where enquiry emails go) doesn't warrant real
// database/options-API plumbing -- WPGraphQL doesn't expose generic
// WordPress option CRUD, and adding a REST/DB layer just for this would be
// disproportionate. Stored as a local JSON file instead, read/written by
// server actions only.
const SETTINGS_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(SETTINGS_DIR, "admin-settings.json");

export type AdminSettings = {
  enquiryRecipientEmail: string;
};

function defaults(): AdminSettings {
  return { enquiryRecipientEmail: siteConfig.email };
}

export async function readSettings(): Promise<AdminSettings> {
  try {
    const raw = await readFile(SETTINGS_PATH, "utf-8");
    return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    return defaults();
  }
}

export async function writeSettings(settings: AdminSettings): Promise<void> {
  await mkdir(SETTINGS_DIR, { recursive: true });
  await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}
