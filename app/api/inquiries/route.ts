import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidEmail, sendInquiryNotification, type InquiryEmailPayload } from "@/lib/inquiry-email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string | undefined>;
    const data: InquiryEmailPayload = {
      productId: body.productId?.trim(),
      merchantId: body.merchantId?.trim(),
      buyerName: body.buyerName?.trim() || "Buyer",
      buyerEmail: body.buyerEmail?.trim() || "",
      buyerWhatsapp: body.buyerWhatsapp?.trim() || "",
      country: body.country?.trim() || "",
      quantity: body.quantity?.trim() || "",
      budget: body.budget?.trim() || "",
      message: body.message?.trim() || "Please send quotation."
    };

    if (!isValidEmail(data.buyerEmail)) {
      return NextResponse.json({ ok: false, error: "A valid email address is required." }, { status: 400 });
    }

    await sendInquiryNotification(data);

    let inquiryId: string | null = null;
    try {
      const inquiry = await prisma.inquiry.create({
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
      inquiryId = inquiry.id;
    } catch {
      // Email delivery remains the source of truth until a persistent production database is configured.
    }

    return NextResponse.json({ ok: true, inquiryId, notificationSent: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Inquiry failed." }, { status: 400 });
  }
}
