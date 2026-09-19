import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }
  try {
    return NextResponse.json({ results: await searchProducts(q) });
  } catch (error) {
    console.error("[search]", error instanceof Error ? error.message : error);
    return NextResponse.json({ results: [] }, { status: 503 });
  }
}
