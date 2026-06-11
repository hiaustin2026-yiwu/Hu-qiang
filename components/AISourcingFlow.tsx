"use client";

import { useEffect, useMemo, useState } from "react";
import { brandConfig } from "@/config/brand";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/messages";

type SortKey = "match" | "price" | "moq" | "leadTime" | "rating";

type MatchedShop = {
  name: string;
  owner: string;
  location: string;
  specialty: string;
  match: number;
  price: number;
  moq: number;
  leadTime: number;
  rating: number;
  reviews: number;
  source: "1688" | "Alibaba" | "Google" | "Market Visit";
};

const matchedShops: MatchedShop[] = Array.from({ length: 20 }, (_, index) => {
  const base = [
    ["Yiwu Shuangyuan Christmas Co., Ltd.", "Mr. Chen", "LED deer lights, outdoor displays", 23.5, 2, 7, 4.9, 128, "Market Visit"],
    ["Yiwu Bairui Lighting Co., Ltd.", "Ms. Lin", "LED string lights, acrylic deer", 24.8, 2, 9, 4.8, 75, "1688"],
    ["Yiwu Gangheng Arts & Crafts Co., Ltd.", "Mr. Wang", "Ornaments and boxed decoration sets", 28.6, 6, 12, 5, 96, "Alibaba"],
    ["Yiwu Duoyue Craft Co., Ltd.", "Ms. Zhao", "Iron deer ornaments and gift items", 18.9, 2, 10, 4.9, 62, "1688"],
    ["Yiwu Hongle Christmas Co., Ltd.", "Mr. Liu", "Mesh deer lights and large motifs", 20.5, 4, 14, 4.7, 58, "Google"]
  ][index % 5] as [string, string, string, number, number, number, number, number, MatchedShop["source"]];

  return {
    name: index < 5 ? base[0] : `${base[0].replace("Co., Ltd.", "")} ${index + 1}`,
    owner: base[1],
    location: `Yiwu Market District ${(index % 2) + 1}, Area ${String.fromCharCode(65 + (index % 6))}, Booth ${2000 + index * 137}`,
    specialty: base[2],
    match: 98 - index,
    price: Number((base[3] + index * 0.7).toFixed(2)),
    moq: base[4] + (index % 4) * 2,
    leadTime: base[5] + (index % 5),
    rating: Math.min(5, Number((base[6] - (index % 3) * 0.1).toFixed(1))),
    reviews: base[7] + index * 3,
    source: base[8]
  };
});

function sortShops(items: MatchedShop[], key: SortKey) {
  return [...items].sort((a, b) => {
    if (key === "price") return a.price - b.price;
    if (key === "moq") return a.moq - b.moq;
    if (key === "leadTime") return a.leadTime - b.leadTime;
    if (key === "rating") return b.rating - a.rating || b.reviews - a.reviews;
    return b.match - a.match;
  });
}

function buildEnglishInquiry(shop: MatchedShop) {
  return `Hello ${shop.owner},

I found your shop through ${brandConfig.currentBrand} after uploading a product photo.

GPT recognition:
- Product name: LED Christmas Deer Decoration
- Material: Metal frame / rattan-look body / copper wire LED / PVC cable
- Usage: Outdoor garden, shopping mall, storefront and holiday display
- HS Code reference: 9405.42 / 9505.10, final classification to be verified by customs broker
- Keywords: LED Christmas deer, outdoor reindeer decoration, warm white LED, Christmas garden light

Please send:
1. Product photos and videos
2. FOB prices for 300 / 500 / 1000 pcs
3. MOQ, sample cost and sample lead time
4. Production lead time before Christmas season
5. Carton size, gross weight and packaging
6. CE / RoHS / UKCA or available test reports

Recommended shop: ${shop.name}
Market location: ${shop.location}

Thank you.`;
}

type AISourcingFlowProps = {
  locale: Locale;
  dict: Dictionary;
};

export function AISourcingFlow({ dict }: AISourcingFlowProps) {
  const [preview, setPreview] = useState("");
  const [stage, setStage] = useState<"upload" | "recognizing" | "recognized">("upload");
  const [sortKey, setSortKey] = useState<SortKey>("match");
  const sortedShops = useMemo(() => sortShops(matchedShops, sortKey), [sortKey]);
  const [selectedShop, setSelectedShop] = useState(sortedShops[0]);

  useEffect(() => {
    setSelectedShop(sortedShops[0]);
  }, [sortedShops]);

  const inquiry = useMemo(() => buildEnglishInquiry(selectedShop), [selectedShop]);
  const whatsappHref = `https://wa.me/${brandConfig.contact.whatsapp}?text=${encodeURIComponent(inquiry)}`;
  const emailHref = `mailto:${brandConfig.contact.email}?subject=${encodeURIComponent("Christmas Product Inquiry")}&body=${encodeURIComponent(inquiry)}`;

  function handleFile(file?: File) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setStage("upload");
  }

  function recognizeImage() {
    setStage("recognizing");
    window.setTimeout(() => setStage("recognized"), 850);
  }

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "match", label: dict.ai.bestMatch },
    { key: "price", label: dict.ai.price },
    { key: "moq", label: dict.ai.moq },
    { key: "leadTime", label: dict.ai.leadTime },
    { key: "rating", label: dict.ai.rating }
  ];

  return (
    <section id="ai-flow" className="bg-white py-20">
      <div className="container-page">
        <div className="mb-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="font-black uppercase text-[#b91c1c]">{dict.home.featureTitle}</p>
            <h2 className="mt-2 text-4xl font-black tracking-normal md:text-5xl">{dict.ai.title}</h2>
          </div>
          <p className="text-lg leading-8 text-[#5f6864]">{dict.ai.subtitle}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[340px_1fr_410px]">
          <div className="rounded-[18px] border border-[#e6e1d8] bg-[#fbfaf7] p-5 soft-shadow">
            <h3 className="text-2xl font-black">{dict.ai.upload}</h3>
            <label className="mt-5 grid min-h-72 cursor-pointer place-items-center overflow-hidden rounded-[14px] border border-dashed border-[#b8c2bd] bg-white text-center">
              {preview ? (
                <img src={preview} alt="" className="h-full max-h-72 w-full object-cover" />
              ) : (
                <span className="grid gap-2 px-8">
                  <strong className="text-lg">{dict.ai.upload}</strong>
                  <small className="text-[#7b8580]">{dict.ai.uploadHint}</small>
                </span>
              )}
              <input className="sr-only" type="file" accept="image/*" onChange={(event) => handleFile(event.target.files?.[0])} />
            </label>
            <div className="mt-4 grid gap-3">
              <button type="button" onClick={() => setPreview("/images/christmas-deer-results.jpeg")} className="min-h-11 rounded-md border border-[#013f29]/20 bg-white px-4 font-black text-[#013f29]">
                {dict.ai.demo}
              </button>
              <button type="button" onClick={recognizeImage} className="min-h-11 rounded-md bg-[#ef3340] px-4 font-black text-white">
                {stage === "recognizing" ? dict.ai.recognizing : dict.ai.start}
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[dict.home.aiVoice, dict.home.aiTranslation, dict.home.voiceSearch, dict.home.voiceChat].map((label) => (
                <button key={label} type="button" data-ai-reserved className="rounded-md border border-[#d8dedb] bg-white p-3 text-left text-sm font-black text-[#5f6864]">
                  {label}
                  <small className="mt-1 block font-bold text-[#9aa39d]">{dict.common.comingSoon}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#e6e1d8] bg-white p-5 soft-shadow">
            <h3 className="text-2xl font-black">{dict.ai.structured}</h3>
            <div className="mt-5 rounded-[14px] bg-[#013f29] p-5 text-white">
              {stage === "recognized" ? (
                <div className="grid gap-3">
                  <Info label={dict.ai.productName} value="LED Christmas Deer Decoration" />
                  <Info label={dict.ai.material} value="Metal frame / rattan-look body / copper wire LED / PVC cable" />
                  <Info label={dict.ai.usage} value="Outdoor garden, shopping mall, storefront and holiday display" />
                  <Info label={dict.ai.hsCode} value="9405.42 / 9505.10, final classification requires customs broker verification" />
                  <Info label={dict.ai.keywords} value="LED Christmas deer, outdoor reindeer decoration, warm white LED, Christmas garden light" />
                </div>
              ) : (
                <p className="leading-7 text-white/75">{dict.home.featureSubtitle}</p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSortKey(option.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-black ${sortKey === option.key ? "border-[#013f29] bg-[#013f29] text-white" : "border-[#d8dedb] bg-white text-[#26302b]"}`}
                >
                  {dict.ai.sort}: {option.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <strong className="text-xl">{dict.ai.matched}</strong>
              <span className="rounded-full bg-[#eefaf5] px-4 py-2 text-sm font-black text-[#0b8f5a]">AI Rank</span>
            </div>
            <div className="mt-4 grid max-h-[760px] gap-3 overflow-y-auto pr-2">
              {sortedShops.map((shop, index) => (
                <button
                  type="button"
                  key={shop.name}
                  onClick={() => setSelectedShop(shop)}
                  className={`rounded-[14px] border p-4 text-left transition ${selectedShop.name === shop.name ? "border-[#0b8f5a] bg-[#eefaf5]" : "border-[#e6e1d8] bg-white hover:border-[#0b8f5a]"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <strong className="text-lg">{index + 1}. {shop.name}</strong>
                      <span className="mt-1 block text-sm text-[#5f6864]">{shop.owner} · {shop.location}</span>
                    </div>
                    <span className="rounded-full bg-[#0b8f5a] px-3 py-1 text-xs font-black text-white">{shop.match}%</span>
                  </div>
                  <p className="mt-3 text-sm text-[#5f6864]">{shop.specialty}</p>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-5">
                    <Metric label={dict.ai.price} value={`$${shop.price.toFixed(2)}`} />
                    <Metric label={dict.ai.moq} value={`${shop.moq} pcs`} />
                    <Metric label={dict.ai.leadTime} value={`${shop.leadTime}d`} />
                    <Metric label={dict.ai.rating} value={`${shop.rating.toFixed(1)}★`} />
                    <Metric label="Source" value={shop.source} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-[18px] border border-[#e6e1d8] bg-[#fbfaf7] p-5 soft-shadow">
            <h3 className="text-2xl font-black">{dict.ai.contactOwner}</h3>
            <div className="mt-4 rounded-[14px] bg-white p-4">
              <span className="text-xs font-black uppercase text-[#b91c1c]">{dict.ai.selectedShop}</span>
              <strong className="mt-2 block text-xl">{selectedShop.name}</strong>
              <p className="mt-2 text-sm text-[#5f6864]">{selectedShop.owner}</p>
            </div>
            <h4 className="mt-5 font-black">{dict.ai.inquiry}</h4>
            <textarea readOnly value={inquiry} className="mt-3 min-h-96 w-full rounded-md border border-[#d8dedb] bg-white p-4 text-sm leading-6 outline-none" />
            <div className="mt-4 grid gap-3">
              <a href={whatsappHref} className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#0b8f5a] px-5 font-black text-white">
                {dict.ai.whatsapp}
              </a>
              <a href={emailHref} className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#013f29]/20 bg-white px-5 font-black text-[#013f29]">
                {dict.ai.email}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/10 p-3">
      <span className="block text-xs font-black uppercase text-[#ffd166]">{label}</span>
      <p className="mt-1 text-sm leading-6 text-white/85">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md bg-[#f5f7f6] p-2">
      <small className="block text-[0.68rem] font-black uppercase text-[#7a8580]">{label}</small>
      <strong className="mt-1 block text-[#101615]">{value}</strong>
    </span>
  );
}
