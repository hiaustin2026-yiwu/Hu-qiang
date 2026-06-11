export const brandConfig = {
  currentBrand: "YiwuChristmas.ai",
  platformBrand: "Yiwu3D.ai",
  domains: {
    primary: process.env.NEXT_PUBLIC_PRIMARY_DOMAIN ?? "yiwuchristmas.com",
    ai: process.env.NEXT_PUBLIC_AI_DOMAIN ?? "yiwuchristmas.ai",
    china: process.env.NEXT_PUBLIC_CHINA_DOMAIN ?? "cn.yiwuchristmas.com",
    app: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "app.yiwuchristmas.com"
  },
  futureBrands: [
    { name: "YiwuToy.ai", vertical: "Toys" },
    { name: "YiwuGift.ai", vertical: "Gifts" },
    { name: "Yiwu3D.ai", vertical: "Unified Yiwu AI sourcing network" }
  ],
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "sales@yiwuchristmas.ai",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8613800000000"
  }
} as const;
