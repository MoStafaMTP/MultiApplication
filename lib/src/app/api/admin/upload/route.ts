import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { requireAdmin } from "@/app/api/admin/_requireAdmin";

export const runtime = "nodejs";

// Optional: set UPLOAD_MAX_BYTES (e.g. 52428800 for 50MB). 0/empty = unlimited.
const MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES ?? 0);

type FileLike = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  name?: string;
  type?: string;
  size?: number;
};

function isFileLike(v: unknown): v is FileLike {
  return !!v && typeof (v as any).arrayBuffer === "function";
}

function safeExt(mime: string, original: string) {
  const byMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
  };
  const ext = byMime[mime];
  if (ext) return ext;

  const o = path.extname(original || "");
  return o && o.length <= 10 ? o : "";
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");

    // IMPORTANT: don't rely on `instanceof File` (can be missing on some Node runtimes).
    if (!isFileLike(file)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const mime = String(file.type ?? "application/octet-stream");
    const originalName = String(file.name ?? "upload");
    const size = Number(file.size ?? 0);

    if (MAX_BYTES > 0 && size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_BYTES} bytes)` },
        { status: 413 }
      );
    }

    const ext = safeExt(mime, originalName);
    const type = mime.startsWith("video/") ? "VIDEO" : "IMAGE";

    const now = new Date();
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const id = crypto.randomBytes(12).toString("hex");
    const filename = `${id}${ext || ""}`;
    const filepath = path.join(uploadDir, filename);

    const ab = await file.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(ab));

    return NextResponse.json({ url: `/uploads/${folder}/${filename}`, type });
  } catch (err: any) {
    console.error("UPLOAD_ERROR", err);
    return NextResponse.json({ error: err?.message ?? "Upload failed" }, { status: 500 });
  }
}
