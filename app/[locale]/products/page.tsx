import type { Metadata } from "next";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { brandConfig } from "@/config/brand";
import { prisma } from "@/lib/db";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string; merchant?: string; q?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: value } = await params;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  return {
    title: `${dict.pages.productsTitle} | ${brandConfig.currentBrand}`,
    description: dict.pages.productsSubtitle
  };
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale: value } = await params;
  const query = searchParams ? await searchParams : {};
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const selectedCategory = query.category ?? "";
  const selectedMerchant = query.merchant ?? "";
  const keyword = query.q ?? "";

  const products = await prisma.product.findMany({
    where: {
      status: "active",
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(selectedMerchant ? { merchantId: selectedMerchant } : {}),
      ...(keyword
        ? {
            OR: [
              { sku: { contains: keyword } },
              { nameCN: { contains: keyword } },
              { nameEN: { contains: keyword } },
              { category: { contains: keyword } },
              { material: { contains: keyword } }
            ]
          }
        : {})
    },
    include: { merchant: true, images: { orderBy: { sort: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 120
  });
  const categories = await prisma.product.findMany({
    where: { status: "active" },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" }
  });
  const merchants = await prisma.merchant.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });

  return (
    <main className="container-page py-16">
      <p className="font-black uppercase text-[#b91c1c]">{dict.nav.findProducts}</p>
      <h1 className="mt-3 text-5xl font-black tracking-normal">{dict.pages.productsTitle}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f6864]">{dict.pages.productsSubtitle}</p>

      <form className="mt-8 grid gap-3 rounded-[18px] border border-[#e6e1d8] bg-white p-3 soft-shadow lg:grid-cols-[1fr_220px_220px_140px]">
        <input name="q" defaultValue={keyword} className="min-h-13 rounded-md border border-[#dde4e0] px-4 outline-none focus:border-[#013f29]" placeholder="Search SKU, Christmas Ball, LED Lights..." />
        <select name="category" defaultValue={selectedCategory} className="min-h-13 rounded-md border border-[#dde4e0] px-3 font-bold outline-none focus:border-[#013f29]">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.category} value={item.category}>{item.category}</option>
          ))}
        </select>
        <select name="merchant" defaultValue={selectedMerchant} className="min-h-13 rounded-md border border-[#dde4e0] px-3 font-bold outline-none focus:border-[#013f29]">
          <option value="">All merchants</option>
          {merchants.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <button className="rounded-md bg-[#013f29] px-5 font-black text-white" type="submit">Search</button>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={localePath(locale, "/products")} className={`rounded-full px-4 py-2 text-sm font-black ${selectedCategory ? "bg-white text-[#39413e]" : "bg-[#013f29] text-white"}`}>
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item.category}
            href={localePath(locale, `/products?category=${encodeURIComponent(item.category)}`)}
            className={`rounded-full px-4 py-2 text-sm font-black ${selectedCategory === item.category ? "bg-[#013f29] text-white" : "bg-white text-[#39413e]"}`}
          >
            {item.category}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-[22px] border border-[#e6e1d8] bg-white soft-shadow">
            <Link href={localePath(locale, `/products/${product.id}`)}>
              <SafeImage className="h-60 w-full object-cover" src={product.images[0]?.imageUrl ?? product.merchant.coverImage} alt={locale === "zh" ? product.nameCN : product.nameEN} />
            </Link>
            <div className="p-6">
              <Link href={localePath(locale, `/products/${product.id}`)}>
                <h2 className="text-2xl font-black">{locale === "zh" ? product.nameCN : product.nameEN}</h2>
              </Link>
              <p className="mt-2 text-sm font-bold text-[#5f6864]">{locale === "zh" ? product.nameEN : product.nameCN}</p>
              <div className="mt-5 grid gap-3 text-sm">
                <Line label="SKU" value={product.sku} />
                <Line label="Category" value={product.category} />
                <Line label={dict.ai.moq} value={product.moq} />
                <Line label={dict.ai.price} value={`${product.currency} ${product.price}`} />
                <Line label="Supplier" value={product.merchant.name} />
              </div>
              <Link
                href={localePath(locale, `/contact?product=${product.id}&merchant=${product.merchantId}`)}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#ef3340] px-4 font-black text-white"
              >
                Send Inquiry
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-start justify-between gap-4 rounded-md bg-[#f5f7f6] p-3">
      <small className="font-black uppercase text-[#7a8580]">{label}</small>
      <strong className="text-right text-[#101615]">{value}</strong>
    </span>
  );
}
