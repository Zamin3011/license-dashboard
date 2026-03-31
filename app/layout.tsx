"use client";

import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-[#0f172a] text-white">

          {/* SIDEBAR */}
          <div className="w-64 bg-[#020617] p-5 flex flex-col gap-4">

            <h1 className="text-xl font-bold mb-6">⚡ Zamin SaaS</h1>

            <NavItem href="/dashboard" label="Dashboard" />
            <NavItem href="/licenses" label="Licenses" />
            <NavItem href="/devices" label="Devices" />
            <NavItem href="/distributors" label="Distributors" />

          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 p-6">
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}

import { usePathname } from "next/navigation";

function NavItem({ href, label }: any) {
  const path = usePathname();
  const active = path === href;

  return (
    <Link href={href}>
      <div className={`p-3 rounded-lg cursor-pointer ${
        active ? "bg-[#1e293b]" : "hover:bg-[#1e293b]"
      }`}>
        {label}
      </div>
    </Link>
  );
}
