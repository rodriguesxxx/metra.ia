"use client";

import { useState } from "react";
import Image from "next/image";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function StudentAvatar({ name, photoUrl, size = 88 }: { name: string; photoUrl?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const hasPhoto = Boolean(photoUrl) && !failed;
  return <span aria-label={hasPhoto ? `Foto de ${name}` : `Sem foto cadastrada para ${name}`} style={{ display: "inline-grid", width: size, height: size, flex: "none", placeItems: "center", overflow: "hidden", borderRadius: "50%", background: "linear-gradient(135deg, #d9d5ff, #aaf2d3)", color: "#27225d", fontSize: Math.max(16, Math.round(size / 3)), fontWeight: 800 }}>
    {hasPhoto ? <Image src={photoUrl!} alt={`Foto de ${name}`} width={size} height={size} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setFailed(true)} /> : initials(name)}
  </span>;
}
