import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/wordpress";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }
  const results = await searchProducts(q);
  return NextResponse.json({ results });
}
