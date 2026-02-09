import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { requireAdmin } from "@/app/api/admin/_requireAdmin";

export const runtime = "nodejs";

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
  return o && o.length <= 6 ? o : "";
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const mime = file.type || "application/octet-stream";
  const ext = safeExt(mime, file.name);
  const type = mime.startsWith("video/") ? "VIDEO" : "IMAGE";

  const now = new Date();
  const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const id = crypto.randomBytes(12).toString("hex");
  const filename = `${id}${ext}`;
  const filepath = path.join(uploadDir, filename);

  const ab = await file.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(ab));

  const url = `/uploads/${folder}/${filename}`;
  return NextResponse.json({ url, type });
}
