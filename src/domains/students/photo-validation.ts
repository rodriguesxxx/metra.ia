export const MAX_STUDENT_PHOTO_BYTES = 5 * 1024 * 1024;

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const mimeByExtension: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

export interface PhotoFileMetadata {
  name: string;
  type: string;
  size: number;
}

export function validateStudentPhoto(file: PhotoFileMetadata): string | undefined {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!file.name || !extension || !allowedExtensions.has(extension)) return "Envie uma imagem JPEG, PNG ou WebP.";
  if (!allowedMimeTypes.has(file.type)) return "Envie uma imagem JPEG, PNG ou WebP.";
  if (mimeByExtension[extension] !== file.type) return "A extensão da imagem não corresponde ao formato informado.";
  if (!Number.isFinite(file.size) || file.size <= 0) return "A imagem está vazia.";
  if (file.size > MAX_STUDENT_PHOTO_BYTES) return "A imagem deve ter no máximo 5 MB.";
  return undefined;
}

/** Lightweight server-side signature guard; the upstream remains responsible for storage validation. */
export function hasExpectedImageSignature(type: string, bytes: Uint8Array): boolean {
  if (type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  if (type === "image/webp") return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}
