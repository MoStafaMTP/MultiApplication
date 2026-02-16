import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { requireAdmin } from "@/app/api/admin/_requireAdmin";

export const runtime = "nodejs";

type FileLike = {
  name?: string;
  type?: string;
  size?: number;
  arrayBuffer?: () => Promise<ArrayBuffer>;
};

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
  if (byMime[mime]) return byMime[mime];
  const o = path.extname(original || "");
  return o && o.length <= 10 ? o : "";
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file") as unknown as FileLike;

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const size = typeof file.size === "number" ? file.size : 0;
    const max = Number(process.env.UPLOAD_MAX_BYTES || 50 * 1024 * 1024); // 50MB default
    if (size > max) {
      return NextResponse.json(
        { error: `File too large. Max is ${Math.floor(max / (1024 * 1024))}MB` },
        { status: 413 }
      );
    }

    const mime = file.type || "application/octet-stream";
    const originalName = file.name || "upload";
    const ext = safeExt(mime, originalName);
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
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}

