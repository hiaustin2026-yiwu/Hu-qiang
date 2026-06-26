import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInquiryForm } from "@/components/ProductInquiryForm";
import { SafeImage } from "@/components/SafeImage";
import { brandConfig } from "@/config/brand";
import { categories, products, suppliers } from "@/data";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";
import type { Product } from "@/types/models";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: value, slug } = await params;
  const locale = getLocaleFromParams(value);
  const product = getProduct(slug);
  if (!product) return {};
  const supplier = getSupplier(product.supplierId);
  const titleName = locale === "zh" ? product.nameZh : product.nameEn;
  return {
    title: `${titleName} | ${product.sku} | ${brandConfig.currentBrand}`,
    description: `${product.nameEn} from ${supplier?.businessName ?? "Yiwu Christmas supplier"}. MOQ ${product.moq}, price ${product.priceRange}, lead time ${product.leadTime}.`
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale: value, slug } = await params;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const product = getProduct(slug);
  if (!product) notFound();

  const supplier = getSupplier(product.supplierId);
  const category = getCategory(product.categoryId);
  const relatedProducts = products
    .filter((item) => item.id !== product.id && (item.categoryId === product.categoryId || item.supplierId === product.supplierId))
    .slice(0, 8);
  const displayName = locale === "zh" ? product.nameZh : product.nameEn;
  const secondaryName = locale === "zh" ? product.nameEn : product.nameZh;
  const inquiryText = `Hello, I am interested in ${product.nameEn} (${product.sku}). Please send price, MOQ, lead time, packaging and certificates.`;
  const whatsappHref = `https://wa.me/${phoneForWhatsApp(supplier?.whatsapp ?? supplier?.phone ?? "")}?text=${encodeURIComponent(inquiryText)}`;
  const emailHref = `mailto:${supplier?.email ?? "sales@yiwuchristmas.ai"}?subject=${encodeURIComponent(`Inquiry for ${product.sku}`)}&body=${encodeURIComponent(inquiryText)}`;

  return (
    <main className="pb-20">
      <section className="bg-[#f7f1e8] py-12 md:py-16">
        <div className="container-page">
          <Link href={localePath(locale, "/products")} className="text-sm font-black uppercase text-[#b91c1c]">
            Back to Products
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <ProductGallery images={product.images} title={displayName} position={product.imagePosition} />

            <div className="rounded-[26px] border border-[#e6e1d8] bg-white p-6 soft-shadow md:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eefaf5] px-3 py-1 text-xs font-black text-[#0b8f5a]">{category ? (locale === "zh" ? category.nameZh : category.nameEn) : product.categoryId}</span>
                <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-black text-[#b45309]">Verified Supplier</span>
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-normal text-[#101615] md:text-5xl">{displayName}</h1>
              <p className="mt-3 text-lg font-bold text-[#5f6864]">{secondaryName}</p>
              <p className="mt-4 text-[#5f6864]">{locale === "zh" ? product.descriptionZh : product.descriptionEn}</p>

              <div className="mt-8 grid gap-3">
                <SpecLine label="SKU" value={product.sku} />
                <SpecLine label="Category" value={category ? (locale === "zh" ? category.nameZh : category.nameEn) : product.categoryId} />
                <SpecLine label={dict.ai.price} value={product.priceRange} strong />
                <SpecLine label={dict.ai.moq} value={product.moq} />
                <SpecLine label="Material" value={product.material} />
                <SpecLine label="Size" value={product.size} />
                <SpecLine label="Color" value={product.color} />
                <SpecLine label="Package" value={product.packageInfo} />
                <SpecLine label="Lead Time" value={product.leadTime} />
                <SpecLine label="Supplier" value={supplier?.businessName ?? "Verified Yiwu Supplier"} />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Link href={localePath(locale, `/contact?product=${product.id}&merchant=${product.supplierId}`)} className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ef3340] px-5 font-black text-white">
                  Send Inquiry
                </Link>
                <a className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#0b8f5a] px-5 font-black text-white" href={whatsappHref}>
                  WhatsApp
                </a>
                <a className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#013f29]/20 bg-white px-5 font-black text-[#013f29]" href={emailHref}>
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <ProductInquiryForm
          defaultMessage={`Hello, I am interested in ${product.nameEn} (${product.sku}). Please send price, MOQ, lead time, packaging and certificates.`}
          merchantId={product.supplierId}
          productId={product.id}
        />
      </section>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[22px] border border-[#e6e1d8] bg-white p-6 soft-shadow">
          <p className="font-black uppercase text-[#b91c1c]">Supplier</p>
          <h2 className="mt-3 text-3xl font-black">{supplier?.businessName ?? "Verified Yiwu Supplier"}</h2>
          <p className="mt-3 leading-7 text-[#5f6864]">{supplier?.marketAddress ?? supplier?.addressEn}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SmallMetric label="Contact" value={supplier?.contactName ?? "Sales Manager"} />
            <SmallMetric label="Phone" value={supplier?.phone ?? "+86"} />
            <SmallMetric label="Email" value={supplier?.email ?? "sales@yiwuchristmas.ai"} />
          </div>
        </div>
        <Link href={localePath(locale, `/products?merchant=${product.supplierId}`)} className="rounded-[22px] bg-[#013f29] p-6 text-white soft-shadow">
          <span className="text-xs font-black uppercase text-[#ffd166]">More From Supplier</span>
          <strong className="mt-3 block text-2xl">View all products</strong>
          <span className="mt-4 inline-flex min-h-11 items-center rounded-md bg-[#ef3340] px-5 font-black">Open Catalog</span>
        </Link>
      </section>

      <section className="container-page py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-black uppercase text-[#b91c1c]">Related Products</p>
            <h2 className="mt-2 text-4xl font-black tracking-normal">Related Products</h2>
          </div>
          <Link href={localePath(locale, "/products")} className="font-black text-[#0b8f5a]">
            View all products
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[18px] border border-[#e6e1d8] bg-white soft-shadow">
              <Link href={localePath(locale, `/products/${item.slug}`)}>
                <ProductThumb src={item.images[0]} alt={item.nameEn} />
              </Link>
              <div className="p-5">
                <Link href={localePath(locale, `/products/${item.slug}`)}>
                  <h3 className="text-lg font-black">{locale === "zh" ? item.nameZh : item.nameEn}</h3>
                </Link>
                <div className="mt-4 grid gap-2 text-sm">
                  <SpecLine label="MOQ" value={item.moq} compact />
                  <SpecLine label="Price" value={item.priceRange} compact />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function getProduct(slug: string): Product | undefined {
  return products.find((product) => [product.id, product.sku, product.slug].includes(slug));
}

function getCategory(categoryId: string) {
  return categories.find((item) => item.id === categoryId);
}

function getSupplier(supplierId: string) {
  return suppliers.find((item) => item.id === supplierId);
}

function phoneForWhatsApp(phone: string) {
  return phone.replace(/\D/g, "");
}

function ProductThumb({ alt, src }: { alt: string; src: string }) {
  return <SafeImage className="h-44 w-full bg-white object-cover" src={src || "/images/yiwu-christmas-store.jpeg"} alt={alt} />;
}

function SpecLine({ label, value, strong = false, compact = false }: { label: string; value: string; strong?: boolean; compact?: boolean }) {
  return (
    <span className={`flex items-start justify-between gap-4 ${compact ? "rounded-md bg-[#f5f7f6] p-2" : "rounded-[14px] bg-[#f5f7f6] p-4"}`}>
      <small className="font-black uppercase text-[#7a8580]">{label}</small>
      <strong className={`text-right ${strong ? "text-xl text-[#b91c1c]" : "text-[#101615]"}`}>{value}</strong>
    </span>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-[#f5f7f6] p-4">
      <span className="text-xs font-black uppercase text-[#758078]">{label}</span>
      <strong className="mt-2 block break-words">{value}</strong>
    </div>
  );
}
