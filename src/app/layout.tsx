import type { Metadata } from "next";
import "./globals.css";

const TITLE = "Creos Labs — Marketing technology, built by marketers";
const DESCRIPTION =
  "Creos Labs is building Content Lab, a competitor and creator content intelligence tool for marketers — coming soon. Join the waitlist to get early access.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.creos-labs.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Creos Labs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
