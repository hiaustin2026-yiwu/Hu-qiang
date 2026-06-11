import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YiwuChristmas.ai | AI Christmas Products Sourcing Platform",
  description: "Find verified Yiwu Christmas suppliers with AI-powered sourcing."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
