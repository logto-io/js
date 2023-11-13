import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hello Logto",
  description:
    "Example project for integrating Logto with Next.js Server Actions",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
