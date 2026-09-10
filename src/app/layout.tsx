import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.creos-labs.com"),
  title: "Creos Labs — A technology company",
  description:
    "Creos Labs is a technology company that designs, builds, and operates its own products, including Cardindex and Creos.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Creos Labs — A technology company",
    description:
      "Creos Labs is a technology company that designs, builds, and operates its own products, including Cardindex and Creos.",
    url: "/",
    siteName: "Creos Labs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creos Labs — A technology company",
    description:
      "Creos Labs is a technology company that designs, builds, and operates its own products, including Cardindex and Creos.",
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
