import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.creos-labs.com"),
  title: "Creos Labs — Custom marketing solutions",
  description:
    "Creos Labs designs and builds custom marketing technology for businesses, including Creos, our content lab, and Cardindex.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Creos Labs — Custom marketing solutions",
    description:
      "Creos Labs designs and builds custom marketing technology for businesses, including Creos, our content lab, and Cardindex.",
    url: "/",
    siteName: "Creos Labs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creos Labs — Custom marketing solutions",
    description:
      "Creos Labs designs and builds custom marketing technology for businesses, including Creos, our content lab, and Cardindex.",
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
