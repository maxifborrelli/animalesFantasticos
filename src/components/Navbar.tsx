"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlus, House, LogOut, PawPrint } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Inicio",
    icon: House,
  },
  {
    href: "/nuevoReporte",
    label: "Nuevo reporte",
    icon: CirclePlus,
  },
  {
    href: "/login",
    label: "Logout",
    icon: LogOut,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden w-full border-b border-border bg-white shadow-sm md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
              <PawPrint className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Animales Fantasticos
              </p>
              <p className="text-xs text-muted-foreground">
                Mascotas perdidas y encontradas
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 px-2 py-2 safe-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="h-20 md:hidden" />
    </>
  );
}
