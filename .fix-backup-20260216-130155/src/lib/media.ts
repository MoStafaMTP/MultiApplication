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
