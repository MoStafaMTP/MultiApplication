import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { requireAdmin } from "../_requireAdmin";

export const runtime = "nodejs";

type MediaItem = {
  url: string;
  name: string;
  size: number;
  type: "IMAGE" | "VIDEO";
  date: string;
};

async function scanDirectory(dir: string, baseUrl: string): Promise<MediaItem[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const promises: Promise<MediaItem | MediaItem[]>[] = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        promises.push(scanDirectory(fullPath, `${baseUrl}/${entry.name}`));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const isImage = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
        const isVideo = [".mp4", ".webm", ".mov"].includes(ext);
        if (isImage || isVideo) {
          promises.push(
            fs.stat(fullPath).then((stat) => {
              const relativePath = path.relative(path.join(process.cwd(), "public"), fullPath);
              return {
                url: `/${relativePath.replace(/\\/g, "/")}`,
                name: entry.name,
                size: stat.size,
                type: (isVideo ? "VIDEO" : "IMAGE") as "IMAGE" | "VIDEO",
                date: stat.mtime.toISOString(),
              };
            })
          );
        }
      }
    }
    
    const results = await Promise.all(promises);
    return results.flat();
  } catch (err) {
    console.error(`Error scanning ${dir}:`, err);
    return [];
  }
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.access(uploadsDir);
  } catch {
    return NextResponse.json([]);
  }

  const items = await scanDirectory(uploadsDir, "/uploads");
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(items);
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  if (!fileUrl) return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });

  if (!fileUrl.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  // Normalize the URL to a filesystem path under public/. Leading slashes would
  // otherwise cause path.join to ignore the base segments.
  const relativeUrl = fileUrl.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", relativeUrl);
  const normalizedPath = path.normalize(filePath);
  const publicDir = path.join(process.cwd(), "public");

  if (!normalizedPath.startsWith(publicDir)) {
    return NextResponse.json({ error: "Path traversal not allowed" }, { status: 400 });
  }

  try {
    await fs.unlink(normalizedPath);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

