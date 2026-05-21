import { NextRequest } from "next/server";

export function isAdmin(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookie = request.cookies.get("admin_token")?.value;
  return bearer === secret || cookie === secret;
}
