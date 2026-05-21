"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMapHome = pathname === "/";

  if (isMapHome) {
    return <main className="h-dvh w-full overflow-hidden">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
    </>
  );
}
