import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { requireAdmin } from "../_requireAdmin";

export const runtime = "nodejs";

// Map MIME types to safe extensions. Fallback is taken from original filename.
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

// Turn an arbitrary filename into something safe for the filesystem/URL.
function safeBasename(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-zA-Z0-9._-]+/g, "-") // replace spaces and unsafe chars
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^[-.]+|[-.]+$/g, ""); // trim leading/trailing dots/dashes
  return (base || "file").slice(0, 80);
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

  // Try to keep the original filename (sanitized). If a file with the same
  // name and size already exists, reuse it instead of uploading a duplicate.
  const originalName = file.name || "upload";
  const originalBase = path.basename(originalName, path.extname(originalName));
  const safeBase = safeBasename(originalBase);

  async function fileExists(p: string) {
    try {
      const stat = await fs.stat(p);
      return stat.isFile() ? stat : null;
    } catch {
      return null;
    }
  }

  let filename = `${safeBase}${ext}`;
  let filepath = path.join(uploadDir, filename);

  const existing = await fileExists(filepath);
  if (existing && existing.size === file.size) {
    const url = `/uploads/${folder}/${filename}`;
    return NextResponse.json({ url, type });
  }

  if (existing && existing.size !== file.size) {
    // Find a unique filename with a numeric suffix.
    let i = 1;
    // Limit the loop to a reasonable number just in case.
    while (i < 1000) {
      const candidate = `${safeBase}-${i}${ext}`;
      const candidatePath = path.join(uploadDir, candidate);
      const st = await fileExists(candidatePath);
      if (!st) {
        filename = candidate;
        filepath = candidatePath;
        break;
      }
      if (st.size === file.size) {
        // Same name + same size -> treat as duplicate.
        const url = `/uploads/${folder}/${candidate}`;
        return NextResponse.json({ url, type });
      }
      i++;
    }
  }

  const ab = await file.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(ab));

  const url = `/uploads/${folder}/${filename}`;
  return NextResponse.json({ url, type });
}
