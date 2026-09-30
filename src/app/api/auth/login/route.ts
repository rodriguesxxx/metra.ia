import { login } from "@/services/server/auth/login";

export async function POST(request: Request) {
  return login(request);
}
