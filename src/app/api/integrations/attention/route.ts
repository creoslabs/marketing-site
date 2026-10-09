import { NextResponse } from "next/server";
import { requireUser } from "@/lib/integrations/http";
import { countAttention } from "@/lib/integrations/store";

// Powers the dot on the account menu. Fetched by the header after the page
// has rendered, so it never sits on the critical path of a navigation.
export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: await countAttention(user.id) });
}
