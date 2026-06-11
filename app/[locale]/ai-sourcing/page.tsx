import type { Metadata } from "next";
import Link from "next/link";
import { AISourcingFlow } from "@/components/AISourcingFlow";
import { SafeImage } from "@/components/SafeImage";
import { brandConfig } from "@/config/brand";
import { prisma } from "@/lib/db";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ q?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: value } = await params;
  const dict = getDictionary(getLocaleFromParams(value));
  return {
    title: `${dict.pages.aiSourcingTitle} | ${brandConfig.currentBrand}`,
    description: dict.pages.aiSourcingSubtitle
  };
}

export default async function AISourcingPage({ params, searchParams }: PageProps) {
  const { locale: value } = await params;
  const query = searchParams ? await searchParams : {};
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const keyword = query.q ?? "";
  const products = keyword
    ? await prisma.product.findMany({
        where: {
          status: "active",
          OR: [
            { sku: { contains: keyword } },
            { nameCN: { contains: keyword } },
            { nameEN: { contains: keyword } },
            { category: { contains: keyword } },
            { material: { contains: keyword } },
            { merchant: { name: { contains: keyword } } }
          ]
        },
        include: { merchant: true, images: { orderBy: { sort: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
        take: 20
      })
    : [];

  return (
    <main>
      <section className="bg-[#f7f1e8] py-16">
        <div className="container-page">
          <p className="font-black uppercase text-[#b91c1c]">{dict.nav.aiSourcing}</p>
          <h1 className="mt-3 text-5xl font-black tracking-normal md:text-6xl">{dict.pages.aiSourcingTitle}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5f6864]">{dict.pages.aiSourcingSubtitle}</p>
          <form className="mt-8 grid max-w-4xl gap-3 rounded-[20px] border border-white bg-white p-3 soft-shadow md:grid-cols-[1fr_150px]">
            <input name="q" defaultValue={keyword} className="min-h-14 rounded-md border border-[#dde4e0] px-4 outline-none focus:border-[#013f29]" placeholder="Christmas Ball, LED Lights, Gift Box..." />
            <button className="rounded-md bg-[#ef3340] px-5 font-black text-white" type="submit">AI Search</button>
          </form>
        </div>
      </section>

      {keyword ? (
        <section className="container-page py-12">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="font-black uppercase text-[#b91c1c]">Database Match</p>
              <h2 className="mt-2 text-4xl font-black tracking-normal">{products.length} matched products</h2>
            </div>
            <Link className="font-black text-[#0b8f5a]" href={localePath(locale, `/products?q=${encodeURIComponent(keyword)}`)}>Open product search</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-[18px] border border-[#e6e1d8] bg-white soft-shadow">
                <SafeImage className="h-44 w-full object-cover" src={product.images[0]?.imageUrl ?? product.merchant.coverImage} alt={product.nameEN} />
                <div className="p-5">
                  <h3 className="text-lg font-black">{locale === "zh" ? product.nameCN : product.nameEN}</h3>
                  <p className="mt-2 text-sm font-bold text-[#5f6864]">{product.sku} · {product.category}</p>
                  <p className="mt-2 text-sm font-bold text-[#39413e]">{product.merchant.name}</p>
                  <Link href={localePath(locale, `/contact?product=${product.id}&merchant=${product.merchantId}`)} className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-[#013f29] px-4 text-sm font-black text-white">
                    Send Inquiry
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <AISourcingFlow locale={locale} dict={dict} />
    </main>
  );
}
