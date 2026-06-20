"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type ProductInquiryFormProps = {
  defaultMessage: string;
  merchantId: string;
  productId: string;
};

export function ProductInquiryForm({ defaultMessage, merchantId, productId }: ProductInquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("submitting");
    setError("");

    const payload = {
      productId,
      merchantId,
      buyerName: getValue(formData, "buyerName"),
      buyerEmail: getValue(formData, "buyerEmail"),
      buyerWhatsapp: getValue(formData, "buyerWhatsapp"),
      country: getValue(formData, "country"),
      quantity: getValue(formData, "quantity"),
      budget: getValue(formData, "budget"),
      message: getValue(formData, "message")
    };

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { error?: string; ok: boolean };
      if (!response.ok || !result.ok) throw new Error(result.error || "Inquiry failed.");
      form.reset();
      setStatus("done");
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "Inquiry failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[22px] border border-[#e6e1d8] bg-white p-6 soft-shadow">
      <p className="font-black uppercase text-[#b91c1c]">Inquiry</p>
      <h2 className="mt-2 text-3xl font-black tracking-normal">Send inquiry to supplier</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InquiryInput label="Name" name="buyerName" />
        <InquiryInput label="Email" name="buyerEmail" type="email" required />
        <InquiryInput label="WhatsApp" name="buyerWhatsapp" />
        <InquiryInput label="Country" name="country" />
        <InquiryInput label="Quantity" name="quantity" />
        <InquiryInput label="Budget" name="budget" />
      </div>
      <label className="mt-4 grid gap-2 text-sm font-black text-[#39413e]">
        Message
        <textarea
          name="message"
          defaultValue={defaultMessage}
          className="min-h-36 rounded-md border border-[#dde4e0] px-4 py-3 outline-none focus:border-[#013f29]"
        />
      </label>
      <button className="mt-5 min-h-12 rounded-md bg-[#ef3340] px-6 font-black text-white disabled:bg-[#c8d0cc]" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting..." : "Submit Inquiry"}
      </button>
      {status === "done" ? (
        <p className="mt-5 rounded-md bg-[#eefaf5] px-4 py-3 font-black text-[#0b8f5a]">
          Thank you. Our sourcing assistant will contact you soon.
        </p>
      ) : null}
      {status === "error" ? <p className="mt-5 rounded-md bg-[#fff1f2] px-4 py-3 font-black text-[#be123c]">{error}</p> : null}
    </form>
  );
}

function InquiryInput({ label, name, required = false, type = "text" }: { label: string; name: string; required?: boolean; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#39413e]">
      {label}
      <input name={name} type={type} required={required} className="min-h-12 rounded-md border border-[#dde4e0] px-4 outline-none focus:border-[#013f29]" />
    </label>
  );
}

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
