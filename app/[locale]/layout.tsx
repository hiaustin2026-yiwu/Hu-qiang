import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { isLocale, locales, type Locale } from "@/config/i18n";
import { getDictionary } from "@/messages";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale = value as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <Header locale={locale} dict={dict} />
      {children}
      <Footer locale={locale} dict={dict} />
    </>
  );
}
