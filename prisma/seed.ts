import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const merchants = [
  {
    id: "merchant-shuangyuan",
    name: "Yiwu Shuangyuan Christmas Co., Ltd.",
    market: "Yiwu International Trade Market",
    district: "District 1",
    booth: "Area A, 4F, Booth 4023",
    contact: "Mr. Chen",
    phone: "+86 138 0000 0000",
    wechat: "yiwu_christmas_chen",
    email: "sales@yiwuchristmas.ai",
    country: "China",
    description: "Verified Yiwu supplier focused on Christmas trees, ornaments and retail-ready decoration programs.",
    coverImage: "/images/yiwu-christmas-store.jpeg",
    verified: true,
    prefix: "YC-SY",
    categories: ["Christmas Trees", "Christmas Ball", "Christmas Ornaments", "Christmas Decorations"]
  },
  {
    id: "merchant-bairui",
    name: "Yiwu Bairui Lighting Co., Ltd.",
    market: "Yiwu International Trade Market",
    district: "District 2",
    booth: "Area D, 1F, Booth 1028",
    contact: "Ms. Lin",
    phone: "+86 139 0000 1028",
    wechat: "bairui_lighting",
    email: "lighting@yiwuchristmas.ai",
    country: "China",
    description: "Factory supplier for LED Christmas lights, outdoor deer lights, curtain lights and motif lighting.",
    coverImage: "/images/christmas-deer-results.jpeg",
    verified: true,
    prefix: "YC-BR",
    categories: ["Christmas Lights", "LED Lights", "Outdoor Decorations", "Christmas Decorations"]
  },
  {
    id: "merchant-hongle",
    name: "Yiwu Hongle Packaging & Gifts Co., Ltd.",
    market: "Yiwu International Trade Market",
    district: "District 5",
    booth: "Area F, 5F, Booth 5108",
    contact: "Mr. Liu",
    phone: "+86 135 0000 5108",
    wechat: "hongle_gifts",
    email: "hongle@yiwuchristmas.ai",
    country: "China",
    description: "Christmas gift packaging and seasonal promotional product supplier for e-commerce and wholesale buyers.",
    coverImage: "/images/yiwu-christmas-showroom.png",
    verified: true,
    prefix: "YC-HL",
    categories: ["Christmas Gifts", "Gift Packaging", "Party Supplies", "Christmas Decorations"]
  }
];

const productNames = [
  ["圣诞球套装", "Christmas Ball Set", "Plastic shatterproof ball with glitter finish"],
  ["预装灯圣诞树", "Pre-lit Christmas Tree", "PE/PVC branches with warm white LED"],
  ["LED 圣诞鹿灯", "LED Christmas Deer Light", "Metal frame with LED light string"],
  ["圣诞花环", "Christmas Wreath", "PVC pine, pinecone and berry"],
  ["圣诞礼盒", "Christmas Gift Box", "Greyboard with printed art paper"],
  ["圣诞藤条", "Christmas Garland", "PVC pine with wire core"],
  ["树顶星", "Tree Topper Star", "Plastic star with glitter finish"],
  ["圣诞袜", "Christmas Stocking", "Polyester plush fabric"],
  ["窗帘灯", "LED Curtain Light", "PVC cable and copper wire LED"],
  ["派对装饰套装", "Party Decoration Set", "Foil, latex and paper material"]
];

async function main() {
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.merchant.deleteMany();

  for (const merchant of merchants) {
    const { prefix, categories, ...merchantData } = merchant;
    await prisma.merchant.create({ data: merchantData });

    for (let index = 0; index < 10; index++) {
      const productNumber = String(index + 1).padStart(4, "0");
      const sku = `${prefix}-${productNumber}`;
      const [nameCN, nameEN, material] = productNames[index];
      await prisma.product.create({
        data: {
          merchantId: merchant.id,
          sku,
          nameCN,
          nameEN,
          category: categories[index % categories.length],
          material,
          size: index % 2 === 0 ? "6 / 8 / 10 cm" : "30 / 45 / 60 cm",
          color: index % 3 === 0 ? "Red, gold, green" : "Custom color available",
          moq: index % 2 === 0 ? "500 pcs" : "300 sets",
          price: index % 2 === 0 ? "0.28 - 1.20" : "1.80 - 6.90",
          currency: "USD",
          packageInfo: "OPP bag, color box, or custom retail packaging",
          leadTime: index % 2 === 0 ? "15-25 days" : "25-35 days",
          descriptionCN: `${nameCN}，适合欧美市场圣诞季批发采购。`,
          descriptionEN: `${nameEN} for Christmas season wholesale sourcing from Yiwu Market.`,
          status: "active",
          images: {
            create: [
              { imageUrl: `/products/${sku}/1.jpg`, sort: 1 },
              { imageUrl: `/products/${sku}/2.jpg`, sort: 2 },
              { imageUrl: `/products/${sku}/3.jpg`, sort: 3 }
            ]
          }
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
