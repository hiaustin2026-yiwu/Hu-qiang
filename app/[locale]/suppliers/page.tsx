import type { Metadata } from "next";
import Link from "next/link";
import { brandConfig } from "@/config/brand";
import { categories, products, suppliers } from "@/data";
import { firstImage, productDisplayName, productPriceRange, supplierDisplayName } from "@/lib/format";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: value } = await params;
  const dict = getDictionary(getLocaleFromParams(value));
  return { title: `${dict.pages.suppliersTitle} | ${brandConfig.currentBrand}`, description: dict.pages.suppliersSubtitle };
}

export default async function SuppliersPage({ params }: PageProps) {
  const { locale: value } = await params;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);

  return (
    <main>
      <section className="relative overflow-hidden bg-[#0d241c] text-white">
        <div className="absolute inset-0 bg-[url('/images/yiwu-christmas-store.jpeg')] bg-cover bg-center opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071611] via-[#071611]/80 to-[#071611]/20" />
        <div className="container-page relative grid min-h-[420px] items-center gap-10 py-16 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="font-black uppercase text-[#ffd166]">{dict.nav.suppliers}</p>
            <h1 className="mt-3 text-5xl font-black leading-tight tracking-normal md:text-6xl">{dict.pages.suppliersTitle}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">{dict.pages.suppliersSubtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={localePath(locale, "/ai-sourcing")} className="inline-flex min-h-12 items-center rounded-md bg-[#ef3340] px-5 font-black text-white">
                {dict.nav.aiSourcing}
              </Link>
              <Link href={localePath(locale, "/contact")} className="inline-flex min-h-12 items-center rounded-md border border-white/35 px-5 font-black text-white">
                {dict.nav.contact}
              </Link>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/20 bg-white/12 p-5 backdrop-blur-xl">
            <h2 className="text-2xl font-black">{dict.ai.upload}</h2>
            <label className="mt-4 grid min-h-44 cursor-pointer place-items-center rounded-[18px] border border-dashed border-white/45 bg-white/10 text-center">
              <span>
                <strong className="block">{dict.home.imageSearch}</strong>
                <small className="mt-2 block text-white/70">{dict.ai.uploadHint}</small>
              </span>
              <input className="sr-only" type="file" accept="image/*" />
            </label>
            <Link href={localePath(locale, "/ai-sourcing")} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-white font-black text-[#013f29]">
              {dict.ai.start}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-black uppercase text-[#b91c1c]">{dict.common.verifiedSupplier} / {dict.common.goldSupplier}</p>
            <h2 className="mt-2 text-4xl font-black tracking-normal">{dict.home.suppliersTitle}</h2>
          </div>
          <p className="max-w-xl text-[#5f6864]">{dict.pages.suppliersSubtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <article key={supplier.id} className="rounded-[22px] border border-[#e6e1d8] bg-white p-6 soft-shadow">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 shrink-0 rounded-full bg-cover bg-center ring-4 ring-[#eefaf5]" style={{ backgroundImage: `url(${firstImage([supplier.coverImage, ...supplier.storeImages])})` }} />
                  <div className="min-w-0">
                    <span className="rounded-full bg-[#eefaf5] px-3 py-1 text-xs font-black text-[#0b8f5a]">{supplier.verified ? dict.common.verifiedSupplier : dict.common.goldSupplier}</span>
                    <h3 className="mt-3 text-2xl font-black">{supplierDisplayName(supplier, locale)}</h3>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                  <SupplierLine label="Company" value={supplierDisplayName(supplier, locale)} />
                  <SupplierLine label="Rating" value={`${supplier.rating.toFixed(1)} ★ (${supplier.reviewCount})`} />
                  <SupplierLine label="Booth" value={`${supplier.marketDistrict} ${supplier.floor ?? ""} #${supplier.boothNumber}`} />
                  <SupplierLine label="Categories" value={categoryNames(supplier.mainCategories, locale)} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <a className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0b8f5a] px-4 text-sm font-black text-white" href={`https://wa.me/${supplier.whatsapp}`}>
                    WhatsApp
                  </a>
                  <a className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-black text-[#013f29] ring-1 ring-[#d7e4df]" href={`mailto:${supplier.email}`}>
                    Email
                  </a>
                  <Link className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-md bg-[#ef3340] px-4 text-sm font-black text-white" href={localePath(locale, `/suppliers/${supplier.slug}`)}>
                    Visit / Contact Supplier
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f7f1e8] py-14">
        <div className="container-page">
          <div className="mb-8">
            <p className="font-black uppercase text-[#b91c1c]">SKU</p>
            <h2 className="mt-2 text-4xl font-black tracking-normal">{dict.pages.productsTitle}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.slug} className="overflow-hidden rounded-[22px] border border-[#e6e1d8] bg-white soft-shadow">
                <Link href={localePath(locale, `/products/${product.slug}`)}>
                  <div className="h-52 bg-cover bg-center" style={{ backgroundImage: `url(${firstImage(product.images)})`, backgroundPosition: product.imagePosition }} />
                </Link>
                <div className="p-6">
                  <Link href={localePath(locale, `/products/${product.slug}`)}>
                    <h3 className="text-xl font-black">{productDisplayName(product, locale)}</h3>
                  </Link>
                  <div className="mt-4 grid gap-3 text-sm">
                    <Metric label={dict.ai.moq} value={product.moq} />
                    <Metric label={dict.ai.price} value={productPriceRange(product)} />
                    <Metric label="Supplier" value={supplierName(product.supplierId, locale)} />
                  </div>
                  <Link href={localePath(locale, "/contact")} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#ef3340] px-4 font-black text-white">
                    Send Inquiry
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function SupplierLine({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-start justify-between gap-4 rounded-md bg-[#f5f7f6] p-3">
      <small className="font-black uppercase text-[#7a8580]">{label}</small>
      <strong className="text-right text-[#101615]">{value}</strong>
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-start justify-between gap-4 rounded-md bg-[#f5f7f6] p-3">
      <small className="font-black uppercase text-[#7a8580]">{label}</small>
      <strong className="text-right text-[#101615]">{value}</strong>
    </span>
  );
}

function supplierName(supplierId: string, locale: "en" | "zh") {
  const supplier = suppliers.find((item) => item.id === supplierId);
  if (!supplier) return supplierId;
  return supplierDisplayName(supplier, locale);
}

function categoryNames(ids: string[], locale: "en" | "zh") {
  return ids
    .map((id) => categories.find((category) => category.id === id))
    .filter((category) => Boolean(category))
    .map((category) => (locale === "zh" ? category!.nameZh : category!.nameEn))
    .join(", ");
}
