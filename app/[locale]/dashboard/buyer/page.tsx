import { getLocaleFromParams } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = { params: Promise<{ locale: string }> };

export default async function BuyerDashboardPage({ params }: PageProps) {
  const { locale: value } = await params;
  const dict = getDictionary(getLocaleFromParams(value));
  return <DashboardPlaceholder title={dict.dashboard.buyer} text={dict.dashboard.reserved} />;
}

function DashboardPlaceholder({ title, text }: { title: string; text: string }) {
  return <main className="container-page py-20"><h1 className="text-5xl font-black">{title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#5f6864]">{text}</p></main>;
}
