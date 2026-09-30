import type { ReactNode } from "react";

export function StudentIdentity({ name, registration, courseName, className, avatar }: { name: string; registration: string; courseName?: string; className?: string; avatar: ReactNode }) {
  return <section className="card section" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
    {avatar}
    <div style={{ flex: "1 1 15rem" }}><h1 style={{ fontSize: "clamp(1.7rem, 2.5vw, 2.5rem)" }}>{name}</h1><p className="lede" style={{ marginTop: ".3rem" }}>{[courseName, className, `Matrícula ${registration}`].filter(Boolean).join(" · ")}</p></div>
  </section>;
}
