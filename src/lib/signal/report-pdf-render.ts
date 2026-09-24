// The Node port of signal-report-template/render_report.py's html_to_pdf().
// @sparticuz/chromium's bundled binary only runs on Amazon Linux (Lambda's
// runtime, which Vercel functions use) — on a local dev machine we fall back
// to a real installed Chrome, since the Lambda binary won't execute there.
const LOCAL_CHROME_PATHS: Record<string, string> = {
  darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  linux: "/usr/bin/google-chrome",
  win32: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
};

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export async function htmlToPdf(html: string): Promise<Buffer> {
  const puppeteer = await import("puppeteer-core");

  const launchOptions = isServerless
    ? await (async () => {
        const { default: chromium } = await import("@sparticuz/chromium");
        return {
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        };
      })()
    : {
        executablePath: LOCAL_CHROME_PATHS[process.platform],
        headless: true,
      };

  if (!isServerless && !launchOptions.executablePath) {
    throw new Error(
      `No local Chrome found for platform "${process.platform}" — PDF export needs a real Chrome install in dev (production uses @sparticuz/chromium instead).`
    );
  }

  const browser = await puppeteer.launch(launchOptions);
  try {
    const page = await browser.newPage();
    // The template is self-contained (inline SVGs, system font stack, no
    // external images or fonts) — "load" is enough, no network to idle on.
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      width: "816px",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
