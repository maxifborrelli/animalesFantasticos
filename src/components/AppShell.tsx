"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

type AppShellProps = {
  children: ReactNode;
};

const routesWithoutNavbar = new Set(["/login"]);

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const shouldShowNavbar = !routesWithoutNavbar.has(pathname);

  return (
    <>
      {shouldShowNavbar ? <Navbar /> : null}
      {children}
    </>
  );
}
