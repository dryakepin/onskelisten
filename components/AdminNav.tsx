"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav({ suggestions }: { suggestions: number }) {
  const path = usePathname();
  const tabs: [string, string][] = [
    ["/admin", "Ønsker"],
    ["/admin/forslag", "Forslag"],
    ["/admin/modtaget", "Modtaget"],
    ["/admin/givere", "Familie"],
    ["/admin/mail", "Send mail"],
  ];
  return (
    <nav>
      {tabs.map(([href, label]) => (
        <Link key={href} href={href} className={path === href ? "on" : ""}>
          {label}
          {href === "/admin/forslag" && suggestions > 0 && <span className="count">{suggestions}</span>}
        </Link>
      ))}
    </nav>
  );
}
