import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInquiryForm } from "@/components/ProductInquiryForm";
import { SafeImage } from "@/components/SafeImage";
import { brandConfig } from "@/config/brand";
import { prisma } from "@/lib/db";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: value, slug } = await params;
  const locale = getLocaleFromParams(value);
  const product = await getProduct(slug);
  if (!product) return {};
  const titleName = locale === "zh" ? product.nameCN : product.nameEN;
  return {
    title: `${titleName} | ${product.sku} | ${brandConfig.currentBrand}`,
    description: `${product.nameEN} from ${product.merchant.name}. MOQ ${product.moq}, price ${product.currency} ${product.price}, lead time ${product.leadTime}.`
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale: value, slug } = await params;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const product = await getProduct(slug);
  if (!product) notFound();

  const images = product.images.map((image) => image.imageUrl);
  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      status: "active",
      OR: [{ category: product.category }, { merchantId: product.merchantId }]
    },
    include: { merchant: true, images: { orderBy: { sort: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 8
  });
  const displayName = locale === "zh" ? product.nameCN : product.nameEN;
  const secondaryName = locale === "zh" ? product.nameEN : product.nameCN;
  const inquiryText = `Hello, I am interested in ${product.nameEN} (${product.sku}). Please send price, MOQ, lead time, packaging and certificates.`;
  const whatsappHref = `https://wa.me/${phoneForWhatsApp(product.merchant.phone)}?text=${encodeURIComponent(inquiryText)}`;
  const emailHref = `mailto:${product.merchant.email}?subject=${encodeURIComponent(`Inquiry for ${product.sku}`)}&body=${encodeURIComponent(inquiryText)}`;

  return (
    <main className="pb-20">
      <section className="bg-[#f7f1e8] py-12 md:py-16">
        <div className="container-page">
          <Link href={localePath(locale, "/products")} className="text-sm font-black uppercase text-[#b91c1c]">
            Back to Products
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <ProductGallery images={images} title={displayName} />

            <div className="rounded-[26px] border border-[#e6e1d8] bg-white p-6 soft-shadow md:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eefaf5] px-3 py-1 text-xs font-black text-[#0b8f5a]">{product.category}</span>
                <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-black text-[#b45309]">{product.status}</span>
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-normal text-[#101615] md:text-5xl">{displayName}</h1>
              <p className="mt-3 text-lg font-bold text-[#5f6864]">{secondaryName}</p>
              <p className="mt-4 text-[#5f6864]">{locale === "zh" ? product.descriptionCN : product.descriptionEN}</p>

              <div className="mt-8 grid gap-3">
                <SpecLine label="SKU" value={product.sku} />
                <SpecLine label="Category" value={product.category} />
                <SpecLine label={dict.ai.price} value={`${product.currency} ${product.price}`} strong />
                <SpecLine label={dict.ai.moq} value={product.moq} />
                <SpecLine label="Material" value={product.material} />
                <SpecLine label="Size" value={product.size} />
                <SpecLine label="Color" value={product.color} />
                <SpecLine label="Package" value={product.packageInfo} />
                <SpecLine label="Lead Time" value={product.leadTime} />
                <SpecLine label="Supplier" value={product.merchant.name} />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Link href={localePath(locale, `/contact?product=${product.id}&merchant=${product.merchantId}`)} className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ef3340] px-5 font-black text-white">
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
          defaultMessage={`Hello, I am interested in ${product.nameEN} (${product.sku}). Please send price, MOQ, lead time, packaging and certificates.`}
          merchantId={product.merchantId}
          productId={product.id}
        />
      </section>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[22px] border border-[#e6e1d8] bg-white p-6 soft-shadow">
          <p className="font-black uppercase text-[#b91c1c]">Supplier</p>
          <h2 className="mt-3 text-3xl font-black">{product.merchant.name}</h2>
          <p className="mt-3 leading-7 text-[#5f6864]">{product.merchant.market} / {product.merchant.district} / {product.merchant.booth}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SmallMetric label="Contact" value={product.merchant.contact} />
            <SmallMetric label="Phone" value={product.merchant.phone} />
            <SmallMetric label="Email" value={product.merchant.email} />
          </div>
        </div>
        <Link href={localePath(locale, `/products?merchant=${product.merchantId}`)} className="rounded-[22px] bg-[#013f29] p-6 text-white soft-shadow">
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
              <Link href={localePath(locale, `/products/${item.id}`)}>
                <ProductThumb src={item.images[0]?.imageUrl ?? item.merchant.coverImage} alt={item.nameEN} />
              </Link>
              <div className="p-5">
                <Link href={localePath(locale, `/products/${item.id}`)}>
                  <h3 className="text-lg font-black">{locale === "zh" ? item.nameCN : item.nameEN}</h3>
                </Link>
                <div className="mt-4 grid gap-2 text-sm">
                  <SpecLine label="MOQ" value={item.moq} compact />
                  <SpecLine label="Price" value={`${item.currency} ${item.price}`} compact />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: {
      OR: [{ id: slug }, { sku: slug }]
    },
    include: {
      merchant: true,
      images: { orderBy: { sort: "asc" } }
    }
  });
}

function phoneForWhatsApp(phone: string) {
  return phone.replace(/\D/g, "");
}

function ProductThumb({ alt, src }: { alt: string; src: string }) {
  return <SafeImage className="h-44 w-full object-cover" src={src || "/images/yiwu-christmas-store.jpeg"} alt={alt} />;
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
