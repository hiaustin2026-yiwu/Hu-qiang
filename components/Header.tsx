import Link from "next/link";
import { brandConfig } from "@/config/brand";
import { localeLabels, locales, type Locale } from "@/config/i18n";
import type { Dictionary } from "@/messages";
import { localePath } from "@/lib/i18n";

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Header({ locale, dict }: HeaderProps) {
  const navItems = [
    { href: "/", label: dict.nav.home },
    { href: "/products", label: dict.nav.findProducts },
    { href: "/suppliers", label: dict.nav.suppliers },
    { href: "/ai-sourcing", label: dict.nav.aiSourcing },
    { href: "/ai-match", label: "AI Match" },
    { href: "/contact", label: dict.nav.contact }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#013f29]/95 text-white backdrop-blur-xl">
      <div className="container-page flex min-h-20 items-center justify-between gap-6">
        <Link href={localePath(locale)} className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-2xl">🎅</span>
          <span className="grid min-w-0">
            <strong className="truncate text-2xl font-black tracking-normal">
              Yiwu<span className="text-[#ef3340]">Christmas</span>.ai
            </strong>
            <small className="hidden text-xs font-semibold text-white/80 sm:block">{brandConfig.platformBrand} sourcing network</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold xl:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={localePath(locale, item.href)} className="whitespace-nowrap transition hover:text-[#ffd166]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1 md:flex">
            {locales.map((item) => (
              <Link
                key={item}
                href={localePath(item)}
                className={`rounded-full px-3 py-2 text-xs font-black ${item === locale ? "bg-white text-[#013f29]" : "text-white/80"}`}
              >
                {localeLabels[item]}
              </Link>
            ))}
          </div>
          <Link href={localePath(locale, "/dashboard/buyer")} className="hidden rounded-md border border-white/35 px-4 py-2 text-sm font-bold md:inline-flex">
            {dict.nav.login}
          </Link>
          <Link href={localePath(locale, "/contact")} className="rounded-md bg-[#ef3340] px-4 py-2 text-sm font-black">
            {dict.nav.signUp}
          </Link>
        </div>
      </div>
    </header>
  );
}
