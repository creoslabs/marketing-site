import { NextResponse } from "next/server";
import { getVerifiedUser } from "@/lib/supabase/data";
import { buildReportData, type PdfReportData } from "@/lib/signal/report-data";
import { renderReportHtml } from "@/lib/signal/report-html";
import { LIGHT_THEME, DARK_THEME } from "@/lib/signal/report-theme";
import { htmlToPdf } from "@/lib/signal/report-pdf-render";

// Headless Chromium launch + page render can run past Vercel's default 10s.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const data = body?.data as PdfReportData | undefined;
  const theme = body?.theme === "dark" ? "dark" : "light";
  const filename = typeof body?.filename === "string" ? body.filename : "signal-report.pdf";

  if (!data?.asset || !Array.isArray(data.criteria)) {
    return NextResponse.json({ error: "Missing report data." }, { status: 400 });
  }

  try {
    const reportData = buildReportData(data);
    const html = renderReportHtml(reportData, theme === "dark" ? DARK_THEME : LIGHT_THEME);
    const pdf = await htmlToPdf(html);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not generate the PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
