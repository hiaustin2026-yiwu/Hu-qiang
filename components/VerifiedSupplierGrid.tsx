import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/config/i18n";
import type { Supplier } from "@/types/models";

type VerifiedSupplierGridProps = {
  locale: Locale;
  suppliers: Supplier[];
  limit?: number;
};

export function VerifiedSupplierGrid({ locale, suppliers, limit }: VerifiedSupplierGridProps) {
  const items = typeof limit === "number" ? suppliers.slice(0, limit) : suppliers;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((supplier) => (
        <article key={supplier.id} className="group overflow-hidden rounded-lg border border-[#dfe5e2] bg-white shadow-[0_12px_32px_rgba(16,22,21,0.09)]">
          <Link href={localePath(locale, `/suppliers/${supplier.slug}`)} className="block overflow-hidden bg-[#eef1ef]">
            <SafeImage
              src={supplier.storefrontImage}
              alt={`${supplier.businessName} storefront`}
              className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </Link>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-black leading-7 text-[#101615]">{supplier.businessName}</h3>
              {supplier.verified ? (
                <span className="shrink-0 rounded-full bg-[#e9f8f1] px-3 py-1 text-xs font-black text-[#08784c]">Verified</span>
              ) : null}
            </div>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#4f5b56]">{supplier.category}</p>
            <p className="mt-3 border-t border-[#edf1ef] pt-3 text-sm font-bold text-[#66716c]">{supplier.marketAddress}</p>
            <Link
              href={localePath(locale, `/suppliers/${supplier.slug}`)}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#013f29] px-4 text-sm font-black text-white transition hover:bg-[#02583a]"
            >
              View Store
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
