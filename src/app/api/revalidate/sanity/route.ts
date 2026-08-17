import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
export async function POST(request: Request) {
  if (!env.SANITY_REVALIDATION_SECRET || request.headers.get("authorization") !== `Bearer ${env.SANITY_REVALIDATION_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  revalidateTag("sanity", { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true });
}
