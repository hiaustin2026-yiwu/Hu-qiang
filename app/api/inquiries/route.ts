import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string | undefined>;
    const inquiry = await prisma.inquiry.create({
      data: {
        productId: body.productId || null,
        merchantId: body.merchantId || null,
        buyerName: body.buyerName?.trim() || "Buyer",
        buyerEmail: body.buyerEmail?.trim() || "",
        buyerWhatsapp: body.buyerWhatsapp?.trim() || "",
        country: body.country?.trim() || "",
        quantity: body.quantity?.trim() || "",
        budget: body.budget?.trim() || "",
        message: body.message?.trim() || "Please send quotation.",
        status: "new"
      }
    });

    return NextResponse.json({ ok: true, inquiryId: inquiry.id });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Inquiry failed." }, { status: 400 });
  }
}
