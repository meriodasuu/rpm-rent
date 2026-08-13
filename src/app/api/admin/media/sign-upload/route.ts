import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { buildAdminMediaPath, storageMediaUrl, validateAdminMediaFile, type AdminMediaOwnerType } from "@/lib/admin-media";
import { createSignedUpload } from "@/lib/supabase-storage";

export async function POST(request: Request) {
  if (!await getAdminSession()) return NextResponse.json({ message: "Требуется вход" }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const ownerType = body.ownerType;
    const ownerId = typeof body.ownerId === "string" ? body.ownerId : "";
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
    const size = typeof body.size === "number" ? body.size : Number.NaN;
    if (ownerType !== "cars" && ownerType !== "locations") return NextResponse.json({ message: "Некорректный тип карточки" }, { status: 400 });
    const validation = validateAdminMediaFile({ mimeType, size });
    if (!validation.ok) return NextResponse.json({ message: validation.error }, { status: 400 });
    const path = buildAdminMediaPath(ownerType as AdminMediaOwnerType, ownerId, mimeType);
    const signed = await createSignedUpload(path);
    return NextResponse.json({ ...signed, path, mediaUrl: storageMediaUrl(path) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось подготовить загрузку";
    const clientError = /Некорректный|Неподдерживаемый/.test(message);
    return NextResponse.json({ message: clientError ? message : "Не удалось подготовить загрузку" }, { status: clientError ? 400 : 500 });
  }
}
