"use server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { profile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";

export const loginAction = async (data: any): Promise<any> => {
  try {
    const supabase = await createClient();
    const { email, password } = data;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    const user = await getAuthUser();
    if (!user) {
      throw new Error("User not found");
    }
    const checkUserProfile = await db.query.profile.findFirst({
      where: eq(profile.user_id, user.id),
    });
    return checkUserProfile;
  } catch (error) {
    return error as Error;
  }
};
