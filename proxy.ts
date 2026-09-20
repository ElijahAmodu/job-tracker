import { updateSession } from "./lib/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  console.log("PROXY HIT:", request.nextUrl.pathname);
  const response = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
