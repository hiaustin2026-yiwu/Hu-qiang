import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const outputWidths = [800, 400] as const;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing image file." }, { status: 400 });
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ ok: false, error: "Unsupported image type. Upload JPG, PNG, or WEBP." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const baseName = `${Date.now()}-${slugify(path.parse(file.name).name) || "image"}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const generated = [];
    for (const width of outputWidths) {
      const webpName = `${baseName}-${width}.webp`;
      const jpgName = `${baseName}-${width}.jpg`;
      const webpPath = path.join(uploadDir, webpName);
      const jpgPath = path.join(uploadDir, jpgName);

      await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(webpPath);
      await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toFile(jpgPath);

      generated.push({ width, format: "webp", path: `/uploads/${webpName}` });
      generated.push({ width, format: "jpg", path: `/uploads/${jpgName}` });
    }

    return NextResponse.json({
      ok: true,
      original: {
        name: file.name,
        type: file.type,
        size: file.size
      },
      files: generated
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Image upload failed." }, { status: 400 });
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
