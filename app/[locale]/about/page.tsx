import { ContactButtons } from "@/components/ContactButtons";
import { ProductImage } from "@/components/ProductImage";
import { getLocaleFromParams } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: PageProps) {
  const { locale: value } = await params;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);

  return (
    <main className="container-page grid gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col justify-center">
        <p className="font-black uppercase text-[#b91c1c]">{dict.nav.about}</p>
        <h1 className="mt-3 text-5xl font-black leading-tight tracking-normal md:text-6xl">{dict.pages.aboutTitle}</h1>
        <p className="mt-6 text-lg leading-8 text-[#4d5752]">{dict.pages.aboutSubtitle}</p>
        <div className="mt-8"><ContactButtons dict={dict} /></div>
      </div>
      <ProductImage className="min-h-[520px] rounded-[28px] soft-shadow" position="50% 48%" />
    </main>
  );
}
