import Link from "next/link";
import { brandConfig } from "@/config/brand";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/messages";
import { localePath } from "@/lib/i18n";

type FooterProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Footer({ locale, dict }: FooterProps) {
  return (
    <footer className="bg-[#0f1714] py-12 text-white">
      <div className="container-page grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <strong className="text-2xl font-black">{brandConfig.currentBrand}</strong>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70">{dict.home.featureSubtitle}</p>
          <p className="mt-4 text-xs text-white/45">
            {brandConfig.domains.primary} · {brandConfig.domains.ai} · {brandConfig.domains.china} · {brandConfig.domains.app}
          </p>
        </div>
        <div>
          <h3 className="font-black">{dict.nav.findProducts}</h3>
          <div className="mt-4 grid gap-2 text-sm text-white/70">
            <Link href={localePath(locale, "/products")}>{dict.nav.findProducts}</Link>
            <Link href={localePath(locale, "/suppliers")}>{dict.nav.suppliers}</Link>
            <Link href={localePath(locale, "/about")}>{dict.nav.about}</Link>
          </div>
        </div>
        <div>
          <h3 className="font-black">{dict.nav.contact}</h3>
          <div className="mt-4 grid gap-2 text-sm text-white/70">
            <a href={`mailto:${brandConfig.contact.email}`}>{brandConfig.contact.email}</a>
            <a href={`https://wa.me/${brandConfig.contact.whatsapp}`}>{dict.common.whatsapp}: +{brandConfig.contact.whatsapp}</a>
            <Link href={localePath(locale, "/dashboard/supplier")}>{dict.dashboard.supplier}</Link>
            <Link href={localePath(locale, "/dashboard/admin")}>{dict.dashboard.admin}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
