"use server";

import { db } from "@/lib/db";
import { profile } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";

interface CreateProfileProps {
  id: string;
  name: string;
  role: string;
  user_id: string;
}

export const createProfile = async (
  user_id: string,
  data: any
): Promise<CreateProfileProps | null> => {
  try {
    const supabase = await createClient();
    const user = await getAuthUser();

    const result = await db
      .insert(profile)
      .values({ user_id, ...data })
      .returning();

    const displayName = user?.user_metadata?.display_name;

    if (!displayName) {
      await supabase.auth.updateUser({
        data: {
          display_name: data.name,
        },
      });
    }
    return result[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};
