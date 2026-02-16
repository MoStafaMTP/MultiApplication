import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export async function saveUploadedFile(file: any, opts: any = {}) {
  const dir =
    opts?.dir ??
    process.env.UPLOAD_DIR ??
    path.join(process.cwd(), "uploads");

  await fs.mkdir(dir, { recursive: true });

  const ab = await file.arrayBuffer();
  const buf = Buffer.from(ab);

  const original = file?.name ?? "upload.bin";
  const ext = path.extname(original) || ".bin";
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const fullPath = path.join(dir, name);

  await fs.writeFile(fullPath, buf);

  return {
    filename: name,
    path: fullPath,
    size: buf.length,
    mime: file?.type ?? "application/octet-stream",
  };
}

// --- v2 additions: admin media listing ---

export type MediaItem = {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
};

/**
 * Lists files under /public/uploads (recursively is not required).
 * Returns newest-first. Safe to call even if the folder doesn't exist.
 */
export async function listMedia(): Promise<MediaItem[]> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    const entries = await fs.readdir(uploadDir, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile()).map((e) => e.name);

    const items: MediaItem[] = [];
    for (const name of files) {
      const full = path.join(uploadDir, name);
      const st = await fs.stat(full);
      items.push({
        name,
        url: `/uploads/${encodeURIComponent(name)}`,
        size: st.size,
        modifiedAt: st.mtime.toISOString(),
      });
    }

    items.sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1));
    return items;
  } catch {
    return [];
  }
}
