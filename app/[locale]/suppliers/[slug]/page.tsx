import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { SupplierGallery } from "@/components/SupplierGallery";
import { brandConfig } from "@/config/brand";
import { locales } from "@/config/i18n";
import { categories, products, suppliers } from "@/data";
import { firstImage, productDisplayName, productPriceRange, supplierAddress, supplierDescription, supplierDisplayName } from "@/lib/format";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) => suppliers.map((supplier) => ({ locale, slug: supplier.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: value, slug } = await params;
  const locale = getLocaleFromParams(value);
  const supplier = suppliers.find((item) => item.slug === slug);
  if (!supplier) return {};
  const categoriesText = categoryNames(supplier.mainCategories, "en");
  return {
    title: `${supplierDisplayName(supplier, locale)} | ${brandConfig.currentBrand}`,
    description: `Verified Yiwu Christmas supplier specializing in ${categoriesText || "Christmas decorations and ornaments"}.`,
    alternates: {
      canonical: `/${locale}/suppliers/${supplier.slug}`
    }
  };
}

export default async function SupplierDetailPage({ params }: PageProps) {
  const { locale: value, slug } = await params;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const supplier = suppliers.find((item) => item.slug === slug);
  if (!supplier) notFound();

  const supplierProducts = products.filter((product) => product.supplierId === supplier.id);
  const shownProducts = supplierProducts.length >= 8 ? supplierProducts.slice(0, 8) : supplierProducts;
  const relatedSuppliers = suppliers
    .filter((item) => item.id !== supplier.id)
    .filter((item) => item.mainCategories.some((categoryId) => supplier.mainCategories.includes(categoryId)))
    .concat(suppliers.filter((item) => item.id !== supplier.id))
    .filter((item, index, list) => list.findIndex((target) => target.id === item.id) === index)
    .slice(0, 3);

  return (
    <main className="pb-24">
      <section id="banner" className="bg-[#f5f7f6] py-10">
        <div className="container-page">
          <Link href={localePath(locale, "/suppliers")} className="text-sm font-black uppercase text-[#08784c]">
            ← {dict.nav.suppliers}
          </Link>
          <div className="mt-6 overflow-hidden rounded-lg border border-[#dfe5e2] bg-white shadow-[0_18px_48px_rgba(16,22,21,0.12)]">
            <SafeImage src={supplier.storefrontImage} alt={`${supplier.businessName} storefront`} className="aspect-video max-h-[660px] w-full object-cover" />
            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_360px]">
              <div>
                <div className="flex flex-wrap gap-2">
                  {supplier.verified ? <span className="rounded-full bg-[#e9f8f1] px-3 py-1 text-xs font-black uppercase text-[#08784c]">Verified Supplier</span> : null}
                  <span className="rounded-full bg-[#f1f3f2] px-3 py-1 text-xs font-black uppercase text-[#4f5b56]">{supplier.supplierType ?? dict.common.factory}</span>
                </div>
                <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal text-[#101615] md:text-5xl">{supplier.businessName}</h1>
                <p className="mt-2 text-lg font-bold text-[#5f6864]">{supplier.companyNameZh}</p>
                <p className="mt-6 max-w-3xl text-base leading-7 text-[#39413e]">{supplierDescription(supplier, locale)}</p>
                <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
                  <InfoLine label="Main Products" value={supplier.category} />
                  <InfoLine label="Contact" value={`${supplier.contactName ?? "Sourcing Desk"} · ${supplier.phone}`} />
                  <InfoLine label="Email" value={supplier.email} />
                  <InfoLine label="Address" value={supplierAddress(supplier, locale)} />
                </div>
              </div>
              <aside className="rounded-lg bg-[#0d241c] p-5 text-white">
                <h2 className="text-2xl font-black">{dict.common.contactSupplier}</h2>
                <p className="mt-3 text-sm leading-6 text-white/75">{supplier.marketAddress}</p>
                <div className="mt-6 grid gap-3">
                  <a className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#0b8f5a] px-5 font-black text-white" href={`https://wa.me/${supplier.whatsapp}`}>WhatsApp</a>
                  <a className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 font-black text-[#013f29]" href={`mailto:${supplier.email}`}>Email</a>
                  <Link className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ef3340] px-5 font-black text-white" href={localePath(locale, "/contact")}>
                    Send Inquiry
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <nav className="sticky top-[76px] z-30 border-b border-[#e6e1d8] bg-white/94 backdrop-blur">
        <div className="container-page flex gap-2 overflow-x-auto py-3">
          {[
            ["Banner", "#banner"],
            ["Company", "#company"],
            ["Video", "#video"],
            ["Gallery", "#gallery"],
            ["Map", "#map"],
            ["Products", "#products"],
            ["AI Score", "#ai-score"]
          ].map(([label, href]) => (
            <a key={href} href={href} className="shrink-0 rounded-full bg-[#f5f7f6] px-4 py-2 text-sm font-black text-[#39413e] transition hover:bg-[#eefaf5] hover:text-[#0b8f5a]">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section id="company" className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <SectionHeader title="Company Profile" eyebrow="B2B Supplier" />
          <div className="grid gap-5 md:grid-cols-2">
            <InfoCard label="English Introduction" value={supplier.descriptionEn} />
            <InfoCard label="中文介绍" value={supplier.descriptionZh} />
            <InfoCard label={dict.common.mainProducts} value={categoryNames(supplier.mainCategories, locale)} />
            <InfoCard label="Established" value={String(supplier.establishedYear ?? "Verified on request")} />
            <InfoCard label="Employees" value={supplier.employeeCount ?? "To be verified"} />
            <InfoCard label="Factory Type" value={supplier.supplierType ?? "Factory"} />
            <InfoCard label="Export Markets" value={(supplier.exportMarkets ?? []).join(", ")} />
          </div>
        </div>

        <aside id="map" className="grid gap-6">
          <SectionHeader title="Market Location" eyebrow="Yiwu Market" />
          <div className="rounded-[22px] border border-[#e6e1d8] bg-white p-6 soft-shadow">
            <InfoLine label="District" value={supplier.marketDistrict} />
            <InfoLine label="Floor" value={supplier.floor ?? "To be confirmed"} />
            <InfoLine label="Booth" value={supplier.boothNumber} />
            <div className="mt-5 grid min-h-44 place-items-center rounded-[18px] border border-dashed border-[#b6c5be] bg-[#eefaf5] text-center">
              <div>
                <strong className="block text-[#013f29]">Market Map</strong>
                <small className="mt-2 block text-[#5f6864]">Placeholder for Google Map / 3D market map</small>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section id="video" className="container-page py-8">
        <SectionHeader title="Supplier Video" eyebrow="Video" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative grid min-h-[360px] place-items-center overflow-hidden rounded-[24px] bg-[#0d241c] text-white soft-shadow">
            <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${firstImage([supplier.coverImage])})` }} />
            <div className="absolute inset-0 bg-gradient-to-br from-[#071611]/80 to-[#071611]/35" />
            <div className="relative text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white text-3xl font-black text-[#013f29]">▶</span>
              <strong className="mt-5 block text-3xl">Factory & Showroom Video</strong>
              <p className="mt-3 max-w-xl text-white/74">Placeholder for verified shop video, production line video, and buyer visit clips.</p>
            </div>
          </div>
          <div className="rounded-[22px] border border-[#e6e1d8] bg-white p-6 soft-shadow">
            <InfoLine label="Video" value="Reserved" />
            <InfoLine label="Factory" value={supplier.supplierType ?? "Factory"} />
            <InfoLine label="Verified" value={supplier.verified ? "Verified Supplier" : "Pending verification"} />
            <InfoLine label="AI Score" value={`${supplier.aiTrustScore ?? 88}/100`} />
          </div>
        </div>
      </section>

      <section id="gallery" className="container-page py-8">
        <SectionHeader title="Store & Factory Gallery" eyebrow="Verified Photos" />
        <div className="mt-6">
          <SupplierGallery supplier={supplier} />
        </div>
      </section>

      <section id="products" className="container-page py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader title="Main Products" eyebrow="Auto matched SKUs" />
          <Link href={localePath(locale, `/products`)} className="font-black text-[#0b8f5a]">
            View all products
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {shownProducts.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-[18px] border border-[#e6e1d8] bg-white soft-shadow">
              <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${firstImage(product.images)})`, backgroundPosition: product.imagePosition }} />
              <div className="p-5">
                <h3 className="text-lg font-black">{productDisplayName(product, locale)}</h3>
                <div className="mt-4 grid gap-2 text-sm">
                  <InfoLine label={dict.ai.moq} value={product.moq} compact />
                  <InfoLine label={dict.ai.price} value={productPriceRange(product)} compact />
                </div>
                <Link href={localePath(locale, `/products/${product.slug}`)} className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-[#013f29] px-4 text-sm font-black text-white">
                  View Product
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f7f1e8] py-14">
        <div className="container-page">
          <SectionHeader title="Company Capabilities" eyebrow="Sourcing Readiness" />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Capability icon="↗" label="Annual Export" value={supplier.annualExport ?? "To be verified"} />
            <Capability icon="⌂" label="Factory Area" value={supplier.factoryArea ?? "To be verified"} />
            <Capability icon="O" label="OEM" value={supplier.oem ? "Supported" : "On request"} />
            <Capability icon="D" label="ODM" value={supplier.odm ? "Supported" : "On request"} />
            <Capability icon="✓" label="Certificates" value={(supplier.certificates ?? []).join(", ")} />
            <Capability icon="⏱" label="Lead Time" value={supplier.averageLeadTime ?? supplierProducts[0]?.leadTime ?? "To be quoted"} />
            <Capability icon="#" label="MOQ" value={supplier.averageMoq ?? supplierProducts[0]?.moq ?? "To be quoted"} />
            <Capability icon="$" label="Payment Terms" value={(supplier.paymentTerms ?? []).join(", ")} />
          </div>
        </div>
      </section>

      <section id="ai-score" className="container-page grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeader title="AI Recommendation" eyebrow={`AI Score ${supplier.aiTrustScore ?? 88}/100`} />
          <p className="mt-4 text-[#5f6864]">Mock AI tags reserved for future supplier ranking, buyer matching, and RFQ scoring.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(supplier.aiRecommendations ?? ["Best for Wholesale", "High Rating", "Fast Delivery", "Verified Supplier"]).map((item) => (
            <div key={item} className="rounded-[18px] border border-[#e6e1d8] bg-white p-5 soft-shadow">
              <span className="text-sm font-black uppercase text-[#b91c1c]">AI</span>
              <strong className="mt-2 block text-xl">{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHeader title="Related Suppliers" eyebrow="Supplier Discovery" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {relatedSuppliers.map((item) => (
            <Link key={item.id} href={localePath(locale, `/suppliers/${item.slug}`)} className="rounded-[20px] border border-[#e6e1d8] bg-white p-5 soft-shadow">
              <div className="h-36 rounded-[14px] bg-cover bg-center" style={{ backgroundImage: `url(${item.coverImage})` }} />
              <span className="mt-5 inline-flex rounded-full bg-[#eefaf5] px-3 py-1 text-xs font-black text-[#0b8f5a]">
                {item.verified ? dict.common.verifiedSupplier : dict.common.goldSupplier}
              </span>
              <h3 className="mt-3 text-xl font-black">{supplierDisplayName(item, locale)}</h3>
              <p className="mt-2 text-sm text-[#5f6864]">{categoryNames(item.mainCategories, locale)}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dfe8e3] bg-white/94 px-4 py-3 shadow-[0_-12px_30px_rgba(16,22,21,0.12)] backdrop-blur">
        <div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <strong className="truncate text-[#101615]">{supplierDisplayName(supplier, locale)}</strong>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <a className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0b8f5a] px-4 text-sm font-black text-white" href={`https://wa.me/${supplier.whatsapp}`}>
              WhatsApp
            </a>
            <a className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f5f7f6] px-4 text-sm font-black text-[#013f29]" href={`mailto:${supplier.email}`}>
              Email
            </a>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#ef3340] px-4 text-sm font-black text-white" href={localePath(locale, "/contact")}>
              Send Inquiry
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-black uppercase text-white ring-1 ring-white/25">{children}</span>;
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/20 bg-white/12 p-4 backdrop-blur">
      <span className="text-xs font-black uppercase text-[#ffd166]">{label}</span>
      <strong className="mt-2 block text-xl">{value}</strong>
    </div>
  );
}

function SectionHeader({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <div>
      <p className="font-black uppercase text-[#b91c1c]">{eyebrow}</p>
      <h2 className="mt-2 text-4xl font-black tracking-normal">{title}</h2>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#e6e1d8] bg-white p-6 soft-shadow">
      <span className="text-xs font-black uppercase text-[#758078]">{label}</span>
      <p className="mt-3 leading-7 text-[#39413e]">{value || "To be verified"}</p>
    </div>
  );
}

function InfoLine({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <span className={`flex items-start justify-between gap-4 ${compact ? "rounded-md bg-[#f5f7f6] p-2" : "border-b border-[#edf1ef] py-3"}`}>
      <small className="font-black uppercase text-[#7a8580]">{label}</small>
      <strong className="text-right text-[#101615]">{value}</strong>
    </span>
  );
}

function Capability({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#e6e1d8] bg-white p-5 soft-shadow">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#013f29] text-lg font-black text-white">{icon}</span>
      <span className="mt-4 block text-xs font-black uppercase text-[#758078]">{label}</span>
      <strong className="mt-2 block leading-6">{value || "To be verified"}</strong>
    </div>
  );
}

function categoryNames(ids: string[], locale: "en" | "zh") {
  return ids
    .map((id) => categories.find((category) => category.id === id))
    .filter((category) => Boolean(category))
    .map((category) => (locale === "zh" ? category!.nameZh : category!.nameEn))
    .join(", ");
}
