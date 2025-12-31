import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/isi-profile";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let redirectPath = next;

      if (user) {
        const existingProfile = await db
          .select()
          .from(profile)
          .where(eq(profile.user_id, user.id));

        if (existingProfile.length === 0) {
          redirectPath = "/isi-profile";
        }
        if (existingProfile.length > 0) {
          if (existingProfile[0].role === "guru") {
            redirectPath = "/guru";
          } else {
            redirectPath = "/siswa";
          }
        }
      }

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
