import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ContactButtons } from "@/components/ContactButtons";
import { prisma } from "@/lib/db";
import { isValidEmail, sendInquiryNotification, type InquiryEmailPayload } from "@/lib/inquiry-email";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ product?: string; merchant?: string; sent?: string }>;
};

export default async function ContactPage({ params, searchParams }: PageProps) {
  const { locale: value } = await params;
  const query = searchParams ? await searchParams : {};
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const [product, merchant] = await Promise.all([
    query.product ? prisma.product.findUnique({ where: { id: query.product }, include: { merchant: true } }) : null,
    query.merchant ? prisma.merchant.findUnique({ where: { id: query.merchant } }) : null
  ]);
  const targetMerchant = merchant ?? product?.merchant ?? null;

  return (
    <main className="bg-[#f7f1e8] py-16">
      <section className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="font-black uppercase text-[#b91c1c]">{dict.nav.contact}</p>
          <h1 className="mt-3 text-5xl font-black leading-tight tracking-normal md:text-6xl">{dict.pages.contactTitle}</h1>
          <p className="mt-6 text-lg leading-8 text-[#4d5752]">{dict.pages.contactSubtitle}</p>
          {query.sent ? <p className="mt-6 rounded-md bg-[#eefaf5] px-4 py-3 font-black text-[#0b8f5a]">Thank you. Our sourcing assistant will contact you soon.</p> : null}
          {product || targetMerchant ? (
            <div className="mt-6 rounded-[18px] bg-white p-5 soft-shadow">
              <p className="text-xs font-black uppercase text-[#b91c1c]">Inquiry Target</p>
              {product ? <h2 className="mt-2 text-2xl font-black">{locale === "zh" ? product.nameCN : product.nameEN}</h2> : null}
              {targetMerchant ? <p className="mt-2 font-bold text-[#5f6864]">{targetMerchant.name}</p> : null}
            </div>
          ) : null}
          <div className="mt-8"><ContactButtons dict={dict} /></div>
        </div>
        <form action={saveInquiry} className="rounded-[24px] bg-white p-7 soft-shadow">
          <input name="locale" type="hidden" value={locale} />
          <input name="productId" type="hidden" value={product?.id ?? ""} />
          <input name="merchantId" type="hidden" value={targetMerchant?.id ?? ""} />
          <Input label="Name" name="buyerName" />
          <Input label="Email" name="buyerEmail" type="email" required />
          <Input label="WhatsApp" name="buyerWhatsapp" />
          <Input label="Country" name="country" />
          <Input label="Quantity" name="quantity" />
          <Input label="Budget" name="budget" />
          <label className="grid gap-2 text-sm font-bold">
            Inquiry Details
            <textarea
              name="message"
              defaultValue={product ? `Hello, I am interested in ${product.nameEN} (${product.sku}). Please send price, MOQ, lead time, packaging and certificates.` : ""}
              className="min-h-40 rounded-md border border-[#d8dedb] p-4 outline-none focus:border-[#013f29]"
            />
          </label>
          <button type="submit" className="mt-6 min-h-12 rounded-md bg-[#ef3340] px-6 font-black text-white">{dict.common.contactSupplier}</button>
        </form>
      </section>
    </main>
  );
}

async function saveInquiry(formData: FormData) {
  "use server";
  const locale = field(formData, "locale") === "en" ? "en" : "zh";
  const data: InquiryEmailPayload = {
    productId: field(formData, "productId"),
    merchantId: field(formData, "merchantId"),
    buyerName: field(formData, "buyerName") || "Buyer",
    buyerEmail: field(formData, "buyerEmail"),
    buyerWhatsapp: field(formData, "buyerWhatsapp"),
    country: field(formData, "country"),
    quantity: field(formData, "quantity"),
    budget: field(formData, "budget"),
    message: field(formData, "message") || "Please send quotation."
  };

  if (!isValidEmail(data.buyerEmail)) {
    throw new Error("A valid email address is required.");
  }

  await sendInquiryNotification(data);

  try {
    await prisma.inquiry.create({
      data: {
        productId: data.productId || null,
        merchantId: data.merchantId || null,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerWhatsapp: data.buyerWhatsapp,
        country: data.country,
        quantity: data.quantity,
        budget: data.budget,
        message: data.message,
        status: "new"
      }
    });
    revalidatePath(localePath(locale, "/dashboard/admin"));
    revalidatePath(localePath(locale, "/dashboard/admin/inquiries"));
  } catch {
    // The notification email is retained even when the production database is unavailable.
  }
  redirect(`${localePath(locale, "/contact")}?sent=1`);
}

function Input({ label, name, required = false, type = "text" }: { label: string; name: string; required?: boolean; type?: string }) {
  return (
    <label className="mb-5 grid gap-2 text-sm font-bold">
      {label}
      <input name={name} type={type} required={required} className="min-h-12 rounded-md border border-[#d8dedb] px-4 outline-none focus:border-[#013f29]" />
    </label>
  );
}

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
