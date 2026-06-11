import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminDashboardShell, adminSections, type AdminSection } from "@/components/AdminDashboardShell";
import { ImageUploadManager } from "@/components/ImageUploadManager";
import { ProductImageUploadField } from "@/components/ProductImageUploadField";
import { ProductImportUploader } from "@/components/ProductImportUploader";
import { prisma } from "@/lib/db";
import { getLocaleFromParams, localePath } from "@/lib/i18n";
import { getDictionary } from "@/messages";

type PageProps = {
  params: Promise<{ locale: string; section: string }>;
  searchParams: Promise<{ category?: string; edit?: string; merchant?: string; product?: string; q?: string; status?: string }>;
};

type AdminMerchant = Prisma.MerchantGetPayload<Record<string, never>>;
type AdminProduct = Prisma.ProductGetPayload<{ include: { merchant: true; images: true } }>;
type AdminInquiry = Prisma.InquiryGetPayload<{ include: { product: true; merchant: true } }>;
type AdminCollectionTask = Prisma.CollectionTaskGetPayload<Record<string, never>>;

export function generateStaticParams() {
  return adminSections.filter((section) => section !== "dashboard").map((section) => ({ section }));
}

export default async function AdminSectionPage({ params, searchParams }: PageProps) {
  const { locale: value, section: sectionValue } = await params;
  const { category = "", edit, merchant = "", product = "", q = "", status = "" } = await searchParams;
  const locale = getLocaleFromParams(value);
  const dict = getDictionary(locale);

  if (!isAdminSection(sectionValue) || sectionValue === "dashboard") {
    notFound();
  }

  const merchantWhere = q
    ? {
        OR: [
          { name: { contains: q } },
          { market: { contains: q } },
          { district: { contains: q } },
          { booth: { contains: q } },
          { contact: { contains: q } },
          { email: { contains: q } }
        ]
      }
    : undefined;

  const productWhere: Prisma.ProductWhereInput = {
    ...(merchant ? { merchantId: merchant } : {}),
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { sku: { contains: q } },
            { nameCN: { contains: q } },
            { nameEN: { contains: q } },
            { category: { contains: q } },
            { material: { contains: q } }
          ]
        }
      : {})
  };

  const collectionWhere: Prisma.CollectionTaskWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { merchantName: { contains: q } },
            { marketLocation: { contains: q } },
            { boothNumber: { contains: q } },
            { contactName: { contains: q } },
            { phone: { contains: q } },
            { wechat: { contains: q } },
            { notes: { contains: q } }
          ]
        }
      : {})
  };

  const [merchants, products, productCategories, inquiries, collectionTasks, editingMerchant, editingProduct, editingCollectionTask] = await Promise.all([
    prisma.merchant.findMany({ where: merchantWhere, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.product.findMany({
      where: Object.keys(productWhere).length > 0 ? productWhere : undefined,
      include: { merchant: true, images: { orderBy: { sort: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.product.findMany({
      distinct: ["category"],
      orderBy: { category: "asc" },
      select: { category: true },
      where: { status: "active" }
    }),
    prisma.inquiry.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(merchant ? { merchantId: merchant } : {}),
        ...(product ? { productId: product } : {}),
        ...(q
          ? {
              OR: [
                { buyerName: { contains: q } },
                { buyerEmail: { contains: q } },
                { buyerWhatsapp: { contains: q } },
                { country: { contains: q } },
                { message: { contains: q } },
                { product: { nameEN: { contains: q } } },
                { merchant: { name: { contains: q } } }
              ]
            }
          : {})
      },
      include: { product: true, merchant: true },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.collectionTask.findMany({
      where: Object.keys(collectionWhere).length > 0 ? collectionWhere : undefined,
      orderBy: { createdAt: "desc" },
      take: 80
    }),
    sectionValue === "merchants" && edit ? prisma.merchant.findUnique({ where: { id: edit } }) : null,
    sectionValue === "products" && edit
      ? prisma.product.findUnique({ where: { id: edit }, include: { merchant: true, images: { orderBy: { sort: "asc" } } } })
      : null,
    sectionValue === "collection-kit" && edit ? prisma.collectionTask.findUnique({ where: { id: edit } }) : null
  ]);

  return (
    <AdminDashboardShell active={sectionValue} dict={dict} locale={locale}>
      {sectionValue === "import-csv" ? (
        <ImportCsvPanel dict={dict} />
      ) : sectionValue === "media" ? (
        <ImageUploadManager />
      ) : sectionValue === "merchants" ? (
        <MerchantsCrudPanel dict={dict} locale={locale} merchants={merchants} editingMerchant={editingMerchant} query={q} />
      ) : sectionValue === "products" ? (
        <ProductsCrudPanel
          category={category}
          categories={productCategories.map((item) => item.category)}
          dict={dict}
          editingProduct={editingProduct}
          locale={locale}
          merchant={merchant}
          merchants={merchants}
          products={products}
          query={q}
        />
      ) : sectionValue === "inquiries" || sectionValue === "messages" ? (
        <InquiriesPanel inquiries={inquiries} locale={locale} merchants={merchants} products={products} query={q} selectedMerchant={merchant} selectedProduct={product} selectedStatus={status} />
      ) : sectionValue === "collection-kit" ? (
        <CollectionKitPanel editingTask={editingCollectionTask} locale={locale} query={q} selectedStatus={status} tasks={collectionTasks} />
      ) : (
        <ReservedPanel dict={dict} section={sectionValue} />
      )}
    </AdminDashboardShell>
  );
}

async function saveMerchant(formData: FormData) {
  "use server";
  const locale = getFormString(formData, "locale") || "zh";
  const id = getFormString(formData, "id");
  const data = {
    name: getFormString(formData, "name") || "New Yiwu Christmas Supplier",
    market: getFormString(formData, "market") || "Yiwu International Trade Market",
    district: getFormString(formData, "district") || "District 1",
    booth: getFormString(formData, "booth") || "Area A, 1F, Booth 1001",
    contact: getFormString(formData, "contact") || "Contact Person",
    phone: getFormString(formData, "phone") || "+86",
    wechat: getFormString(formData, "wechat") || "",
    email: getFormString(formData, "email") || "sales@example.com",
    country: getFormString(formData, "country") || "China",
    description: getFormString(formData, "description") || "Yiwu Christmas products supplier.",
    coverImage: getFormString(formData, "coverImage") || "/images/yiwu-christmas-store.jpeg",
    verified: formData.get("verified") === "on"
  };

  if (id) {
    await prisma.merchant.update({ where: { id }, data });
  } else {
    await prisma.merchant.create({ data });
  }

  revalidateAdmin(locale);
  redirect(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/merchants"));
}

async function deleteMerchant(formData: FormData) {
  "use server";
  const locale = getFormString(formData, "locale") || "zh";
  const id = getFormString(formData, "id");
  if (id) {
    await prisma.merchant.delete({ where: { id } });
  }
  revalidateAdmin(locale);
  redirect(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/merchants"));
}

async function saveProduct(formData: FormData) {
  "use server";
  const locale = getFormString(formData, "locale") || "zh";
  const id = getFormString(formData, "id");
  const imageUrls = getFormString(formData, "images")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const data = {
    merchantId: getFormString(formData, "merchantId"),
    sku: getFormString(formData, "sku") || `SKU-${Date.now()}`,
    nameCN: getFormString(formData, "nameCN") || "圣诞产品",
    nameEN: getFormString(formData, "nameEN") || "Christmas Product",
    category: getFormString(formData, "category") || "Christmas Decorations",
    material: getFormString(formData, "material") || "Mixed material",
    size: getFormString(formData, "size") || "Custom size",
    color: getFormString(formData, "color") || "Custom color",
    moq: getFormString(formData, "moq") || "500 pcs",
    price: getFormString(formData, "price") || "0.50 - 2.50",
    currency: getFormString(formData, "currency") || "USD",
    packageInfo: getFormString(formData, "packageInfo") || "OPP bag or color box",
    leadTime: getFormString(formData, "leadTime") || "20-30 days",
    descriptionCN: getFormString(formData, "descriptionCN") || "适合欧美市场的圣诞用品。",
    descriptionEN: getFormString(formData, "descriptionEN") || "Christmas product for wholesale sourcing.",
    status: getFormString(formData, "status") || "active"
  };

  if (!data.merchantId) {
    redirect(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/products"));
  }

  const product = id ? await prisma.product.update({ where: { id }, data }) : await prisma.product.create({ data });

  if (imageUrls.length > 0) {
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: imageUrls.map((imageUrl, index) => ({ productId: product.id, imageUrl, sort: index + 1 }))
    });
  }

  revalidateAdmin(locale);
  redirect(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/products"));
}

async function deleteProduct(formData: FormData) {
  "use server";
  const locale = getFormString(formData, "locale") || "zh";
  const id = getFormString(formData, "id");
  if (id) {
    await prisma.product.delete({ where: { id } });
  }
  revalidateAdmin(locale);
  redirect(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/products"));
}

async function updateInquiryStatus(formData: FormData) {
  "use server";
  const locale = getFormString(formData, "locale") || "zh";
  const id = getFormString(formData, "id");
  const status = getFormString(formData, "status") || "new";
  if (id && inquiryStatuses.includes(status)) {
    await prisma.inquiry.update({ where: { id }, data: { status } });
  }
  revalidateAdmin(locale);
  redirect(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/inquiries"));
}

async function deleteInquiry(formData: FormData) {
  "use server";
  const locale = getFormString(formData, "locale") || "zh";
  const id = getFormString(formData, "id");
  if (id) {
    await prisma.inquiry.delete({ where: { id } });
  }
  revalidateAdmin(locale);
  redirect(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/inquiries"));
}

async function saveCollectionTask(formData: FormData) {
  "use server";
  const locale = getFormString(formData, "locale") || "zh";
  const id = getFormString(formData, "id");
  const visitedAtValue = getFormString(formData, "visitedAt");
  const data = {
    merchantName: getFormString(formData, "merchantName") || "New Yiwu Christmas Supplier",
    marketLocation: getFormString(formData, "marketLocation") || "Yiwu International Trade Market District 1",
    boothNumber: getFormString(formData, "boothNumber") || "",
    contactName: getFormString(formData, "contactName") || "",
    phone: getFormString(formData, "phone") || "",
    wechat: getFormString(formData, "wechat") || "",
    status: normalizeCollectionStatus(getFormString(formData, "status")),
    visitedAt: visitedAtValue ? new Date(visitedAtValue) : null,
    photoStatus: getFormString(formData, "photoStatus") || "not_started",
    skuCount: Number(getFormString(formData, "skuCount")) || 0,
    authorizationStatus: getFormString(formData, "authorizationStatus") || "pending",
    notes: getFormString(formData, "notes")
  };

  if (id) {
    await prisma.collectionTask.update({ where: { id }, data });
  } else {
    await prisma.collectionTask.create({ data });
  }

  revalidateAdmin(locale);
  revalidatePath(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/collection-kit"));
  redirect(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/collection-kit"));
}

async function deleteCollectionTask(formData: FormData) {
  "use server";
  const locale = getFormString(formData, "locale") || "zh";
  const id = getFormString(formData, "id");
  if (id) {
    await prisma.collectionTask.delete({ where: { id } });
  }
  revalidateAdmin(locale);
  revalidatePath(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/collection-kit"));
  redirect(localePath(locale === "en" ? "en" : "zh", "/dashboard/admin/collection-kit"));
}

function isAdminSection(section: string): section is AdminSection {
  return adminSections.includes(section as AdminSection);
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const inquiryStatuses = ["new", "contacted", "quoted", "closed", "lost"];
const collectionStatuses = ["todo", "visited", "authorized", "photos_done", "sku_done", "imported", "online"];

function normalizeCollectionStatus(status: string) {
  return collectionStatuses.includes(status) ? status : "todo";
}

function revalidateAdmin(locale: string) {
  const safeLocale = locale === "en" ? "en" : "zh";
  revalidatePath(localePath(safeLocale, "/dashboard/admin"));
  revalidatePath(localePath(safeLocale, "/dashboard/admin/merchants"));
  revalidatePath(localePath(safeLocale, "/dashboard/admin/products"));
  revalidatePath(localePath(safeLocale, "/dashboard/admin/collection-kit"));
  revalidatePath(localePath(safeLocale));
}

function SearchBar({ query, placeholder }: { placeholder: string; query: string }) {
  return (
    <form className="grid gap-3 rounded-[18px] border border-[#dde4e0] bg-white p-4 soft-shadow md:grid-cols-[1fr_120px]" action="">
      <input name="q" defaultValue={query} className="min-h-12 rounded-md border border-[#dde4e0] px-4 outline-none focus:border-[#013f29]" placeholder={placeholder} />
      <button className="min-h-12 rounded-md bg-[#013f29] px-4 font-black text-white" type="submit">
        Search
      </button>
    </form>
  );
}

function ImportCsvPanel({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  return (
    <section className="rounded-[18px] border border-[#dde4e0] bg-white p-6 soft-shadow">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase text-[#b91c1c]">Excel / CSV / JSON</p>
          <h3 className="mt-2 text-3xl font-black tracking-normal">{dict.dashboard.importTitle}</h3>
          <p className="mt-3 max-w-3xl leading-7 text-[#5f6864]">{dict.dashboard.importDescription}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link className="font-black text-[#0b8f5a]" href="/templates/products-simple-template.csv">
            Simple template
          </Link>
          <Link className="font-black text-[#0b8f5a]" href="/templates/products-template.csv">
            Full template
          </Link>
        </div>
      </div>
      <ProductImportUploader />
    </section>
  );
}

function MerchantsCrudPanel({
  dict,
  editingMerchant,
  locale,
  merchants,
  query
}: {
  dict: ReturnType<typeof getDictionary>;
  editingMerchant: AdminMerchant | null;
  locale: "en" | "zh";
  merchants: AdminMerchant[];
  query: string;
}) {
  return (
    <div className="grid gap-5">
      <SearchBar query={query} placeholder="Search company, market, booth, contact, email..." />
      <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <MerchantForm editingMerchant={editingMerchant} locale={locale} />
        <div className="grid gap-3">
          {merchants.map((merchant) => (
            <article key={merchant.id} className="grid gap-4 rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow lg:grid-cols-[1fr_190px] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-[#101615]">{merchant.name}</h3>
                  {merchant.verified ? <span className="rounded-full bg-[#eefaf5] px-3 py-1 text-xs font-black text-[#0b8f5a]">{dict.common.verifiedSupplier}</span> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-[#5f6864]">{merchant.market} / {merchant.district} / {merchant.booth}</p>
                <p className="mt-2 text-sm font-bold text-[#39413e]">{merchant.contact} · {merchant.email}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link className="rounded-md border border-[#013f29] px-4 py-2 text-sm font-black text-[#013f29]" href={`${localePath(locale, "/dashboard/admin/products")}?merchant=${merchant.id}`}>
                  Products
                </Link>
                <Link className="rounded-md border border-[#b45309] px-4 py-2 text-sm font-black text-[#b45309]" href={localePath(locale, `/products?merchant=${merchant.id}`)}>
                  View
                </Link>
                <Link className="rounded-md border border-[#0b8f5a] px-4 py-2 text-sm font-black text-[#0b8f5a]" href={`${localePath(locale, "/dashboard/admin/merchants")}?edit=${merchant.id}`}>
                  Edit
                </Link>
                <form action={deleteMerchant}>
                  <input name="locale" type="hidden" value={locale} />
                  <input name="id" type="hidden" value={merchant.id} />
                  <button className="rounded-md border border-[#ef3340] px-4 py-2 text-sm font-black text-[#ef3340]" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MerchantForm({ editingMerchant, locale }: { editingMerchant: AdminMerchant | null; locale: "en" | "zh" }) {
  return (
    <form action={saveMerchant} className="self-start rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow xl:sticky xl:top-28">
      <input name="locale" type="hidden" value={locale} />
      <input name="id" type="hidden" value={editingMerchant?.id ?? ""} />
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-2xl font-black">{editingMerchant ? "Edit Merchant" : "New Merchant"}</h3>
        {editingMerchant ? <Link className="text-sm font-black text-[#0b8f5a]" href={localePath(locale, "/dashboard/admin/merchants")}>New</Link> : null}
      </div>
      <div className="grid gap-3">
        <AdminInput name="name" label="Company" value={editingMerchant?.name} />
        <AdminInput name="market" label="Market" value={editingMerchant?.market} />
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="district" label="District" value={editingMerchant?.district} />
          <AdminInput name="booth" label="Booth" value={editingMerchant?.booth} />
        </div>
        <AdminInput name="contact" label="Contact" value={editingMerchant?.contact} />
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="phone" label="Phone" value={editingMerchant?.phone} />
          <AdminInput name="wechat" label="WeChat" value={editingMerchant?.wechat} />
        </div>
        <AdminInput name="email" label="Email" value={editingMerchant?.email} />
        <AdminInput name="country" label="Country" value={editingMerchant?.country} />
        <AdminInput name="coverImage" label="Cover Image" value={editingMerchant?.coverImage} />
        <AdminTextarea name="description" label="Description" value={editingMerchant?.description} />
        <label className="flex items-center gap-2 text-sm font-black text-[#39413e]">
          <input name="verified" type="checkbox" defaultChecked={editingMerchant?.verified ?? true} />
          Verified Supplier
        </label>
        <button className="min-h-12 rounded-md bg-[#ef3340] px-5 font-black text-white" type="submit">
          Save Merchant
        </button>
      </div>
    </form>
  );
}

function ProductsCrudPanel({
  category,
  categories,
  editingProduct,
  locale,
  merchant,
  merchants,
  products,
  query
}: {
  category: string;
  categories: string[];
  dict: ReturnType<typeof getDictionary>;
  editingProduct: AdminProduct | null;
  locale: "en" | "zh";
  merchant: string;
  merchants: AdminMerchant[];
  products: AdminProduct[];
  query: string;
}) {
  return (
    <div className="grid gap-5">
      <form className="grid min-w-0 max-w-full gap-3 rounded-[18px] border border-[#dde4e0] bg-white p-4 soft-shadow lg:grid-cols-[1fr_220px_220px_120px]" action="">
        <input name="q" defaultValue={query} className="min-h-12 rounded-md border border-[#dde4e0] px-4 outline-none focus:border-[#013f29]" placeholder="Search SKU, product name, category, material..." />
        <select name="merchant" defaultValue={merchant} className="min-h-12 rounded-md border border-[#dde4e0] px-3 font-bold outline-none focus:border-[#013f29]">
          <option value="">All merchants</option>
          {merchants.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select name="category" defaultValue={category} className="min-h-12 rounded-md border border-[#dde4e0] px-3 font-bold outline-none focus:border-[#013f29]">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button className="min-h-12 rounded-md bg-[#013f29] px-4 font-black text-white" type="submit">
          Search
        </button>
      </form>
      <section className="grid min-w-0 max-w-full gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <ProductForm editingProduct={editingProduct} locale={locale} merchants={merchants} />
        <div className="min-w-0 overflow-hidden rounded-[18px] border border-[#dde4e0] bg-white soft-shadow">
          {products.map((product) => (
            <article key={product.id} className="grid min-w-0 gap-4 border-b border-[#eef2f0] p-5 last:border-0 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-center">
              <div className="min-w-0">
                <p className="break-words text-lg font-black text-[#101615]">{product.nameEN}</p>
                <p className="mt-1 text-sm font-bold text-[#5f6864]">{product.sku} · {product.category} · {product.moq} · {product.currency} {product.price}</p>
                <p className="mt-1 break-words text-sm font-bold text-[#39413e]">{product.merchant.name}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link className="rounded-md border border-[#0b8f5a] px-4 py-2 text-sm font-black text-[#0b8f5a]" href={`${localePath(locale, "/dashboard/admin/products")}?edit=${product.id}`}>
                  Edit
                </Link>
                <form action={deleteProduct}>
                  <input name="locale" type="hidden" value={locale} />
                  <input name="id" type="hidden" value={product.id} />
                  <button className="rounded-md border border-[#ef3340] px-4 py-2 text-sm font-black text-[#ef3340]" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductForm({
  editingProduct,
  locale,
  merchants
}: {
  editingProduct: AdminProduct | null;
  locale: "en" | "zh";
  merchants: AdminMerchant[];
}) {
  const imageText = editingProduct?.images.map((image) => image.imageUrl).join("\n") ?? "";
  return (
    <form action={saveProduct} className="min-w-0 max-w-full self-start rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow xl:sticky xl:top-28">
      <input name="locale" type="hidden" value={locale} />
      <input name="id" type="hidden" value={editingProduct?.id ?? ""} />
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-2xl font-black">{editingProduct ? "Edit Product" : "New Product"}</h3>
        {editingProduct ? <Link className="text-sm font-black text-[#0b8f5a]" href={localePath(locale, "/dashboard/admin/products")}>New</Link> : null}
      </div>
      <div className="grid gap-3">
        <label className="grid gap-2 text-sm font-black text-[#39413e]">
          Supplier
          <select name="merchantId" defaultValue={editingProduct?.merchantId ?? merchants[0]?.id ?? ""} className="min-h-11 rounded-md border border-[#dde4e0] px-3 font-medium outline-none focus:border-[#013f29]">
            {merchants.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="sku" label="SKU" value={editingProduct?.sku} />
          <AdminInput name="category" label="Category" value={editingProduct?.category} />
        </div>
        <AdminInput name="nameEN" label="English Name" value={editingProduct?.nameEN} />
        <AdminInput name="nameCN" label="Chinese Name" value={editingProduct?.nameCN} />
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="material" label="Material" value={editingProduct?.material} />
          <AdminInput name="size" label="Size" value={editingProduct?.size} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="color" label="Color" value={editingProduct?.color} />
          <AdminInput name="moq" label="MOQ" value={editingProduct?.moq} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="price" label="Price" value={editingProduct?.price} />
          <AdminInput name="currency" label="Currency" value={editingProduct?.currency ?? "USD"} />
        </div>
        <AdminInput name="packageInfo" label="Package" value={editingProduct?.packageInfo} />
        <AdminInput name="leadTime" label="Lead Time" value={editingProduct?.leadTime} />
        <AdminInput name="status" label="Status" value={editingProduct?.status ?? "active"} />
        <AdminTextarea name="descriptionEN" label="English Description" value={editingProduct?.descriptionEN} />
        <AdminTextarea name="descriptionCN" label="Chinese Description" value={editingProduct?.descriptionCN} />
        <ProductImageUploadField defaultValue={imageText} />
        <button className="min-h-12 rounded-md bg-[#ef3340] px-5 font-black text-white" type="submit">
          Save Product
        </button>
      </div>
    </form>
  );
}

function AdminInput({ label, name, value }: { label: string; name: string; value?: string | null }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#39413e]">
      {label}
      <input name={name} defaultValue={value ?? ""} className="min-h-11 rounded-md border border-[#dde4e0] px-3 font-medium outline-none focus:border-[#013f29]" />
    </label>
  );
}

function AdminTextarea({ label, name, value }: { label: string; name: string; value?: string | null }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#39413e]">
      {label}
      <textarea name={name} defaultValue={value ?? ""} className="min-h-24 rounded-md border border-[#dde4e0] px-3 py-3 font-medium outline-none focus:border-[#013f29]" />
    </label>
  );
}

function InquiriesPanel({
  inquiries,
  locale,
  merchants,
  products,
  query,
  selectedMerchant,
  selectedProduct,
  selectedStatus
}: {
  inquiries: AdminInquiry[];
  locale: "en" | "zh";
  merchants: AdminMerchant[];
  products: AdminProduct[];
  query: string;
  selectedMerchant: string;
  selectedProduct: string;
  selectedStatus: string;
}) {
  return (
    <section className="grid gap-4">
      <form className="grid min-w-0 max-w-full gap-3 rounded-[18px] border border-[#dde4e0] bg-white p-4 soft-shadow xl:grid-cols-[1fr_180px_220px_220px_120px]">
        <input name="q" defaultValue={query} className="min-h-12 rounded-md border border-[#dde4e0] px-4 outline-none focus:border-[#013f29]" placeholder="Search buyer, email, product, merchant..." />
        <select name="status" defaultValue={selectedStatus} className="min-h-12 rounded-md border border-[#dde4e0] px-3 font-bold outline-none focus:border-[#013f29]">
          <option value="">All status</option>
          {inquiryStatuses.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select name="merchant" defaultValue={selectedMerchant} className="min-h-12 rounded-md border border-[#dde4e0] px-3 font-bold outline-none focus:border-[#013f29]">
          <option value="">All merchants</option>
          {merchants.map((merchant) => (
            <option key={merchant.id} value={merchant.id}>{merchant.name}</option>
          ))}
        </select>
        <select name="product" defaultValue={selectedProduct} className="min-h-12 rounded-md border border-[#dde4e0] px-3 font-bold outline-none focus:border-[#013f29]">
          <option value="">All products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>{product.nameEN}</option>
          ))}
        </select>
        <button className="min-h-12 rounded-md bg-[#013f29] px-4 font-black text-white" type="submit">Search</button>
      </form>
      {inquiries.length === 0 ? (
        <div className="rounded-[18px] border border-[#dde4e0] bg-white p-8 soft-shadow">
          <h3 className="text-2xl font-black">No inquiries yet</h3>
          <p className="mt-3 text-[#5f6864]">Customer inquiries submitted from product, AI sourcing, or contact pages will appear here.</p>
        </div>
      ) : null}
      {inquiries.map((inquiry) => (
        <article key={inquiry.id} className="min-w-0 max-w-full rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h3 className="text-xl font-black">{inquiry.buyerName || "Buyer"}</h3>
              <p className="mt-2 text-sm font-bold text-[#5f6864]">{inquiry.buyerEmail || "No email"} · {inquiry.buyerWhatsapp || "No WhatsApp"} · {inquiry.country || "No country"}</p>
            </div>
            <span className="rounded-full bg-[#eefaf5] px-3 py-2 text-xs font-black uppercase text-[#0b8f5a]">{inquiry.status}</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <InfoLine label="Product" value={inquiry.product?.nameEN ?? "-"} />
            <InfoLine label="Merchant" value={inquiry.merchant?.name ?? "-"} />
            <InfoLine label="Quantity" value={inquiry.quantity || "-"} />
            <InfoLine label="Budget" value={inquiry.budget || "-"} />
          </div>
          <p className="mt-4 rounded-md bg-[#f5f7f6] p-4 text-sm leading-6 text-[#39413e]">{inquiry.message}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="rounded-md border border-[#0b8f5a] px-4 py-2 text-sm font-black text-[#0b8f5a]" href={`${localePath(locale, "/dashboard/admin/inquiries")}?product=${inquiry.productId ?? ""}`}>
              Product inquiries
            </Link>
            <Link className="rounded-md border border-[#013f29] px-4 py-2 text-sm font-black text-[#013f29]" href={`${localePath(locale, "/dashboard/admin/inquiries")}?merchant=${inquiry.merchantId ?? ""}`}>
              Merchant inquiries
            </Link>
            <form action={updateInquiryStatus} className="flex flex-wrap gap-2">
              <input name="locale" type="hidden" value={locale} />
              <input name="id" type="hidden" value={inquiry.id} />
              <select name="status" defaultValue={inquiry.status} className="min-h-10 rounded-md border border-[#dde4e0] px-3 text-sm font-bold">
                {inquiryStatuses.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <button className="rounded-md bg-[#013f29] px-4 py-2 text-sm font-black text-white" type="submit">Update</button>
            </form>
            <form action={deleteInquiry}>
              <input name="locale" type="hidden" value={locale} />
              <input name="id" type="hidden" value={inquiry.id} />
              <button className="rounded-md border border-[#ef3340] px-4 py-2 text-sm font-black text-[#ef3340]" type="submit">Delete</button>
            </form>
          </div>
        </article>
      ))}
    </section>
  );
}

function CollectionKitPanel({
  editingTask,
  locale,
  query,
  selectedStatus,
  tasks
}: {
  editingTask: AdminCollectionTask | null;
  locale: "en" | "zh";
  query: string;
  selectedStatus: string;
  tasks: AdminCollectionTask[];
}) {
  const statusCounts = collectionStatuses.map((status) => ({
    count: tasks.filter((task) => task.status === status).length,
    status
  }));
  const totalSku = tasks.reduce((sum, task) => sum + task.skuCount, 0);

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[18px] border border-[#dde4e0] bg-white p-6 soft-shadow">
          <p className="text-xs font-black uppercase text-[#b91c1c]">Merchant Collection Kit</p>
          <h3 className="mt-2 text-3xl font-black tracking-normal">义乌商家采集资料包</h3>
          <p className="mt-3 max-w-3xl leading-7 text-[#5f6864]">
            用于线下拜访商家、拿授权、拍店铺图、登记 SKU、整理图片和批量导入后台。目标是让每家店从采集到上线都有清晰状态。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-md bg-[#013f29] px-4 py-3 text-sm font-black text-white" href={localePath(locale, "/dashboard/admin/merchants")}>
              新增商家
            </Link>
            <Link className="rounded-md bg-[#ef3340] px-4 py-3 text-sm font-black text-white" href={localePath(locale, "/dashboard/admin/import-csv")}>
              导入产品
            </Link>
            <Link className="rounded-md border border-[#0b8f5a] px-4 py-3 text-sm font-black text-[#0b8f5a]" href="/templates/products-simple-template.csv">
              下载简单 CSV 模板
            </Link>
            <Link className="rounded-md border border-[#0b8f5a] px-4 py-3 text-sm font-black text-[#0b8f5a]" href="/templates/products-template.csv">
              下载完整 CSV 模板
            </Link>
          </div>
        </div>
        <div className="grid gap-3 rounded-[18px] border border-[#dde4e0] bg-white p-6 soft-shadow sm:grid-cols-2">
          <Metric label="采集任务" value={String(tasks.length)} />
          <Metric label="SKU 总数" value={String(totalSku)} />
          <Metric label="已授权" value={String(tasks.filter((task) => task.authorizationStatus === "signed" || task.status === "authorized").length)} />
          <Metric label="已上线" value={String(tasks.filter((task) => task.status === "online").length)} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KitCard
          title="1. 商家授权书模板"
          items={[
            "确认 YiwuChristmas.ai 可展示公司名称、展位、产品图片和联系方式。",
            "记录授权人姓名、手机号、微信、签署日期。",
            "建议拍摄授权书照片并保存到 merchant/{booth}/authorization.jpg。"
          ]}
        />
        <KitCard
          title="2. 商家拜访话术"
          items={[
            "我们在做面向欧美采购商的义乌圣诞用品 AI 平台。",
            "免费帮店铺生成英文页面和产品 SKU 页面。",
            "客户询盘会通过 WhatsApp、邮箱或后台消息转给老板。"
          ]}
        />
        <KitCard
          title="3. 产品 SKU 登记说明"
          items={[
            "每个 SKU 单独登记英文名、中文名、材质、尺寸、颜色。",
            "MOQ、价格、包装、交期必须尽量完整。",
            "同款多色可先拆成不同 SKU，后期再做变体。"
          ]}
        />
        <KitCard
          title="4. 图片拍摄标准"
          items={[
            "横图优先，正面清晰，避免水印、二维码和杂乱背景。",
            "每个 SKU 至少 3 张：主图、细节图、包装图。",
            "店铺照片包含门头、货架、热卖区和老板允许展示的工厂图。"
          ]}
        />
        <KitCard
          title="5. 图片命名规则"
          items={[
            "产品图片：public/products/SKU0001/1.jpg、2.jpg、3.jpg。",
            "商家图片：public/merchants/booth-number/store-1.jpg。",
            "Excel/CSV 里的 images 字段用英文逗号分隔图片路径。"
          ]}
        />
        <KitCard
          title="6. CSV 导入模板下载"
          items={[
            "先用简单模板快速导入 SKU。",
            "完整模板用于补全材质、包装、交期、描述和图片。",
            "导入前检查重复 SKU，失败原因可导出 CSV。"
          ]}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <CollectionTaskForm editingTask={editingTask} locale={locale} />
        <div className="grid gap-4">
          <form className="grid gap-3 rounded-[18px] border border-[#dde4e0] bg-white p-4 soft-shadow lg:grid-cols-[1fr_220px_120px]">
            <input name="q" defaultValue={query} className="min-h-12 rounded-md border border-[#dde4e0] px-4 outline-none focus:border-[#013f29]" placeholder="搜索商家、展位、联系人、电话、微信..." />
            <select name="status" defaultValue={selectedStatus} className="min-h-12 rounded-md border border-[#dde4e0] px-3 font-bold outline-none focus:border-[#013f29]">
              <option value="">全部状态</option>
              {collectionStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button className="min-h-12 rounded-md bg-[#013f29] px-4 font-black text-white" type="submit">筛选</button>
          </form>

          <div className="flex flex-wrap gap-2">
            {statusCounts.map((item) => (
              <Link
                className={`rounded-full px-3 py-2 text-xs font-black uppercase ${selectedStatus === item.status ? "bg-[#013f29] text-white" : "bg-white text-[#5f6864]"}`}
                href={`${localePath(locale, "/dashboard/admin/collection-kit")}?status=${item.status}`}
                key={item.status}
              >
                {item.status} · {item.count}
              </Link>
            ))}
          </div>

          <div className="grid gap-3">
            {tasks.length === 0 ? (
              <div className="rounded-[18px] border border-[#dde4e0] bg-white p-8 soft-shadow">
                <h3 className="text-2xl font-black">暂无采集任务</h3>
                <p className="mt-3 text-[#5f6864]">先新增一个店铺采集任务，再按拜访、授权、拍照、SKU、导入、上线逐步推进。</p>
              </div>
            ) : null}
            {tasks.map((task) => (
              <article key={task.id} className="rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black">{task.merchantName}</h3>
                      <span className="rounded-full bg-[#eefaf5] px-3 py-1 text-xs font-black uppercase text-[#0b8f5a]">{task.status}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-[#5f6864]">{task.marketLocation} · {task.boothNumber || "No booth"}</p>
                    <p className="mt-1 text-sm font-bold text-[#39413e]">{task.contactName || "No contact"} · {task.phone || "No phone"} · WeChat: {task.wechat || "-"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <Link className="rounded-md border border-[#0b8f5a] px-4 py-2 text-sm font-black text-[#0b8f5a]" href={`${localePath(locale, "/dashboard/admin/collection-kit")}?edit=${task.id}`}>
                      Edit
                    </Link>
                    <form action={deleteCollectionTask}>
                      <input name="locale" type="hidden" value={locale} />
                      <input name="id" type="hidden" value={task.id} />
                      <button className="rounded-md border border-[#ef3340] px-4 py-2 text-sm font-black text-[#ef3340]" type="submit">Delete</button>
                    </form>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                  <InfoLine label="Visited" value={task.visitedAt ? task.visitedAt.toLocaleDateString("zh-CN") : "-"} />
                  <InfoLine label="Photo" value={task.photoStatus || "-"} />
                  <InfoLine label="SKU Count" value={String(task.skuCount)} />
                  <InfoLine label="Authorization" value={task.authorizationStatus || "-"} />
                </div>
                {task.notes ? <p className="mt-4 rounded-md bg-[#f5f7f6] p-4 text-sm leading-6 text-[#39413e]">{task.notes}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="rounded-md bg-[#013f29] px-4 py-2 text-sm font-black text-white" href={`${localePath(locale, "/dashboard/admin/merchants")}?q=${encodeURIComponent(task.merchantName)}`}>
                    跳转商家
                  </Link>
                  <Link className="rounded-md bg-[#ef3340] px-4 py-2 text-sm font-black text-white" href={localePath(locale, "/dashboard/admin/import-csv")}>
                    导入产品
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CollectionTaskForm({ editingTask, locale }: { editingTask: AdminCollectionTask | null; locale: "en" | "zh" }) {
  return (
    <form action={saveCollectionTask} className="self-start rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow xl:sticky xl:top-28">
      <input name="locale" type="hidden" value={locale} />
      <input name="id" type="hidden" value={editingTask?.id ?? ""} />
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-2xl font-black">{editingTask ? "编辑采集任务" : "新增采集任务"}</h3>
        {editingTask ? <Link className="text-sm font-black text-[#0b8f5a]" href={localePath(locale, "/dashboard/admin/collection-kit")}>New</Link> : null}
      </div>
      <div className="grid gap-3">
        <AdminInput name="merchantName" label="Merchant Name" value={editingTask?.merchantName} />
        <AdminInput name="marketLocation" label="Market Location" value={editingTask?.marketLocation} />
        <AdminInput name="boothNumber" label="Booth Number" value={editingTask?.boothNumber} />
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="contactName" label="Contact Name" value={editingTask?.contactName} />
          <AdminInput name="phone" label="Phone" value={editingTask?.phone} />
        </div>
        <AdminInput name="wechat" label="WeChat" value={editingTask?.wechat} />
        <label className="grid gap-2 text-sm font-black text-[#39413e]">
          Status
          <select name="status" defaultValue={editingTask?.status ?? "todo"} className="min-h-11 rounded-md border border-[#dde4e0] px-3 font-medium outline-none focus:border-[#013f29]">
            {collectionStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black text-[#39413e]">
          Visited At
          <input name="visitedAt" type="date" defaultValue={formatDateInput(editingTask?.visitedAt)} className="min-h-11 rounded-md border border-[#dde4e0] px-3 font-medium outline-none focus:border-[#013f29]" />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="photoStatus" label="Photo Status" value={editingTask?.photoStatus ?? "not_started"} />
          <AdminInput name="skuCount" label="SKU Count" value={String(editingTask?.skuCount ?? 0)} />
        </div>
        <AdminInput name="authorizationStatus" label="Authorization Status" value={editingTask?.authorizationStatus ?? "pending"} />
        <AdminTextarea name="notes" label="Notes" value={editingTask?.notes} />
        <button className="min-h-12 rounded-md bg-[#ef3340] px-5 font-black text-white" type="submit">
          Save Collection Task
        </button>
      </div>
    </form>
  );
}

function KitCard({ items, title }: { items: string[]; title: string }) {
  return (
    <article className="rounded-[18px] border border-[#dde4e0] bg-white p-5 soft-shadow">
      <h3 className="text-lg font-black text-[#101615]">{title}</h3>
      <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#5f6864]">
        {items.map((item) => (
          <li className="rounded-md bg-[#f5f7f6] p-3" key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md bg-[#f5f7f6] p-4">
      <small className="block text-xs font-black uppercase text-[#7a8580]">{label}</small>
      <strong className="mt-2 block text-3xl font-black text-[#101615]">{value}</strong>
    </span>
  );
}

function formatDateInput(value?: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md bg-[#f5f7f6] p-3">
      <small className="block font-black uppercase text-[#7a8580]">{label}</small>
      <strong className="mt-1 block text-[#101615]">{value}</strong>
    </span>
  );
}

function ReservedPanel({ dict, section }: { dict: ReturnType<typeof getDictionary>; section: AdminSection }) {
  return (
    <section className="rounded-[18px] border border-[#dde4e0] bg-white p-8 soft-shadow">
      <p className="text-xs font-black uppercase text-[#b91c1c]">{dict.dashboard.menu[section]}</p>
      <h3 className="mt-2 text-3xl font-black tracking-normal">{dict.dashboard.reservedTitle}</h3>
      <p className="mt-4 max-w-3xl leading-7 text-[#5f6864]">{dict.dashboard.reserved}</p>
    </section>
  );
}
