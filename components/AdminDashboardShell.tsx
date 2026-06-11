import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/lib/i18n";
import type { Dictionary } from "@/messages";

export type AdminSection =
  | "dashboard"
  | "merchants"
  | "products"
  | "import-csv"
  | "collection-kit"
  | "media"
  | "ai-match"
  | "inquiries"
  | "messages"
  | "orders"
  | "settings";

type AdminDashboardShellProps = {
  active: AdminSection;
  children: ReactNode;
  dict: Dictionary;
  locale: Locale;
};

export const adminSections: AdminSection[] = [
  "dashboard",
  "merchants",
  "products",
  "import-csv",
  "collection-kit",
  "media",
  "ai-match",
  "inquiries",
  "messages",
  "orders",
  "settings"
];

const adminSectionPath: Record<AdminSection, string> = {
  dashboard: "/dashboard/admin",
  merchants: "/dashboard/admin/merchants",
  products: "/dashboard/admin/products",
  "import-csv": "/dashboard/admin/import-csv",
  "collection-kit": "/dashboard/admin/collection-kit",
  media: "/dashboard/admin/media",
  "ai-match": "/dashboard/admin/ai-match",
  inquiries: "/dashboard/admin/inquiries",
  messages: "/dashboard/admin/messages",
  orders: "/dashboard/admin/orders",
  settings: "/dashboard/admin/settings"
};

const sectionInitials: Record<AdminSection, string> = {
  dashboard: "DB",
  merchants: "ME",
  products: "PR",
  "import-csv": "IM",
  "collection-kit": "CK",
  media: "MD",
  "ai-match": "AI",
  inquiries: "IQ",
  messages: "MS",
  orders: "OR",
  settings: "ST"
};

export function AdminDashboardShell({ active, children, dict, locale }: AdminDashboardShellProps) {
  return (
    <main className="bg-[#f5f7f6]">
      <div className="container-page grid min-w-0 min-h-[calc(100vh-80px)] gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-w-0 self-start rounded-[18px] border border-[#dde4e0] bg-white p-4 soft-shadow lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
          <div className="border-b border-[#eef2f0] px-2 pb-4">
            <p className="text-xs font-black uppercase text-[#b91c1c]">YiwuChristmas.ai</p>
            <h1 className="mt-2 text-2xl font-black text-[#101615]">{dict.dashboard.admin}</h1>
            <p className="mt-2 text-sm leading-6 text-[#5f6864]">{dict.dashboard.adminSubtitle}</p>
          </div>

          <nav className="mt-4 grid gap-1">
            {adminSections.map((section) => {
              const isActive = section === active;
              return (
                <Link
                  key={section}
                  href={localePath(locale, adminSectionPath[section])}
                  className={`flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-black transition ${
                    isActive ? "bg-[#013f29] text-white" : "text-[#39413e] hover:bg-[#eefaf5] hover:text-[#013f29]"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-md text-[11px] font-black ${
                      isActive ? "bg-white/18 text-white" : "bg-[#f5f7f6] text-[#0b8f5a]"
                    }`}
                  >
                    {sectionInitials[section]}
                  </span>
                  <span>{dict.dashboard.menu[section]}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase text-[#b91c1c]">{dict.dashboard.workspace}</p>
              <h2 className="mt-1 text-3xl font-black tracking-normal text-[#101615]">{dict.dashboard.menu[active]}</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-black text-[#5f6864]">
              <span className="rounded-full bg-[#eefaf5] px-3 py-2 text-[#0b8f5a]">{dict.dashboard.databaseReady}</span>
              <span className="rounded-full bg-[#fff5f5] px-3 py-2 text-[#b91c1c]">{dict.dashboard.aiReady}</span>
            </div>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
