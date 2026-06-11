import { NextResponse, type NextRequest } from "next/server";
import { chinaLocale, defaultLocale, isLocale, locales, type Locale } from "@/config/i18n";

function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get("locale")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const country = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
  if (country?.toUpperCase() === "CN") return chinaLocale;

  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (acceptLanguage.includes("zh")) return chinaLocale;
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

  if (pathnameHasLocale) {
    const response = NextResponse.next();
    const locale = pathname.split("/")[1];
    if (isLocale(locale)) response.cookies.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const locale = detectLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"]
};
