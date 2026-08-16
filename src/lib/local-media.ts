import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export const readLocalMedia = async (path: string, root = process.env.LOCAL_MEDIA_ROOT || "/app/media") => {
  if (!path || path.startsWith("/") || path.includes("\\") || path.includes("\0")) return null;
  const segments = path.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return null;
  const absoluteRoot = resolve(root);
  const absolutePath = resolve(absoluteRoot, ...segments);
  if (!absolutePath.startsWith(`${absoluteRoot}${sep}`)) return null;
  try {
    const body = await readFile(absolutePath);
    return { body, contentType: contentTypes[extname(absolutePath).toLowerCase()] || "application/octet-stream" };
  } catch {
    return null;
  }
};
