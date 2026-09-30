import { logout } from "@/services/server/auth/logout";

export async function POST(request: Request) {
  return logout(request);
}
