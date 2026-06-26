import type { Metadata } from "next";
import Link from "next/link";
import { AISourcingFlow } from "@/components/AISourcingFlow";
import { ContactButtons } from "@/components/ContactButtons";
import { SafeImage } from "@/components/SafeImage";
import { VerifiedSupplierGrid } from "@/components/VerifiedSupplierGrid";
import { categories, products as mockProducts, suppliers as mockSuppliers } from "@/data";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: value } = await params;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  return {
    title: `YiwuChristmas.ai | AI Christmas Products Sourcing Platform`,
    description: dict.home.subtitle,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        zh: "/zh"
      }
    }
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale: value } = await params;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const featuredProducts = [...mockProducts.filter((product) => product.featured), ...mockProducts].slice(0, 6);
  const featuredCategories = categories.slice(0, 8);
  const featuredMerchants = mockSuppliers.slice(0, 5);

  return (
    <main>
      <section className="relative overflow-hidden bg-[#f7f1e8]">
        <div className="absolute inset-0 bg-[url('/images/yiwu-christmas-store.jpeg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbfaf7] via-[#fbfaf7]/92 to-[#fbfaf7]/20" />
        <div className="container-page relative grid min-h-[760px] items-center gap-12 py-16 lg:grid-cols-[1fr_430px]">
          <div>
            <p className="mb-4 font-black uppercase text-[#b91c1c]">{dict.home.eyebrow}</p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-normal text-[#101615] md:text-7xl">{dict.home.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#39413e]">{dict.home.subtitle}</p>

            <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[dict.home.statShops, dict.home.statProducts, dict.home.statCountries, dict.home.statSupport].map((item) => (
                <div key={item} className="rounded-[18px] border border-white/75 bg-white/82 p-4 font-black text-[#12342a] soft-shadow backdrop-blur">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[26px] border border-white/80 bg-white/92 p-3 soft-shadow backdrop-blur">
              <div className="grid gap-3 md:grid-cols-[1fr_150px]">
                <input className="min-h-16 rounded-[18px] border border-[#dde4e0] px-5 text-lg outline-none focus:border-[#013f29]" placeholder={dict.home.searchPlaceholder} />
                <Link href={localePath(locale, "/products")} className="inline-flex min-h-16 items-center justify-center rounded-[18px] bg-[#ef3340] px-6 font-black text-white">
                  {dict.home.findNow}
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  [dict.home.hotTree, "christmas-trees"],
                  [dict.home.hotBall, "christmas-ornaments"],
                  [dict.home.hotLights, "christmas-lights"],
                  [dict.home.hotRibbon, "christmas-decorations"],
                  [dict.home.hotGiftBox, "christmas-gifts"],
                  [dict.home.hotWreath, "garlands-wreaths"],
                  [dict.home.hotGarland, "garlands-wreaths"],
                  [dict.home.hotStocking, "christmas-stockings"],
                  [dict.home.hotSanta, "christmas-decorations"],
                  [dict.home.hotPartyDecoration, "party-supplies"]
                ].map(([label, category], index) => (
                  <Link
                    key={`${category}-${index}`}
                    href={localePath(locale, `/products?category=${category}`)}
                    className="rounded-full bg-[#fff5f5] px-4 py-2 text-sm font-black text-[#b91c1c] transition hover:bg-[#fee2e2]"
                  >
                    🔥{label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-5 rounded-[22px] border border-white/75 bg-white/82 p-4 soft-shadow backdrop-blur">
              <strong className="text-sm uppercase text-[#5f6864]">{dict.home.districtTitle}</strong>
              <div className="mt-3 flex flex-wrap gap-3">
                {[
                  [dict.home.district1, "district1"],
                  [dict.home.district2, "district2"],
                  [dict.home.district3, "district3"],
                  [dict.home.district4, "district4"],
                  [dict.home.district5, "district5"]
                ].map(([label, district]) => (
                  <Link
                    key={district}
                    href={localePath(locale, `/suppliers?district=${district}`)}
                    className="rounded-full bg-[#eefaf5] px-4 py-2 text-sm font-black text-[#0b8f5a] transition hover:bg-[#d9f7ea]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <ContactButtons dict={dict} />
            </div>
          </div>
          <aside className="rounded-[28px] border border-white/70 bg-white p-6 soft-shadow">
            <h2 className="text-3xl font-black">{dict.home.assistantTitle}</h2>
            <div className="mt-6 grid gap-4">
              {[
                [dict.home.assistantProduct, locale === "zh" ? "LED 圣诞鹿灯" : "LED Christmas Deer"],
                [dict.home.assistantQuantity, "500 pcs"],
                [dict.home.assistantCountry, locale === "zh" ? "美国 / 德国 / 英国" : "USA / Germany / UK"],
                [dict.home.assistantBudget, "$2,000 - $5,000"]
              ].map(([label, placeholder]) => (
                <label key={label} className="grid gap-2 text-sm font-black text-[#39413e]">
                  {label}:
                  <input className="min-h-12 rounded-[14px] border border-[#dde4e0] px-4 font-medium outline-none focus:border-[#013f29]" placeholder={placeholder} />
                </label>
              ))}
            </div>
            <Link href={localePath(locale, "/ai-sourcing")} className="mt-6 inline-flex min-h-13 w-full items-center justify-center rounded-[16px] bg-[#013f29] px-5 font-black text-white transition hover:bg-[#02583a]">
              {dict.home.assistantMatch}
            </Link>
          </aside>
        </div>
      </section>

      <AISourcingFlow locale={locale} dict={dict} />

      <section id="verified-suppliers" className="bg-[#f5f7f6] py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-black uppercase text-[#08784c]">Verified in Yiwu</p>
              <h2 className="mt-2 text-4xl font-black tracking-normal text-[#101615] md:text-5xl">Verified Yiwu Christmas Suppliers</h2>
            </div>
            <p className="max-w-xl text-[#5f6864]">Real storefronts from Yiwu Christmas product market</p>
          </div>
          <VerifiedSupplierGrid locale={locale} suppliers={mockSuppliers} limit={6} />
          <div className="mt-8 text-center">
            <Link href={localePath(locale, "/suppliers")} className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#013f29] px-6 font-black text-[#013f29]">
              View All Verified Suppliers
            </Link>
          </div>
        </div>
      </section>

      <section id="categories" className="container-page py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-black uppercase text-[#b91c1c]">{dict.nav.findProducts}</p>
            <h2 className="mt-2 text-4xl font-black tracking-normal md:text-5xl">{dict.home.categoriesTitle}</h2>
          </div>
          <p className="max-w-xl text-[#5f6864]">{dict.home.featureSubtitle}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {featuredCategories.map((category) => (
            <Link key={category.id} href={localePath(locale, `/products?category=${encodeURIComponent(category.slug)}`)} className="group overflow-hidden rounded-[18px] border border-[#e6e1d8] bg-white soft-shadow">
              <SafeImage className="h-44 w-full object-cover transition duration-300 group-hover:scale-105" src={category.image} alt={locale === "zh" ? category.nameZh : category.nameEn} />
              <div className="p-5">
                <h3 className="text-xl font-black">{locale === "zh" ? category.nameZh : category.nameEn}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5f6864]">
                  {locale === "zh" ? category.descriptionZh : category.descriptionEn}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-black uppercase text-[#b91c1c]">SKU</p>
            <h2 className="mt-2 text-4xl font-black tracking-normal md:text-5xl">{dict.pages.productsTitle}</h2>
          </div>
          <Link href={localePath(locale, "/products")} className="font-black text-[#0b8f5a]">
            View all products
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-[18px] border border-[#e6e1d8] bg-white soft-shadow">
              <Link href={localePath(locale, `/products/${product.slug}`)}>
                <SafeImage className="h-48 w-full bg-white object-cover" src={product.images[0]} alt={locale === "zh" ? product.nameZh : product.nameEn} />
              </Link>
              <div className="p-5">
                <Link href={localePath(locale, `/products/${product.slug}`)}>
                  <h3 className="text-xl font-black">{locale === "zh" ? product.nameZh : product.nameEn}</h3>
                </Link>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <span className="rounded-md bg-[#f5f7f6] p-3">
                    <small className="block font-black uppercase text-[#7a8580]">{dict.ai.moq}</small>
                    <strong>{product.moq}</strong>
                  </span>
                  <span className="rounded-md bg-[#f5f7f6] p-3">
                    <small className="block font-black uppercase text-[#7a8580]">{dict.ai.price}</small>
                    <strong>{product.priceRange}</strong>
                  </span>
                </div>
                <Link href={localePath(locale, `/contact?product=${product.id}&merchant=${product.supplierId}`)} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#ef3340] px-4 font-black text-white">
                  Send Inquiry
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="trends" className="bg-[#013f29] py-20 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-black uppercase text-[#ffd166]">{dict.nav.trends}</p>
            <h2 className="mt-2 text-4xl font-black tracking-normal md:text-5xl">{dict.home.suppliersTitle}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featuredMerchants.map((merchant) => (
              <Link key={merchant.id} href={localePath(locale, `/suppliers/${merchant.slug}`)} className="rounded-[18px] bg-white p-5 text-[#101615]">
                <span className="text-xs font-black uppercase text-[#b91c1c]">{merchant.verified ? dict.common.verifiedSupplier : dict.common.goldSupplier}</span>
                <h3 className="mt-3 text-lg font-black">{merchant.businessName}</h3>
                <p className="mt-2 text-sm text-[#5f6864]">{merchant.marketAddress}</p>
                <p className="mt-3 text-sm font-black">China</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="map-guide" className="container-page py-20">
        <div className="rounded-[28px] border border-[#e6e1d8] bg-white p-8 soft-shadow">
          <p className="font-black uppercase text-[#b91c1c]">{dict.nav.map}</p>
          <h2 className="mt-2 text-4xl font-black tracking-normal">{dict.pages.aboutTitle}</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f6864]">{dict.pages.aboutSubtitle}</p>
        </div>
      </section>
    </main>
  );
}
