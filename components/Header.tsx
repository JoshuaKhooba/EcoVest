"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import GlobalSearch from "@/components/GlobalSearch";

interface HeaderProps {
  authed?: boolean;
}

const NAV_LINKS = [
  { href: "/account", label: "Account" },
  { href: "/browse", label: "Browse" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
];

// Informational/marketing pages — only shown to signed-out visitors, since
// once a user is authed the navbar is reserved for the core app tabs above.
const PUBLIC_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export default function Header({ authed = false }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = authed ? NAV_LINKS : PUBLIC_LINKS;

  // Close the mobile menu automatically on navigation, and whenever the
  // viewport is resized past the `lg` breakpoint (where the inline nav takes
  // over) so it can't be left open-but-hidden behind the desktop layout.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleResize() {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-navy-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
        <Link
          href={authed ? "/account" : "/"}
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
        >
          <Image
            src="/EcoVestIcon.png"
            alt="GROW icon"
            width={36}
            height={36}
            priority
            className="h-8 w-8 shrink-0 rounded-lg object-cover sm:h-9 sm:w-9"
          />
          <div className="min-w-0">
            <div className="truncate text-base font-semibold leading-tight sm:text-lg">
              EcoVest
            </div>
            <div className="hidden text-xs leading-tight text-slate-300 sm:block">
              Portfolio Greenifier
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {authed && <GlobalSearch />}
          <span className="badge hidden bg-slate-800 text-slate-200 xl:inline-flex">
            Simulated portfolio — not real money
          </span>

          {/* Desktop-only auth controls — mirrored inside the mobile menu below */}
          <div className="hidden items-center gap-3 lg:flex">
            {authed ? (
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-glow-slate active:translate-y-0"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-200 transition hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-forest-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-forest-400 hover:shadow-glow-green active:translate-y-0"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — only below lg, where the inline nav is hidden */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/10 lg:hidden"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile / tablet dropdown menu — mirrors the desktop nav + auth controls */}
      {menuOpen && (
        <div className="animate-fade-in-up border-t border-white/10 bg-navy-950 px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-white text-navy-900"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
            {authed ? (
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-600 px-4 py-2.5 text-center text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-600 px-4 py-2.5 text-center text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-forest-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-forest-400"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
