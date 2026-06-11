import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SafeImage } from "@/components/SafeImage";
import { brandConfig } from "@/config/brand";
import { rankProductsForAiMatch, type AIMatchInput } from "@/lib/ai-match";
import { prisma } from "@/lib/db";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ request?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: value } = await params;
  const locale = getLocaleFromParams(value);
  return {
    title: `AI Match | ${brandConfig.currentBrand}`,
    description: locale === "zh" ? "用本地规则从义乌产品库和商家库匹配采购需求。" : "Match buyer sourcing requests with Yiwu products and merchants."
  };
}

export default async function AIMatchPage({ params, searchParams }: PageProps) {
  const { locale: value } = await params;
  const query = searchParams ? await searchParams : {};
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const request = query.request ? await prisma.aIMatchRequest.findUnique({ where: { id: query.request } }) : null;
  const resultIds = parseResultIds(request?.resultProductIds ?? "");
  const resultProducts = resultIds.length
    ? await prisma.product.findMany({
        where: { id: { in: resultIds } },
        include: { merchant: true, images: { orderBy: { sort: "asc" } } }
      })
    : [];
  const orderedProducts = resultIds.map((id) => resultProducts.find((product) => product.id === id)).filter(Boolean) as typeof resultProducts;
  const categories = await prisma.product.findMany({
    distinct: ["category"],
    orderBy: { category: "asc" },
    select: { category: true },
    where: { status: "active" }
  });

  return (
    <main className="bg-[#f7f1e8] py-12">
      <section className="container-page">
        <p className="font-black uppercase text-[#b91c1c]">AI Match</p>
        <h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight tracking-normal md:text-6xl">
          {locale === "zh" ? "AI 匹配义乌圣诞用品采购需求" : "AI Match Christmas Sourcing Requests"}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5f6864]">
          {locale === "zh"
            ? "第一版使用本地规则：关键词、类目、MOQ、预算、认证商家和图片完整度综合排序。"
            : "Version one uses local rules: keyword, category, MOQ, budget, verified merchants and image completeness."}
        </p>

        <form action={runAiMatch} className="mt-8 rounded-[22px] border border-[#e6e1d8] bg-white p-6 soft-shadow">
          <input name="locale" type="hidden" value={locale} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Product Keyword" name="productKeyword" placeholder="Christmas Ball / LED Lights" defaultValue={request?.productKeyword} />
            <Field label="Quantity" name="quantity" placeholder="1000 pcs" defaultValue={request?.quantity} />
            <Field label="Country" name="country" placeholder="USA / Germany / UK" defaultValue={request?.country} />
            <Field label="Budget" name="budget" placeholder="USD 3000" defaultValue={request?.budget} />
            <label className="grid gap-2 text-sm font-black text-[#39413e]">
              Category
              <select name="category" defaultValue={request?.category ?? ""} className="min-h-12 rounded-md border border-[#dde4e0] px-4 outline-none focus:border-[#013f29]">
                <option value="">Any category</option>
                {categories.map((item) => (
                  <option key={item.category} value={item.category}>{item.category}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-black text-[#39413e]">
            Message
            <textarea name="message" defaultValue={request?.message ?? ""} className="min-h-32 rounded-md border border-[#dde4e0] px-4 py-3 outline-none focus:border-[#013f29]" placeholder="Tell us material, market, packaging, certificates, target delivery date..." />
          </label>
          <button className="mt-5 min-h-12 rounded-md bg-[#ef3340] px-6 font-black text-white" type="submit">
            Match Suppliers
          </button>
        </form>
      </section>

      <section className="container-page py-12">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="font-black uppercase text-[#b91c1c]">{request ? "Matched Results" : "Result Preview"}</p>
            <h2 className="mt-2 text-4xl font-black tracking-normal">
              {request ? `${orderedProducts.length} recommended products` : "Submit a request to see 20 recommendations"}
            </h2>
          </div>
          {request ? <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#0b8f5a]">Request ID: {request.id}</span> : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {orderedProducts.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-[18px] border border-[#e6e1d8] bg-white soft-shadow">
              <Link href={localePath(locale, `/products/${product.id}`)}>
                <SafeImage className="h-44 w-full object-cover" src={product.images[0]?.imageUrl ?? product.merchant.coverImage} alt={product.nameEN} />
              </Link>
              <div className="p-5">
                <Link href={localePath(locale, `/products/${product.id}`)}>
                  <h3 className="text-lg font-black">{product.nameEN}</h3>
                </Link>
                <p className="mt-1 text-sm font-bold text-[#5f6864]">{product.nameCN}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <Info label="MOQ" value={product.moq} />
                  <Info label={dict.ai.price} value={`${product.currency} ${product.price}`} />
                  <Info label="Merchant" value={product.merchant.name} />
                </div>
                <Link href={localePath(locale, `/contact?product=${product.id}&merchant=${product.merchantId}`)} className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-[#013f29] px-4 text-sm font-black text-white">
                  Contact Supplier
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

async function runAiMatch(formData: FormData) {
  "use server";
  const locale = value(formData, "locale") === "en" ? "en" : "zh";
  const input: AIMatchInput = {
    productKeyword: value(formData, "productKeyword"),
    quantity: value(formData, "quantity"),
    country: value(formData, "country"),
    budget: value(formData, "budget"),
    category: value(formData, "category"),
    message: value(formData, "message")
  };
  const products = await prisma.product.findMany({
    where: { status: "active" },
    include: { merchant: true, images: { orderBy: { sort: "asc" } } },
    take: 500
  });
  const results = rankProductsForAiMatch(products, input);
  const request = await prisma.aIMatchRequest.create({
    data: {
      ...input,
      resultProductIds: JSON.stringify(results.map((item) => item.product.id))
    }
  });
  revalidatePath(localePath(locale, "/dashboard/admin"));
  redirect(localePath(locale, `/ai-match?request=${request.id}`));
}

function parseResultIds(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

function Field({ defaultValue = "", label, name, placeholder }: { defaultValue?: string; label: string; name: string; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#39413e]">
      {label}
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} className="min-h-12 rounded-md border border-[#dde4e0] px-4 outline-none focus:border-[#013f29]" />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-start justify-between gap-3 rounded-md bg-[#f5f7f6] p-3">
      <small className="font-black uppercase text-[#7a8580]">{label}</small>
      <strong className="text-right text-[#101615]">{value}</strong>
    </span>
  );
}
