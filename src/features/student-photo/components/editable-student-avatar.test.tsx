import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudentIdentity } from "@/domains/students/components/student-identity";
import { EditableStudentAvatar } from "./editable-student-avatar";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function identity(canManagePhoto: boolean) {
  return <StudentIdentity name="Ana Ribeiro" registration="123" courseName="Informática" className="2º A" avatar={<EditableStudentAvatar studentId="ana" name="Ana Ribeiro" canManagePhoto={canManagePhoto} />} />;
}

describe("student identity and editable avatar composition", () => {
  it("keeps profile text and the non-editable initials fallback", () => {
    render(identity(false));
    expect(screen.getByRole("heading", { name: "Ana Ribeiro" })).toBeInTheDocument();
    expect(screen.getByText("Informática · 2º A · Matrícula 123")).toBeInTheDocument();
    expect(screen.getByLabelText("Sem foto cadastrada para Ana Ribeiro")).toHaveTextContent("AR");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps the camera, updates the avatar after upload and displays transient feedback", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ photoUrl: "/api/students/ana/photo", transient: true }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(identity(true));
    expect(screen.getByRole("button", { name: "Alterar foto do estudante" }).querySelector(".student-photo-camera")).not.toBeNull();
    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [new File(["image"], "photo.png", { type: "image/png" })] } });
    expect(await screen.findByRole("status")).toHaveTextContent("Foto atualizada para esta sessão de demonstração.");
    expect(new URL((screen.getByAltText("Foto de Ana Ribeiro") as HTMLImageElement).src).pathname).toBe("/api/students/ana/photo");
    expect(fetchMock).toHaveBeenCalledWith("/api/students/ana/photo", expect.objectContaining({ method: "POST", cache: "no-store", body: expect.any(FormData) }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Alterar foto do estudante" })).toBeEnabled());
  });

  it("shows validation feedback without submitting unsupported files", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(identity(true));
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [new File(["text"], "note.txt", { type: "text/plain" })] } });
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Sem foto cadastrada para Ana Ribeiro")).toHaveTextContent("AR");
  });
});
