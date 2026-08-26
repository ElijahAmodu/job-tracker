import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Application Assistant",
  description:
    "Tailor your resume and cover letter per job, without automating submission.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b px-6 py-3 flex gap-5 text-sm">
          <Link href="/applications" className="font-medium">
            Applications
          </Link>
          <Link href="/experience">Experience</Link>
          <Link href="/profile">Profile</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
