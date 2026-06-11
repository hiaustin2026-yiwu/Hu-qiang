export type LocaleCode = "en" | "zh";

export type LocalizedString = Record<LocaleCode, string>;

export type UserRole = "buyer" | "supplier" | "admin";

export type User = {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  locale: LocaleCode;
};

export type Category = {
  id: string;
  nameZh: string;
  nameEn: string;
  slug: string;
  descriptionZh: string;
  descriptionEn: string;
  image: string;
};

export type Supplier = {
  id: string;
  slug: string;
  companyNameZh: string;
  companyNameEn: string;
  boothNumber: string;
  marketDistrict: string;
  mainCategories: string[];
  phone: string;
  whatsapp: string;
  email: string;
  addressZh: string;
  addressEn: string;
  descriptionZh: string;
  descriptionEn: string;
  coverImage: string;
  storeImages: string[];
  verified: boolean;
  rating: number;
  contactName?: string;
  wechat?: string;
  floor?: string;
  supplierType?: "Factory" | "Trading Company";
  reviewCount?: number;
  goldSupplier?: boolean;
  aiTrustScore?: number;
  establishedYear?: number;
  employeeCount?: string;
  exportMarkets?: string[];
  annualExport?: string;
  factoryArea?: string;
  oem?: boolean;
  odm?: boolean;
  certificates?: string[];
  averageLeadTime?: string;
  averageMoq?: string;
  paymentTerms?: string[];
  factoryImages?: string[];
  logoImage?: string;
  aiRecommendations?: string[];
};

export type Product = {
  id: string;
  sku: string;
  supplierId: string;
  categoryId: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  material: string;
  size: string;
  color: string;
  moq: string;
  priceRange: string;
  leadTime: string;
  packageInfo: string;
  images: string[];
  tags: string[];
  featured: boolean;
  slug: string;
  aiSimilarity?: number;
  imagePosition?: string;
};

export type SupplierImportRow = {
  companyNameZh: string;
  companyNameEn: string;
  boothNumber: string;
  marketDistrict: string;
  mainCategories: string;
  phone: string;
  whatsapp: string;
  email: string;
  addressZh: string;
  addressEn: string;
  descriptionZh: string;
  descriptionEn: string;
  coverImage: string;
  storeImages: string;
  verified: string;
  rating: string;
};

export type ProductImportRow = {
  sku: string;
  supplierId: string;
  categoryId: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  material: string;
  size: string;
  color: string;
  moq: string;
  priceRange: string;
  leadTime: string;
  packageInfo: string;
  images: string;
  tags: string;
  featured: string;
};

export type Inquiry = {
  id: string;
  userId?: string;
  productId?: string;
  supplierId?: string;
  message: string;
  status: "draft" | "sent" | "quoted" | "closed";
};

export type Favorite = {
  id: string;
  userId: string;
  productId?: string;
  supplierId?: string;
};

export type Message = {
  id: string;
  inquiryId: string;
  senderId: string;
  body: string;
};

export type Review = {
  id: string;
  supplierId: string;
  userId: string;
  rating: number;
  body: string;
};
