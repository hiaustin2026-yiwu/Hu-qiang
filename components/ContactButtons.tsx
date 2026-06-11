import { brandConfig } from "@/config/brand";
import type { Dictionary } from "@/messages";

export function ContactButtons({ compact = false, dict }: { compact?: boolean; dict: Dictionary }) {
  return (
    <div className={`flex flex-wrap gap-3 ${compact ? "text-sm" : ""}`}>
      <a
        href={`https://wa.me/${brandConfig.contact.whatsapp}`}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0b8f5a] px-5 font-black text-white transition hover:bg-[#08744a]"
      >
        {dict.common.whatsapp}
      </a>
      <a
        href={`mailto:${brandConfig.contact.email}`}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#013f29]/20 bg-white px-5 font-black text-[#013f29] transition hover:border-[#013f29]"
      >
        {dict.common.email}
      </a>
    </div>
  );
}
