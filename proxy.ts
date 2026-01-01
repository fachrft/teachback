import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { getAuthUser } from "@/lib/auth/get-user";
import { profile } from "./lib/db/schema";
import { db } from "./lib/db";
import { eq } from "drizzle-orm";

export async function proxy(request: NextRequest) {
  const authUser = await getAuthUser();
  const path = request.nextUrl.pathname;
  const isPublicPath =
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/auth");

  if (!authUser) {
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const profileRes = await db
    .select()
    .from(profile)
    .where(eq(profile.user_id, authUser.id));

  if (!profileRes.length) return NextResponse.next();

  const { role } = profileRes[0];

  if (!role) return NextResponse.next();

  if (role === "guru") {
    if (path.startsWith("/siswa") || isPublicPath) {
      return NextResponse.redirect(new URL("/guru", request.url));
    }
  }

  if (role === "siswa") {
    if (path.startsWith("/guru") || isPublicPath) {
      return NextResponse.redirect(new URL("/siswa", request.url));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
