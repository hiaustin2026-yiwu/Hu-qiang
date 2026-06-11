import Link from "next/link";
import { AdminDashboardShell } from "@/components/AdminDashboardShell";
import { prisma } from "@/lib/db";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ params }: PageProps) {
  const { locale: value } = await params;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [merchantCount, productCount, todayInquiryCount, pendingInquiryCount, todayAiMatchCount, recentAiMatches] = await Promise.all([
    prisma.merchant.count(),
    prisma.product.count(),
    prisma.inquiry.count({ where: { createdAt: { gte: today } } }),
    prisma.inquiry.count({ where: { status: "new" } }),
    prisma.aIMatchRequest.count({ where: { createdAt: { gte: today } } }),
    prisma.aIMatchRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
  ]);
  const popularKeywords = topValues(recentAiMatches.map((item) => item.productKeyword).filter(Boolean));
  const highDemandCategories = topValues(recentAiMatches.map((item) => item.category).filter(Boolean));

  const stats = [
    { label: dict.dashboard.menu.products, value: productCount },
    { label: dict.dashboard.menu.merchants, value: merchantCount },
    { label: "Today Inquiries", value: todayInquiryCount },
    { label: "Pending Inquiries", value: pendingInquiryCount },
    { label: "Today AI Match", value: todayAiMatchCount }
  ];

  return (
    <AdminDashboardShell active="dashboard" dict={dict} locale={locale}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => (
          <article key={item.label} className="rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow">
            <p className="text-sm font-black text-[#5f6864]">{item.label}</p>
            <strong className="mt-3 block text-4xl font-black text-[#101615]">{item.value}</strong>
          </article>
        ))}
      </div>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[18px] border border-[#dde4e0] bg-white p-6 soft-shadow">
          <p className="text-xs font-black uppercase text-[#b91c1c]">{dict.dashboard.nextAction}</p>
          <h3 className="mt-2 text-3xl font-black tracking-normal">{dict.dashboard.importTitle}</h3>
          <p className="mt-4 max-w-2xl leading-7 text-[#5f6864]">{dict.dashboard.importDescription}</p>
          <Link
            href={localePath(locale, "/dashboard/admin/import-csv")}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-[#ef3340] px-5 font-black text-white"
          >
            {dict.dashboard.menu["import-csv"]}
          </Link>
        </div>

        <div className="rounded-[18px] border border-[#dde4e0] bg-[#013f29] p-6 text-white soft-shadow">
          <p className="text-xs font-black uppercase text-[#ffd166]">{dict.dashboard.aiMatchTitle}</p>
          <h3 className="mt-2 text-3xl font-black tracking-normal">{dict.dashboard.aiMatchDescription}</h3>
          <Link
            href={localePath(locale, "/dashboard/admin/ai-match")}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 font-black text-[#013f29]"
          >
            {dict.dashboard.menu["ai-match"]}
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <TrendCard title="Popular Search Keywords" items={popularKeywords} />
        <TrendCard title="High Demand Categories" items={highDemandCategories} />
      </section>
    </AdminDashboardShell>
  );
}

function topValues(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({ count, label }));
}

function TrendCard({ items, title }: { items: Array<{ count: number; label: string }>; title: string }) {
  return (
    <div className="rounded-[18px] border border-[#dde4e0] bg-white p-6 soft-shadow">
      <p className="text-xs font-black uppercase text-[#b91c1c]">{title}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={item.label} className="rounded-full bg-[#eefaf5] px-3 py-2 text-sm font-black text-[#0b8f5a]">
              {item.label} · {item.count}
            </span>
          ))
        ) : (
          <span className="text-sm font-bold text-[#5f6864]">No AI Match data yet.</span>
        )}
      </div>
    </div>
  );
}
