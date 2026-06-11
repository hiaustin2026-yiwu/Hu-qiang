import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ saved?: string }>;
};

export default async function SupplierDashboardPage({ params, searchParams }: PageProps) {
  const { locale: value } = await params;
  const query = searchParams ? await searchParams : {};
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);
  const merchants = await prisma.merchant.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <main className="bg-[#f5f7f6] py-10">
      <div className="container-page">
        <p className="font-black uppercase text-[#b91c1c]">Supplier Entry</p>
        <h1 className="mt-2 text-5xl font-black tracking-normal">{dict.dashboard.supplier}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f6864]">商家在这里录入资料和产品 SKU，保存后进入数据库，并自动出现在网站产品列表、AI采购搜索和客户询盘链路中。</p>
        {query.saved ? <p className="mt-5 rounded-md bg-[#eefaf5] px-4 py-3 font-black text-[#0b8f5a]">Saved to database. Website pages now read the latest data.</p> : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
          <section className="rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow">
            <h2 className="text-2xl font-black">1. Merchant Profile</h2>
            <form action={saveSupplierMerchant} className="mt-5 grid gap-3">
              <input name="locale" type="hidden" value={locale} />
              <Input label="Company" name="name" placeholder="Yiwu New Christmas Factory Co., Ltd." />
              <Input label="Market" name="market" placeholder="Yiwu International Trade Market" />
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="District" name="district" placeholder="District 1" />
                <Input label="Booth" name="booth" placeholder="Area A, 4F, 4023" />
              </div>
              <Input label="Contact" name="contact" placeholder="Ms. Wang" />
              <Input label="Phone" name="phone" placeholder="+86 138..." />
              <Input label="WeChat" name="wechat" placeholder="yiwu_supplier" />
              <Input label="Email" name="email" placeholder="sales@example.com" />
              <Input label="Cover Image" name="coverImage" placeholder="/uploads/store-800.webp" />
              <Textarea label="Description" name="description" placeholder="Factory supplier for Christmas ornaments and seasonal decorations." />
              <button className="min-h-12 rounded-md bg-[#013f29] px-5 font-black text-white" type="submit">Save Merchant</button>
            </form>
          </section>

          <section className="rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow">
            <h2 className="text-2xl font-black">2. Product SKU</h2>
            <form action={saveSupplierProduct} className="mt-5 grid gap-3">
              <input name="locale" type="hidden" value={locale} />
              <label className="grid gap-2 text-sm font-black text-[#39413e]">
                Merchant
                <select name="merchantId" className="min-h-11 rounded-md border border-[#dde4e0] px-3 outline-none focus:border-[#013f29]">
                  {merchants.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>{merchant.name}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                <Input label="SKU" name="sku" placeholder="YC-NEW-0001" />
                <Input label="Category" name="category" placeholder="Christmas Ball" />
                <Input label="MOQ" name="moq" placeholder="500 pcs" />
              </div>
              <Input label="English Name" name="nameEN" placeholder="Red Gold Shatterproof Christmas Ball" />
              <Input label="Chinese Name" name="nameCN" placeholder="红金防碎圣诞球" />
              <div className="grid gap-3 md:grid-cols-3">
                <Input label="Material" name="material" placeholder="Plastic" />
                <Input label="Size" name="size" placeholder="6 / 8 / 10 cm" />
                <Input label="Color" name="color" placeholder="Red, gold" />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Input label="Price" name="price" placeholder="0.28 - 1.20" />
                <Input label="Currency" name="currency" placeholder="USD" />
                <Input label="Lead Time" name="leadTime" placeholder="20-30 days" />
              </div>
              <Input label="Package" name="packageInfo" placeholder="OPP bag or color box" />
              <Textarea label="Images, one URL per line" name="images" placeholder="/uploads/product-800.webp&#10;/uploads/product-400.webp" />
              <Textarea label="English Description" name="descriptionEN" placeholder="Wholesale Christmas decoration from Yiwu Market." />
              <Textarea label="Chinese Description" name="descriptionCN" placeholder="义乌圣诞用品批发产品。" />
              <button className="min-h-12 rounded-md bg-[#ef3340] px-5 font-black text-white" type="submit">Save Product SKU</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

async function saveSupplierMerchant(formData: FormData) {
  "use server";
  const locale = safeLocale(formData);
  await prisma.merchant.create({
    data: {
      name: field(formData, "name") || "New Yiwu Christmas Supplier",
      market: field(formData, "market") || "Yiwu International Trade Market",
      district: field(formData, "district") || "District 1",
      booth: field(formData, "booth") || "Area A, 1F, 1001",
      contact: field(formData, "contact") || "Contact Person",
      phone: field(formData, "phone") || "+86",
      wechat: field(formData, "wechat"),
      email: field(formData, "email") || "sales@example.com",
      country: "China",
      description: field(formData, "description") || "Yiwu Christmas products supplier.",
      coverImage: field(formData, "coverImage") || "/images/yiwu-christmas-store.jpeg",
      verified: false
    }
  });
  revalidatePublic(locale);
  redirect(`${localePath(locale, "/dashboard/supplier")}?saved=merchant`);
}

async function saveSupplierProduct(formData: FormData) {
  "use server";
  const locale = safeLocale(formData);
  const sku = field(formData, "sku") || `YC-SUP-${Date.now()}`;
  const images = field(formData, "images")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  await prisma.product.create({
    data: {
      merchantId: field(formData, "merchantId"),
      sku,
      nameCN: field(formData, "nameCN") || field(formData, "nameEN") || "圣诞产品",
      nameEN: field(formData, "nameEN") || field(formData, "nameCN") || "Christmas Product",
      category: field(formData, "category") || "Christmas Decorations",
      material: field(formData, "material") || "Custom material",
      size: field(formData, "size") || "Custom size",
      color: field(formData, "color") || "Custom color",
      moq: field(formData, "moq") || "500 pcs",
      price: field(formData, "price") || "0.50 - 2.50",
      currency: field(formData, "currency") || "USD",
      packageInfo: field(formData, "packageInfo") || "OPP bag or color box",
      leadTime: field(formData, "leadTime") || "20-30 days",
      descriptionCN: field(formData, "descriptionCN") || "义乌圣诞用品批发产品。",
      descriptionEN: field(formData, "descriptionEN") || "Wholesale Christmas product from Yiwu Market.",
      status: "active",
      images: {
        create: (images.length > 0 ? images : [`/products/${sku}/1.jpg`, `/products/${sku}/2.jpg`, `/products/${sku}/3.jpg`]).map((imageUrl, index) => ({ imageUrl, sort: index + 1 }))
      }
    }
  });
  revalidatePublic(locale);
  redirect(`${localePath(locale, "/dashboard/supplier")}?saved=product`);
}

function Input({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#39413e]">
      {label}
      <input name={name} placeholder={placeholder} className="min-h-11 rounded-md border border-[#dde4e0] px-3 outline-none focus:border-[#013f29]" />
    </label>
  );
}

function Textarea({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#39413e]">
      {label}
      <textarea name={name} placeholder={placeholder} className="min-h-24 rounded-md border border-[#dde4e0] px-3 py-3 outline-none focus:border-[#013f29]" />
    </label>
  );
}

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeLocale(formData: FormData): "en" | "zh" {
  return field(formData, "locale") === "en" ? "en" : "zh";
}

function revalidatePublic(locale: "en" | "zh") {
  revalidatePath(localePath(locale));
  revalidatePath(localePath(locale, "/products"));
  revalidatePath(localePath(locale, "/ai-sourcing"));
  revalidatePath(localePath(locale, "/dashboard/supplier"));
}
